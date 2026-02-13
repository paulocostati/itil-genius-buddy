import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, CheckCircle, Clock, Play } from "lucide-react";
import { toast } from "sonner";

export default function Account() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Fetch subscriptions
    const { data: subscriptions, isLoading: isLoadingSubs } = useQuery({
        queryKey: ['subscriptions', user?.id],
        enabled: !!user,
        queryFn: async () => {
            const { data, error } = await (supabase.from as any)('user_subscriptions')
                .select('*')
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data;
        }
    });

    const activateSubscription = async (subId: string) => {
        try {
            const { error } = await (supabase.rpc as any)('activate_subscription', {
                _subscription_id: subId,
                _user_id: user!.id,
            });
            if (error) throw error;
            toast.success("Acesso ativado! Bons estudos! 🎉");
            queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Erro ao ativar acesso");
        }
    };

    const { data: entitlements, isLoading } = useQuery({
        queryKey: ['entitlements', user?.id],
        enabled: !!user,
        queryFn: async () => {
            // Join with products
            const { data, error } = await (supabase.from as any)('entitlements')
                .select('*, products (*)')
                .eq('user_id', user!.id);

            if (error) throw error;
            return data;
        }
    });

    const { data: orders, isLoading: isLoadingOrders } = useQuery({
        queryKey: ['orders', user?.id],
        enabled: !!user,
        queryFn: async () => {
            const { data, error } = await (supabase.from as any)('orders')
                .select('*, products (*)')
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        }
    });

    const { data: exams, isLoading: isLoadingExams } = useQuery({
        queryKey: ['exams', user?.id],
        enabled: !!user,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('exams')
                .select('*')
                .eq('user_id', user!.id)
                .order('started_at', { ascending: false });
            if (error) throw error;
            return data;
        }
    });

    if (!user) {
        return (
            <div className="container py-20 text-center">
                <p>Você precisa estar logado para ver seus acessos.</p>
                <Button onClick={() => navigate('/auth?mode=login')} className="mt-4">Login</Button>
            </div>
        );
    }

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-2">Minha Conta</h1>
            <p className="text-muted-foreground mb-8">Gerencie seus simulados e pedidos</p>

            <Tabs defaultValue="subscription">
                <TabsList className="mb-4">
                    <TabsTrigger value="subscription">Meu Plano</TabsTrigger>
                    <TabsTrigger value="access">Meus Acessos</TabsTrigger>
                    <TabsTrigger value="history">Histórico</TabsTrigger>
                    <TabsTrigger value="orders">Pedidos</TabsTrigger>
                    <TabsTrigger value="profile">Perfil</TabsTrigger>
                </TabsList>

                <TabsContent value="subscription" className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Meu Plano de Acesso</h2>
                    {isLoadingSubs ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : !subscriptions?.length ? (
                        <Card>
                            <CardContent className="pt-6 text-center text-muted-foreground">
                                Você ainda não tem nenhum plano.
                                <div className="mt-4">
                                    <Button asChild>
                                        <Link to="/#plans">Ver Planos</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {subscriptions.map((sub: any) => {
                                const isActive = sub.payment_status === 'approved' && new Date(sub.expires_at) > new Date();
                                const isPendingActivation = sub.payment_status === 'pending_activation';
                                const isExpired = sub.payment_status === 'approved' && new Date(sub.expires_at) <= new Date();
                                const isPending = sub.payment_status === 'pending' || sub.payment_status === 'pending_review';

                                return (
                                    <Card key={sub.id} className={`border-l-4 ${isActive ? 'border-l-accent' : isPendingActivation ? 'border-l-primary' : 'border-l-muted'}`}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg">Plano {sub.plan_days} dias</CardTitle>
                                                <Badge variant={isActive ? 'default' : isPendingActivation ? 'outline' : isPending ? 'secondary' : 'destructive'}>
                                                    {isActive ? 'Ativo' : isPendingActivation ? 'Pronto p/ Ativar' : isPending ? 'Aguardando pagamento' : isExpired ? 'Expirado' : sub.payment_status}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {isActive && (
                                                <p className="text-sm text-muted-foreground">
                                                    Expira em: {new Date(sub.expires_at).toLocaleDateString('pt-BR')}
                                                </p>
                                            )}
                                            {isPendingActivation && (
                                                <p className="text-sm text-muted-foreground">
                                                    Seu acesso está pronto! Ative quando quiser iniciar seus {sub.plan_days} dias.
                                                </p>
                                            )}
                                        </CardContent>
                                        {isPendingActivation && (
                                            <CardFooter>
                                                <Button className="w-full gradient-primary text-primary-foreground" onClick={() => activateSubscription(sub.id)}>
                                                    <Play className="mr-2 h-4 w-4" /> Ativar Meu Acesso Agora
                                                </Button>
                                            </CardFooter>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="access" className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Simulados Liberados</h2>
                    {isLoading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : entitlements?.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6 text-center text-muted-foreground">
                                Você ainda não tem simulados ativos.
                                <div className="mt-4">
                                    <Button asChild>
                                        <Link to="/catalog">Ver Catálogo</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {entitlements?.map((entitlement: any) => (
                                <Card key={entitlement.id} className="border-l-4 border-l-primary">
                                    <CardHeader>
                                        <Badge variant={entitlement.status === 'ACTIVE' ? 'default' : 'secondary'} className="w-fit mb-2">
                                            {entitlement.status}
                                        </Badge>
                                        <CardTitle className="line-clamp-2 text-lg">
                                            {entitlement.products?.title || 'Simulado Desconhecido'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">
                                            Acesso liberado em: {new Date(entitlement.starts_at).toLocaleDateString()}
                                        </p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            className="w-full"
                                            disabled={entitlement.status !== 'ACTIVE'}
                                            onClick={async () => {
                                                try {
                                                    // Dynamic import to avoid SSR issues if any, but standard import is fine here
                                                    const { startExam } = await import("@/lib/exam-starter");
                                                    const examId = await startExam(user.id, entitlement.product_id, entitlement.products.slug);
                                                    navigate(`/exam/${examId}`);
                                                } catch (e) {
                                                    console.error(e);
                                                    toast.error("Erro ao iniciar simulado");
                                                }
                                            }}
                                        >
                                            {entitlement.status === 'ACTIVE' ? 'Iniciar Novo Simulado' : 'Indisponível'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="orders">
                    <h2 className="text-xl font-semibold mb-4">Histórico de Pedidos</h2>
                    {isLoadingOrders ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : orders?.length === 0 ? (
                        <p className="text-muted-foreground">Nenhum pedido realizado.</p>
                    ) : (
                        <div className="space-y-3">
                            {orders?.map((order: any) => (
                                <Card key={order.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4">
                                    <div className="space-y-1">
                                        <div className="font-semibold text-lg">{order.products?.title}</div>
                                        <div className="text-sm text-muted-foreground">Order ID: {order.id.slice(0, 8)}...</div>
                                        <div className="text-sm text-muted-foreground">Data: {new Date(order.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                                        <span className="font-bold">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.amount_cents / 100)}
                                        </span>
                                        <Badge variant={
                                            order.status === 'APPROVED' ? 'default' :
                                                order.status === 'PENDING' ? 'outline' :
                                                    order.status === 'PAID_REVIEW' ? 'secondary' : 'destructive'
                                        }>
                                            {order.status === 'PAID_REVIEW' ? 'EM ANÁLISE' :
                                                order.status === 'APPROVED' ? 'APROVADO' :
                                                    order.status === 'PENDING' ? 'PENDENTE' : order.status}
                                        </Badge>
                                        {order.status === 'PENDING' && (
                                            <Button size="sm" variant="outline" asChild>
                                                <Link to="/checkout/pending" state={{ orderId: order.id }}>
                                                    Pagar / Enviar Comprovante
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history">
                    <h2 className="text-xl font-semibold mb-4">Histórico de Simulados</h2>
                    {isLoadingExams ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                    ) : exams?.length === 0 ? (
                        <p className="text-muted-foreground">Nenhum simulado realizado.</p>
                    ) : (
                        <div className="space-y-4">
                            {exams?.map((exam: any) => (
                                <Card key={exam.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate(exam.completed ? `/result/${exam.id}` : `/exam/${exam.id}`)}>
                                    <div className="flex items-center justify-between p-4">
                                        <div>
                                            <div className="font-semibold text-lg">
                                                Simulado {new Date(exam.started_at).toLocaleDateString()}
                                                {exam.is_demo && <Badge variant="outline" className="ml-2 text-xs">Demo</Badge>}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {exam.total_questions} questões • {exam.completed ? 'Finalizado' : 'Em andamento'}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {exam.completed && exam.score !== null && (
                                                <div className={`text-xl font-bold ${(exam.score / exam.total_questions) >= 0.65 ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {Math.round((exam.score / exam.total_questions) * 100)}%
                                                </div>
                                            )}
                                            <Button variant="ghost" size="sm">
                                                {exam.completed ? 'Ver Resultado' : 'Continuar'}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dados Pessoais</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input value={user.email} disabled />
                            </div>
                            <p className="text-sm text-muted-foreground">Para alterar sua senha, use a opção "Esqueci minha senha" na tela de login.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
