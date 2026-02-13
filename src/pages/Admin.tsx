import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle, XCircle, FileText, Upload, Loader2
} from 'lucide-react';
import { toast } from "sonner";
import QuestionPreviewTable from '@/components/QuestionPreviewTable';
import VendorManager from '@/components/admin/VendorManager';
import CategoryManager from '@/components/admin/CategoryManager';
import ProductManager from '@/components/admin/ProductManager';
import TopicManager from '@/components/admin/TopicManager';
import UserManager from '@/components/admin/UserManager';
import CouponManager from '@/components/admin/CouponManager';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AdminOrder {
  id: string;
  user_id: string;
  product_id: string;
  status: string;
  amount_cents: number;
  created_at: string;
  customer_email: string;
  products: { title: string };
  order_payments: { proof_text: string | null; proof_url: string | null; created_at: string }[];
}

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // PDF import state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState<any[] | null>(null);
  const [extractedTopics, setExtractedTopics] = useState<any[]>([]);
  const [importCategoryId, setImportCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<{ id: string; name: string; vendors?: { name: string } }[]>([]);

  // Translation state
  const [translateCategoryId, setTranslateCategoryId] = useState<string>('');
  const [translateLang, setTranslateLang] = useState<string>('pt-BR');
  const [translating, setTranslating] = useState(false);
  const [translateProgress, setTranslateProgress] = useState({ current: 0, total: 0 });

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase.from as any)('orders')
      .select('*, products (title), order_payments (*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Erro ao carregar pedidos");
    } else {
      setOrders(data as unknown as AdminOrder[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    (supabase.rpc as any)('has_role', { _user_id: user.id, _role: 'admin' })
      .then(({ data }: { data: boolean }) => {
        if (!data) { navigate('/'); return; }
        loadOrders();
        // Load categories for import selector
        (supabase.from as any)('categories').select('id, name, vendors(name)').order('name')
          .then(({ data: catData }: any) => setCategories(catData || []));
      });
  }, [user, navigate, loadOrders]);

  async function handleApprove(order: AdminOrder) {
    try {
      const { error: orderError } = await (supabase.from as any)('orders')
        .update({ status: 'APPROVED' }).eq('id', order.id);
      if (orderError) throw orderError;

      const { error: entError } = await (supabase.from as any)('entitlements')
        .insert({ user_id: order.user_id, product_id: order.product_id, source_order_id: order.id, status: 'ACTIVE', starts_at: new Date().toISOString() });
      if (entError) throw entError;

      toast.success(`Pedido ${order.id.slice(0, 8)} aprovado!`);
      loadOrders();
    } catch (e) {
      console.error(e);
      toast.error("Erro ao aprovar pedido");
    }
  }

  async function handleReject(orderId: string) {
    try {
      const { error } = await (supabase.from as any)('orders')
        .update({ status: 'REJECTED' }).eq('id', orderId);
      if (error) throw error;
      toast.info(`Pedido ${orderId.slice(0, 8)} rejeitado.`);
      loadOrders();
    } catch (e) {
      toast.error("Erro ao rejeitar");
    }
  }

  async function handleExtractQuestions() {
    if (!pdfFile) return;
    
    // Validate file size (max 20MB)
    if (pdfFile.size > 20 * 1024 * 1024) {
      toast.error("O arquivo é muito grande. O limite é 20MB.");
      return;
    }
    
    setExtracting(true);
    setExtractedQuestions(null);

    try {
      const filePath = `imports/${Date.now()}_${pdfFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('admin-uploads')
        .upload(filePath, pdfFile);

      if (uploadError) throw uploadError;

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 300000); // 5 min timeout
      
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ filePath, categoryId: importCategoryId || undefined }),
        signal: controller.signal,
      });
      
      clearTimeout(timeout);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Falha na extração');
      }

      const data = await res.json();
      setExtractedQuestions(data.questions);
      setExtractedTopics(data.topics);
      toast.success(`${data.questions.length} questões extraídas!`);
    } catch (e: any) {
      console.error(e);
      if (e.name === 'AbortError') {
        toast.error("Timeout: o PDF é muito grande. Tente dividir em partes menores.");
      } else {
        toast.error(e.message || "Erro ao extrair questões");
      }
    } finally {
      setExtracting(false);
    }
  }

  async function handleTranslate() {
    if (!translateCategoryId) {
      toast.error("Selecione uma categoria");
      return;
    }
    setTranslating(true);
    setTranslateProgress({ current: 0, total: 0 });

    try {
      // Get topics for the category
      const { data: catTopics } = await (supabase.from as any)('topics')
        .select('id').eq('category_id', translateCategoryId);
      
      if (!catTopics || catTopics.length === 0) {
        toast.error("Nenhum tópico encontrado para esta categoria");
        setTranslating(false);
        return;
      }

      const topicIds = catTopics.map((t: any) => t.id);
      const { data: questions } = await (supabase.from as any)('questions')
        .select('id').in('topic_id', topicIds);

      if (!questions || questions.length === 0) {
        toast.error("Nenhuma questão encontrada");
        setTranslating(false);
        return;
      }

      const allIds = questions.map((q: any) => q.id);
      setTranslateProgress({ current: 0, total: allIds.length });

      // Process in batches of 20
      const batchSize = 20;
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      for (let i = 0; i < allIds.length; i += batchSize) {
        const batch = allIds.slice(i, i + batchSize);
        
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ questionIds: batch, targetLang: translateLang }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Erro na tradução');
        }

        setTranslateProgress({ current: Math.min(i + batchSize, allIds.length), total: allIds.length });
      }

      toast.success(`${allIds.length} questões traduzidas para ${translateLang === 'pt-BR' ? 'Português' : 'Inglês'}!`);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erro ao traduzir");
    } finally {
      setTranslating(false);
    }
  }


  if (loading) return <div className="p-20 text-center">Carregando painel...</div>;

  const pendingOrders = orders.filter(o => o.status === 'PAID_REVIEW' || o.status === 'PENDING');
  const historyOrders = orders.filter(o => o.status === 'APPROVED' || o.status === 'REJECTED');

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Painel Adm</h1>
          <p className="text-muted-foreground">Gerenciar pedidos e importações</p>
        </div>
        <Button variant="outline" onClick={loadOrders}>Atualizar</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pendentes</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Aprovados</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'APPROVED').length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Vendas (Total)</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                orders.filter(o => o.status === 'APPROVED').reduce((acc, curr) => acc + curr.amount_cents, 0) / 100
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="flex-wrap">
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="vendors">Fornecedores</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="topics">Tópicos</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="coupons">Cupons</TabsTrigger>
          <TabsTrigger value="import">Importar Questões</TabsTrigger>
          <TabsTrigger value="translate">Traduzir</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <div className="space-y-4">
            {pendingOrders.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center border rounded-lg bg-muted/20">Nenhum pedido pendente.</p>
            ) : (
              pendingOrders.map(order => (
                <Card key={order.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row border-l-4 border-l-yellow-400">
                    <div className="p-6 flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{order.products?.title || 'Produto Removido'}</h3>
                          <p className="text-sm text-muted-foreground">Cliente: {order.customer_email}</p>
                        </div>
                        <Badge variant={order.status === 'PAID_REVIEW' ? 'default' : 'outline'}>
                          {order.status === 'PAID_REVIEW' ? 'PGTO INFO' : 'AGUARDANDO'}
                        </Badge>
                      </div>
                      <div className="text-sm grid grid-cols-2 gap-4 mt-4 bg-muted/50 p-3 rounded">
                        <div>
                          <span className="text-muted-foreground block text-xs">Valor:</span>
                          <span className="font-semibold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.amount_cents / 100)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs">Data:</span>
                          {new Date(order.created_at).toLocaleString()}
                        </div>
                      </div>
                      {order.order_payments.length > 0 && (
                        <div className="mt-4 p-3 bg-muted/30 border rounded text-sm">
                          <p className="font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Comprovante:
                          </p>
                          <p className="whitespace-pre-wrap mt-1">{order.order_payments[0].proof_text}</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-muted/30 flex flex-row md:flex-col justify-center gap-3 border-t md:border-t-0 md:border-l">
                      <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleApprove(order)}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Aprovar
                      </Button>
                      <Button variant="destructive" className="w-full" onClick={() => handleReject(order.id)}>
                        <XCircle className="mr-2 h-4 w-4" /> Rejeitar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <div className="space-y-4">
            {historyOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium">{order.products?.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.customer_email} • {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.amount_cents / 100)}
                  </span>
                  <Badge variant={order.status === 'APPROVED' ? 'default' : 'destructive'} className={order.status === 'APPROVED' ? 'bg-green-600' : ''}>
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vendors" className="mt-4">
          <VendorManager />
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <CategoryManager />
        </TabsContent>

        <TabsContent value="products" className="mt-4">
          <ProductManager />
        </TabsContent>

        <TabsContent value="topics" className="mt-4">
          <TopicManager />
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <UserManager />
        </TabsContent>

        <TabsContent value="coupons" className="mt-4">
          <CouponManager />
        </TabsContent>

        <TabsContent value="import" className="mt-4">
          {extractedQuestions ? (
            <QuestionPreviewTable
              questions={extractedQuestions}
              topics={extractedTopics}
              onImportDone={() => {
                setExtractedQuestions(null);
                setPdfFile(null);
              }}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" /> Importar Questões via PDF
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Faça upload de um PDF contendo questões de simulado. A IA extrairá automaticamente as questões, alternativas e respostas.
                </p>
                <div>
                  <label className="text-xs text-muted-foreground">Categoria (filtra tópicos na extração)</label>
                  <Select value={importCategoryId} onValueChange={setImportCategoryId}>
                    <SelectTrigger><SelectValue placeholder="Todas as categorias" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {(c as any).vendors?.name} › {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={e => setPdfFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer space-y-2 block">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                    <p className="font-medium">{pdfFile ? pdfFile.name : 'Clique para selecionar um PDF'}</p>
                    <p className="text-xs text-muted-foreground">Formato: PDF com questões de múltipla escolha</p>
                  </label>
                </div>
                <Button
                  onClick={handleExtractQuestions}
                  disabled={!pdfFile || extracting}
                  className="w-full"
                >
                  {extracting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Extraindo questões com IA... (pode levar até 3 min)</>
                  ) : (
                    <><FileText className="mr-2 h-4 w-4" /> Extrair Questões</>
                  )}
                </Button>
                {extracting && (
                  <p className="text-xs text-muted-foreground text-center animate-pulse">
                    A IA está analisando o PDF e extraindo as questões. Não feche esta página.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="translate" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🌐 Traduzir Questões
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Traduza todas as questões de uma categoria entre Inglês e Português usando IA.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Categoria</label>
                  <Select value={translateCategoryId} onValueChange={setTranslateCategoryId}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {(c as any).vendors?.name} › {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Idioma destino</label>
                  <Select value={translateLang} onValueChange={setTranslateLang}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">🇧🇷 Português</SelectItem>
                      <SelectItem value="en">🇺🇸 Inglês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {translating && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300" 
                        style={{ width: `${translateProgress.total > 0 ? (translateProgress.current / translateProgress.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {translateProgress.current} / {translateProgress.total}
                    </span>
                  </div>
                  <p className="text-xs text-primary font-medium animate-pulse">
                    Traduzindo questão {translateProgress.current} de {translateProgress.total}...
                  </p>
                </div>
              )}
              <Button
                onClick={handleTranslate}
                disabled={!translateCategoryId || translating}
                className="w-full"
              >
                {translating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Traduzindo...</>
                ) : (
                  <>Traduzir Questões</>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
