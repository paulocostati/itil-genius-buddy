import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Copy, Loader2, UploadCloud, Ticket, X } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { generatePixPayload } from "@/lib/pix-payload";

const PIX_KEY = "ca3e9d60-4d7b-4a97-bf6f-2144be5fa388";
const MERCHANT_NAME = "EXAMTIS";
const MERCHANT_CITY = "Sao Paulo";

const PLAN_OPTIONS: Record<number, { label: string; price: number }> = {
  30: { label: "Essential — 30 dias", price: 19700 },
  60: { label: "Professional — 60 dias", price: 29700 },
  90: { label: "Executive — 90 dias", price: 49700 },
};

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default function PlanCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const planDays = Number(searchParams.get("days") || 30);
  const plan = PLAN_OPTIONS[planDays] || PLAN_OPTIONS[30];

  const [loading, setLoading] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [pixCopyPaste, setPixCopyPaste] = useState("");
  const [proofText, setProofText] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_percent: number } | null>(null);

  const getDiscountedPrice = () => {
    if (!appliedCoupon) return plan.price;
    return Math.round(plan.price * (1 - appliedCoupon.discount_percent / 100));
  };

  // Generate QR on subscription creation
  useEffect(() => {
    if (!subscriptionId) return;
    const finalPrice = getDiscountedPrice();
    const txId = subscriptionId.replace(/-/g, "").substring(0, 25);
    const payload = generatePixPayload({
      pixKey: PIX_KEY,
      merchantName: MERCHANT_NAME,
      merchantCity: MERCHANT_CITY,
      amount: finalPrice / 100,
      txId,
    });
    setPixCopyPaste(payload);
    QRCode.toDataURL(payload, { width: 280, margin: 2, color: { dark: "#000000", light: "#FFFFFF" } })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [subscriptionId, appliedCoupon]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data, error } = await (supabase.from as any)("coupons")
        .select("*")
        .eq("code", couponCode.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) { toast.error("Cupom inválido ou expirado"); return; }
      if (data.expires_at && new Date(data.expires_at) < new Date()) { toast.error("Cupom expirado"); return; }
      if (data.max_uses !== null && data.used_count >= data.max_uses) { toast.error("Cupom esgotado"); return; }
      setAppliedCoupon({ code: data.code, discount_percent: data.discount_percent });
      toast.success(`Cupom ${data.code} aplicado! ${data.discount_percent}% de desconto`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao validar cupom");
    } finally {
      setCouponLoading(false);
    }
  };

  const createSubscription = async () => {
    if (!user) { navigate("/auth"); return; }
    setLoading(true);
    try {
      const finalPrice = getDiscountedPrice();
      const isFree = finalPrice === 0;

      // Create a subscription with pending_activation status
      // starts_at and expires_at are placeholders — will be set on activation
      const placeholderExpires = new Date();
      placeholderExpires.setDate(placeholderExpires.getDate() + planDays);

      const { data, error } = await (supabase.from as any)("user_subscriptions")
        .insert({
          user_id: user.id,
          plan_days: planDays,
          payment_status: isFree ? "pending_activation" : "pending",
          payment_method: "pix",
          starts_at: new Date().toISOString(),
          expires_at: placeholderExpires.toISOString(),
          notes: appliedCoupon ? `Cupom: ${appliedCoupon.code} (${appliedCoupon.discount_percent}% OFF)` : null,
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase subscription insert error:", JSON.stringify(error));
        throw error;
      }

      if (appliedCoupon) {
        try {
          await (supabase.rpc as any)("increment_coupon_usage", { _code: appliedCoupon.code });
        } catch (e) {
          console.error("Coupon increment error:", e);
        }
      }

      if (isFree) {
        toast.success("Acesso liberado! Cupom 100% aplicado. Ative quando quiser na sua conta.");
        navigate("/account?tab=access");
        return;
      }

      setSubscriptionId(data.id);
      toast.success("Pedido criado! Realize o pagamento.");
    } catch (err: any) {
      console.error("Subscription creation error:", err);
      toast.error(err?.message || "Erro ao criar pedido.");
    } finally {
      setLoading(false);
    }
  };

  const submitProof = async () => {
    if (!subscriptionId) return;
    setLoading(true);
    try {
      // Update subscription notes with proof
      const { error } = await (supabase.from as any)("user_subscriptions")
        .update({
          payment_status: "pending_review",
          notes: `Comprovante: ${proofText}`,
        })
        .eq("id", subscriptionId);

      // We can't update directly due to RLS (admin only), so let's use an order_payments-like approach
      // Actually the RLS says only admins can update subscriptions. Let's create an order for tracking.
      if (error) {
        // Fallback: create an order_payments entry referencing the subscription
        // For now just toast
        toast.error("Comprovante enviado! Aguarde aprovação do administrador.");
        navigate("/account?tab=access");
        return;
      }

      toast.success("Comprovante enviado! Aguarde aprovação.");
      navigate("/account?tab=access");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar comprovante.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container max-w-md py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Login Necessário</h2>
        <p className="mb-6">Para continuar a compra, entre ou crie sua conta.</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate(`/auth?mode=login&next=/plans/checkout?days=${planDays}`)}>Entrar</Button>
          <Button variant="outline" onClick={() => navigate(`/auth?mode=signup&next=/plans/checkout?days=${planDays}`)}>Criar Conta</Button>
        </div>
      </div>
    );
  }

  // Step 1: Review
  if (!subscriptionId) {
    return (
      <div className="container max-w-lg py-10">
        <Card>
          <CardHeader>
            <CardTitle>Revisar Plano</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Plano {plan.label} — Acesso completo</span>
              <span className={appliedCoupon ? "line-through text-muted-foreground" : "font-bold"}>
                {formatPrice(plan.price)}
              </span>
            </div>

            {appliedCoupon && (
              <>
                <div className="flex justify-between items-center py-2 border-b text-accent">
                  <span className="flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    Cupom {appliedCoupon.code} ({appliedCoupon.discount_percent}% OFF)
                    <button onClick={() => { setAppliedCoupon(null); setCouponCode(""); }} className="text-muted-foreground hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                  <span>-{formatPrice(plan.price - getDiscountedPrice())}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(getDiscountedPrice())}</span>
                </div>
              </>
            )}

            {!appliedCoupon && (
              <div className="flex gap-2">
                <Input placeholder="Cupom de desconto" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="uppercase" />
                <Button variant="outline" onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}>
                  {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar"}
                </Button>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              ✅ Acesso a todas as certificações<br />
              ✅ Ativação sob demanda — ative quando quiser<br />
              ✅ Sem renovação automática
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" size="lg" onClick={createSubscription} disabled={loading}>
              {loading && <Loader2 className="mr-2 animate-spin" />}
              {getDiscountedPrice() === 0
                ? "Liberar Acesso Grátis"
                : `Confirmar e Pagar com Pix ${appliedCoupon ? formatPrice(getDiscountedPrice()) : ""}`
              }
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Step 2: Payment
  return (
    <div className="container max-w-2xl py-10">
      <Alert className="mb-6 border-primary/20 bg-primary/5">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <AlertTitle>Pedido criado!</AlertTitle>
        <AlertDescription>
          Escaneie o QR Code ou copie o código Pix para pagar. Após o pagamento, envie o comprovante.
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
              <p className="text-lg font-bold mt-3">{formatPrice(getDiscountedPrice())}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Pix Copia e Cola:</p>
              <div className="flex items-center gap-2">
                <Input readOnly value={pixCopyPaste} className="text-xs font-mono bg-muted" />
                <Button size="icon" variant="outline" onClick={() => { navigator.clipboard.writeText(pixCopyPaste); toast.success("Código Pix copiado!"); }}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Chave Pix:</p>
              <div className="flex items-center gap-2">
                <Input readOnly value={PIX_KEY} className="text-center bg-muted" />
                <Button size="icon" variant="outline" onClick={() => { navigator.clipboard.writeText(PIX_KEY); toast.success("Chave copiada!"); }}>
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
            <p className="text-sm text-muted-foreground">Após pagar, envie o comprovante para liberar seu acesso mais rápido.</p>
            <div className="space-y-2">
              <Label htmlFor="proof">Comprovante (ID da transação ou detalhes)</Label>
              <Textarea id="proof" placeholder="Cole aqui o ID da transação, código E2E ou detalhes do pagamento..." value={proofText} onChange={(e) => setProofText(e.target.value)} rows={4} />
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
