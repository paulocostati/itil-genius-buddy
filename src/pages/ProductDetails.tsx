import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, PlayCircle, Lock, BookOpen, Clock, AlertCircle, ListFilter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ProductDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const { data: product, isLoading, error } = useQuery({
        queryKey: ['product', slug],
        queryFn: async () => {
            const { data, error } = await (supabase.from as any)('products')
                .select('*, categories(id, name, vendors(name))')
                .eq('slug', slug)
                .single();

            if (error) throw error;
            return data;
        }
    });

    // Get actual question count from the database
    const { data: actualQuestionCount } = useQuery({
        queryKey: ['product-question-count', product?.category_id],
        enabled: !!product?.category_id,
        queryFn: async () => {
            const { data: topicsData } = await (supabase.from as any)('topics')
                .select('id')
                .eq('category_id', product.category_id);
            const topicIds = topicsData?.map((t: any) => t.id) || [];
            if (topicIds.length === 0) return 0;
            const { data: count } = await (supabase.rpc as any)('count_questions_by_topics', { topic_ids: topicIds });
            return count !== null ? Number(count) : null;
        }
    });

    // Check if user has active entitlement
    const { data: entitlement } = useQuery({
        queryKey: ['entitlement', product?.id],
        enabled: !!product?.id && !!user,
        queryFn: async () => {
            const { data } = await (supabase.from as any)('entitlements')
                .select('*')
                .eq('user_id', user!.id)
                .eq('product_id', product.id)
                .eq('status', 'ACTIVE')
                .single();
            return data;
        }
    });

    const formatPrice = (cents: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(cents / 100);
    };

    if (isLoading) {
        return (
            <div className="container py-10">
                <Skeleton className="h-10 w-2/3 mb-4" />
                <Skeleton className="h-6 w-1/3 mb-8" />
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-60 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container py-10 text-center">
                <h2 className="text-2xl font-bold">Produto não encontrado</h2>
                <Button onClick={() => navigate('/catalog')} className="mt-4">
                    Voltar ao Catálogo
                </Button>
            </div>
        );
    }

    // Cast features to string array carefully
    const featuresList = Array.isArray(product.features)
        ? product.features.map(String)
        : [];

    return (
        <div className="container py-10">
            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Badge>{product.technology || 'Tecnologia'}</Badge>
                            <Badge variant="outline">{product.level || 'Geral'}</Badge>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight mb-4 text-primary">
                            {product.title}
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            {product.description}
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>O que está incluído</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <h4 className="font-medium">Banco de Questões</h4>
                                        <p className="text-sm text-muted-foreground">{actualQuestionCount ?? product.question_count ?? 40} questões atualizadas</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <h4 className="font-medium">Simulação Real</h4>
                                        <p className="text-sm text-muted-foreground">Tempo cronometrado ({product.duration_minutes || 60} min)</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <h4 className="font-medium">Explicações Detalhadas</h4>
                                        <p className="text-sm text-muted-foreground">Entenda o porquê de cada resposta</p>
                                    </div>
                                </div>
                            </div>

                            {featuresList.length > 0 && (
                                <>
                                    <Separator className="my-4" />
                                    <ul className="space-y-2">
                                        {featuresList.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm">
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar / CTA */}
                <div className="space-y-6">
                    <Card className="border-2 border-primary/20 sticky top-24">
                        <CardHeader className="bg-primary/5 pb-4">
                            <span className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Investimento</span>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-3xl font-bold">{formatPrice(product.price_cents)}</span>
                                <span className="text-sm text-muted-foreground">/ acesso vitalício</span>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            {entitlement ? (
                                <div className="space-y-3">
                                    <Button className="w-full text-lg h-12" onClick={async () => {
                                        try {
                                            const { startExam } = await import("@/lib/exam-starter");
                                            const examId = await startExam(user.id, product.id, product.slug);
                                            navigate(`/exam/${examId}`);
                                        } catch (e: any) {
                                            const msg = e?.message?.includes("No questions") 
                                                ? "Este exame ainda não possui questões cadastradas." 
                                                : "Erro ao iniciar simulado";
                                            toast.error(msg);
                                        }
                                    }}>
                                        <PlayCircle className="mr-2 h-5 w-5" />
                                        Começar Simulado Real
                                    </Button>

                                    <Button variant="outline" className="w-full text-lg h-12" onClick={() => navigate(`/practice?category=${product.category_id}`)}>
                                        <ListFilter className="mr-2 h-5 w-5" />
                                        Praticar por Tópicos
                                    </Button>
                                </div>
                            ) : (
                                <Button className="w-full text-lg h-12 shadow-lg" onClick={() => navigate(`/checkout/${product.slug}`)}>
                                    Comprar Agora
                                </Button>
                            )}

                            {product.is_demo_available && !entitlement && (
                                <Button variant="outline" className="w-full" onClick={async () => {
                                    try {
                                        if (!user) {
                                            toast.error("Faça login para testar o demo");
                                            navigate(`/auth?next=/product/${product.slug}`);
                                            return;
                                        }
                                        const { startExam } = await import("@/lib/exam-starter");
                                        const examId = await startExam(user.id, product.id, product.slug, true);
                                        navigate(`/exam/${examId}`);
                                    } catch (e: any) {
                                        console.error(e);
                                        const msg = e?.message?.includes("No questions") 
                                            ? "Este exame ainda não possui questões cadastradas." 
                                            : "Erro ao iniciar demo";
                                        toast.error(msg);
                                    }
                                }}>
                                    Experimentar Demo Grátis
                                </Button>
                            )}

                            <div className="text-xs text-muted-foreground text-center mt-4 space-y-1">
                                <p className="flex items-center justify-center gap-1">
                                    <Lock className="h-3 w-3" /> Pagamento seguro via Pix
                                </p>
                                <p>Liberação em até 24h após envio do comprovante</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
