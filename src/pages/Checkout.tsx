import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
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

export default function Checkout() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [proofText, setProofText] = useState("");

    // State for manual payment flow
    const [orderId, setOrderId] = useState<string | null>(null);

    // If redirected from pending button, get orderId
    useEffect(() => {
        if (location.state && location.state.orderId) {
            setOrderId(location.state.orderId);
        }
    }, [location]);

    // Fetch product
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

    // Create Order Mutation
    const createOrder = async () => {
        if (!user || !product) {
            toast.error("Erro ao iniciar pedigo. Faça login.");
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

    // Submit Proof Mutation
    const submitProof = async () => {
        if (!orderId) return;

        try {
            setLoading(true);
            // Create payment record
            const { error } = await (supabase.from as any)('order_payments')
                .insert({
                    order_id: orderId,
                    proof_text: proofText,
                });

            if (error) throw error;

            // Update order status
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

    const copyPixKey = () => {
        navigator.clipboard.writeText("00020126360014BR.GOV.BCB.PIX0114+55119999999995204000053039865802BR5913Examtis Inc6009Sao Paulo62070503***6304E8A1");
        toast.success("Chave Pix copiada!");
    };

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
                            <span>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price_cents / 100)}
                            </span>
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
            <Alert className="mb-6 bg-blue-50 border-blue-200">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <AlertTitle>Pedido Pendente #{orderId?.slice(0, 8)}</AlertTitle>
                <AlertDescription>
                    Seu pedido foi gerado. Realize o pagamento Pix abaixo para liberar seu acesso.
                </AlertDescription>
            </Alert>

            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">1. Pagamento Pix</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-muted p-4 rounded-lg flex flex-col items-center">
                            <div className="h-40 w-40 bg-white mb-2 flex items-center justify-center border">
                                {/* QR Code Placeholder */}
                                <span className="text-xs text-muted-foreground">QR CODE AQUI</span>
                            </div>
                            <p className="text-sm font-medium mb-1">Chave Pix (CNPJ/Email/Tel):</p>
                            <div className="flex items-center gap-2 w-full">
                                <Input readOnly value="pix@examtis.shop" className="text-center bg-white" />
                                <Button size="icon" variant="outline" onClick={() => { navigator.clipboard.writeText("pix@examtis.shop"); toast.success("Copiado!"); }}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Valor: <strong>{product ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price_cents / 100) : '...'}</strong>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">2. Confirmar Pagamento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Envie o comprovante para agilizar a liberação. Pode ser o código da transação ou um link.
                        </p>
                        <div className="space-y-2">
                            <Label htmlFor="proof">Comprovante (Texto/Código)</Label>
                            <Textarea
                                id="proof"
                                placeholder="Cole aqui o ID da transação ou detalhes..."
                                value={proofText}
                                onChange={(e) => setProofText(e.target.value)}
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
