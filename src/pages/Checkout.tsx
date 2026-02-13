import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Copy, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { generatePixPayload } from "@/lib/pix-payload";

const PIX_KEY = "ca3e9d60-4d7b-4a97-bf6f-2144be5fa388";
const MERCHANT_NAME = "EXAMTIS";
const MERCHANT_CITY = "Sao Paulo";

export default function Checkout() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [proofText, setProofText] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [pixCopyPaste, setPixCopyPaste] = useState<string>("");

  useEffect(() => {
    if (location.state && location.state.orderId) {
      setOrderId(location.state.orderId);
    }
  }, [location]);

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product-checkout', slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await (supabase.from as any)('products')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data;
    }
  });

  // Generate QR code when orderId and product are available
  useEffect(() => {
    if (!orderId || !product) return;

    const txId = orderId.replace(/-/g, '').substring(0, 25);
    const payload = generatePixPayload({
      pixKey: PIX_KEY,
      merchantName: MERCHANT_NAME,
      merchantCity: MERCHANT_CITY,
      amount: product.price_cents / 100,
      txId,
    });

    setPixCopyPaste(payload);

    QRCode.toDataURL(payload, {
      width: 280,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
    }).then(url => setQrDataUrl(url))
      .catch(err => console.error('QR generation error:', err));
  }, [orderId, product]);

  const createOrder = async () => {
    if (!user || !product) {
      toast.error("Faça login para continuar.");
      navigate("/auth");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await (supabase.from as any)('orders')
        .insert({
          user_id: user.id,
          product_id: product.id,
          amount_cents: product.price_cents,
          status: 'PENDING',
          customer_email: user.email
        })
        .select()
        .single();

      if (error) throw error;
      setOrderId(data.id);
      toast.success("Pedido criado! Realize o pagamento.");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar pedido.");
    } finally {
      setLoading(false);
    }
  };

  const submitProof = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const { error } = await (supabase.from as any)('order_payments')
        .insert({ order_id: orderId, proof_text: proofText });
      if (error) throw error;

      const { error: updateError } = await (supabase.from as any)('orders')
        .update({ status: 'PAID_REVIEW' })
        .eq('id', orderId);
      if (updateError) throw updateError;

      toast.success("Comprovante enviado! Aguarde aprovação.");
      navigate("/account?tab=orders");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar comprovante.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  if (productLoading) return <div className="p-20 text-center">Carregando...</div>;

  if (!user) {
    return (
      <div className="container max-w-md py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Login Necessário</h2>
        <p className="mb-6">Para continuar a compra, entre ou crie sua conta.</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate(`/auth?mode=login&next=/checkout/${slug}`)}>Entrar</Button>
          <Button variant="outline" onClick={() => navigate(`/auth?mode=signup&next=/checkout/${slug}`)}>Criar Conta</Button>
        </div>
      </div>
    );
  }

  // STEP 1: CONFIRM ORDER
  if (!orderId && product) {
    return (
      <div className="container max-w-lg py-10">
        <Card>
          <CardHeader>
            <CardTitle>Revisar Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">{product.title}</span>
              <span>{formatPrice(product.price_cents)}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Acesso vitalício ao banco de questões e atualizações.
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg" onClick={createOrder} disabled={loading}>
              {loading ? <Loader2 className="mr-2 animate-spin" /> : null}
              Confirmar e Pagar com Pix
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // STEP 2: PAYMENT & PROOF
  return (
    <div className="container max-w-2xl py-10">
      <Alert className="mb-6 border-primary/20 bg-primary/5">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <AlertTitle>Pedido #{orderId?.slice(0, 8)}</AlertTitle>
        <AlertDescription>
          Escaneie o QR Code ou copie o código Pix para realizar o pagamento.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">1. Pagamento Pix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code PIX" className="w-[280px] h-[280px] rounded-lg border" />
              ) : (
                <div className="w-[280px] h-[280px] bg-muted rounded-lg flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              <p className="text-lg font-bold mt-3">
                {product ? formatPrice(product.price_cents) : '...'}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Pix Copia e Cola:</p>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={pixCopyPaste}
                  className="text-xs font-mono bg-muted"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(pixCopyPaste);
                    toast.success("Código Pix copiado!");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">Chave Pix:</p>
              <div className="flex items-center gap-2">
                <Input readOnly value={PIX_KEY} className="text-center bg-muted" />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(PIX_KEY);
                    toast.success("Chave copiada!");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">2. Confirmar Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Após pagar, envie o comprovante para liberar seu acesso mais rápido.
            </p>
            <div className="space-y-2">
              <Label htmlFor="proof">Comprovante (ID da transação ou detalhes)</Label>
              <Textarea
                id="proof"
                placeholder="Cole aqui o ID da transação, código E2E ou detalhes do pagamento..."
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={submitProof} disabled={loading || !proofText}>
              {loading ? <Loader2 className="mr-2 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
              Enviar Comprovante
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
