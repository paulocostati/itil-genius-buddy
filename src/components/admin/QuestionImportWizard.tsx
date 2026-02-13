import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Loader2, Plus, ChevronRight, Check, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import QuestionPreviewTable from '@/components/QuestionPreviewTable';

interface Vendor { id: string; name: string; slug: string; }
interface Category { id: string; vendor_id: string; name: string; slug: string; vendors?: { name: string }; }
interface Product { id: string; category_id: string; title: string; slug: string; }
interface Topic { id: string; name: string; area: string; category_id: string | null; }

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function QuestionImportWizard() {
  // Data
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // Selections
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');

  // Inline creation forms
  const [creatingVendor, setCreatingVendor] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: '', slug: '' });
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '' });
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ title: '', slug: '', description: '', price_cents: '4990', question_count: '40', time_limit_minutes: '60', passing_score: '65' });

  // PDF + extraction
  const [syllabusUrl, setSyllabusUrl] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState<any[] | null>(null);
  const [extractedTopics, setExtractedTopics] = useState<any[]>([]);
  const [extractionLogs, setExtractionLogs] = useState<string[]>([]);
  const [questionsFound, setQuestionsFound] = useState(0);

  const loadData = useCallback(async () => {
    const [venRes, catRes, prodRes, topRes] = await Promise.all([
      (supabase.from as any)('vendors').select('id, name, slug').order('name'),
      (supabase.from as any)('categories').select('id, vendor_id, name, slug, vendors(name)').order('name'),
      (supabase.from as any)('products').select('id, category_id, title, slug').order('title'),
      (supabase.from as any)('topics').select('id, name, area, category_id').order('area').order('name'),
    ]);
    setVendors(venRes.data || []);
    setCategories(catRes.data || []);
    setProducts(prodRes.data || []);
    setTopics(topRes.data || []);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Filtered lists
  const filteredCategories = categories.filter(c => c.vendor_id === selectedVendorId);
  const filteredProducts = products.filter(p => p.category_id === selectedCategoryId);
  const filteredTopics = topics.filter(t => t.category_id === selectedCategoryId);

  // Current step
  const getStep = () => {
    if (extractedQuestions) return 5; // Preview
    if (selectedCategoryId && selectedProductId) return 4; // Upload PDF
    if (selectedCategoryId) return 3; // Select/create product
    if (selectedVendorId) return 2; // Select/create category
    return 1; // Select/create vendor
  };
  const step = getStep();

  // --- Create handlers ---
  async function createVendor() {
    if (!newVendor.name.trim()) { toast.error('Nome é obrigatório'); return; }
    const slug = newVendor.slug || slugify(newVendor.name);
    const { data, error } = await (supabase.from as any)('vendors').insert({ name: newVendor.name, slug }).select().single();
    if (error) { toast.error(error.message); return; }
    toast.success('Fornecedor criado!');
    setCreatingVendor(false);
    setNewVendor({ name: '', slug: '' });
    await loadData();
    setSelectedVendorId(data.id);
  }

  async function createCategory() {
    if (!newCategory.name.trim()) { toast.error('Nome é obrigatório'); return; }
    const slug = newCategory.slug || slugify(newCategory.name);
    const { data, error } = await (supabase.from as any)('categories')
      .insert({ name: newCategory.name, slug, description: newCategory.description || null, vendor_id: selectedVendorId })
      .select().single();
    if (error) { toast.error(error.message); return; }
    toast.success('Categoria criada!');
    setCreatingCategory(false);
    setNewCategory({ name: '', slug: '', description: '' });
    await loadData();
    setSelectedCategoryId(data.id);
  }

  async function createProduct() {
    if (!newProduct.title.trim()) { toast.error('Título é obrigatório'); return; }
    const slug = newProduct.slug || slugify(newProduct.title);
    const { data, error } = await (supabase.from as any)('products')
      .insert({
        title: newProduct.title, slug, description: newProduct.description || null,
        category_id: selectedCategoryId,
        price_cents: parseInt(newProduct.price_cents) || 0,
        question_count: parseInt(newProduct.question_count) || 40,
        time_limit_minutes: parseInt(newProduct.time_limit_minutes) || 60,
        passing_score: parseInt(newProduct.passing_score) || 65,
      })
      .select().single();
    if (error) { toast.error(error.message); return; }
    toast.success('Produto criado!');
    setCreatingProduct(false);
    setNewProduct({ title: '', slug: '', description: '', price_cents: '4990', question_count: '40', time_limit_minutes: '60', passing_score: '65' });
    await loadData();
    setSelectedProductId(data.id);
  }

  // --- Extract PDF ---
  async function handleExtractQuestions() {
    if (!pdfFile) return;
    if (pdfFile.size > 20 * 1024 * 1024) { toast.error("Limite: 20MB"); return; }

    setExtracting(true);
    setExtractedQuestions(null);
    setExtractionLogs([]);
    setQuestionsFound(0);

    try {
      const filePath = `imports/${Date.now()}_${pdfFile.name}`;
      const { error: uploadError } = await supabase.storage.from('admin-uploads').upload(filePath, pdfFile);
      if (uploadError) throw uploadError;

      setExtractionLogs(prev => [...prev, '📤 Upload concluído. Iniciando extração...']);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 300000);

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ filePath, categoryId: selectedCategoryId, syllabusUrl: syllabusUrl.trim() || undefined }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok && !res.headers.get('content-type')?.includes('text/event-stream')) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Falha na extração');
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          if (!block.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(block.slice(6));
            if (event.type === 'progress') {
              setExtractionLogs(prev => [...prev, event.message]);
              if (event.questionsFound) setQuestionsFound(event.questionsFound);
            } else if (event.type === 'done') {
              setExtractedQuestions(event.questions);
              setExtractedTopics(event.topics);
              toast.success(`${event.questions.length} questões extraídas!`);
              // Auto-update product description if generated from syllabus
              if (event.productDescription && selectedProductId) {
                const { error: descErr } = await (supabase.from as any)('products')
                  .update({ description: event.productDescription })
                  .eq('id', selectedProductId);
                if (!descErr) {
                  toast.success('Descrição do produto atualizada a partir do syllabus!');
                }
              }
            } else if (event.type === 'error') {
              throw new Error(event.error);
            }
          } catch (parseErr: any) {
            if (parseErr.message && !parseErr.message.includes('Unexpected')) throw parseErr;
          }
        }
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.name === 'AbortError' ? "Timeout: PDF muito grande." : (e.message || "Erro ao extrair"));
    } finally {
      setExtracting(false);
    }
  }

  function goBack() {
    if (extractedQuestions) { setExtractedQuestions(null); return; }
    if (selectedProductId) { setSelectedProductId(''); return; }
    if (selectedCategoryId) { setSelectedCategoryId(''); return; }
    if (selectedVendorId) { setSelectedVendorId(''); return; }
  }

  // Breadcrumb info
  const vendorName = vendors.find(v => v.id === selectedVendorId)?.name;
  const categoryName = categories.find(c => c.id === selectedCategoryId)?.name;
  const productName = products.find(p => p.id === selectedProductId)?.title;

  // --- Step 5: Preview ---
  if (extractedQuestions) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" onClick={goBack}><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Button>
          <span>{vendorName}</span><ChevronRight className="h-3 w-3" />
          <span>{categoryName}</span><ChevronRight className="h-3 w-3" />
          <span>{productName}</span>
        </div>
        <QuestionPreviewTable
          questions={extractedQuestions}
          topics={extractedTopics}
          onImportDone={() => {
            setExtractedQuestions(null);
            setPdfFile(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        {step > 1 && <Button variant="ghost" size="sm" onClick={goBack}><ArrowLeft className="h-4 w-4 mr-1" /> Voltar</Button>}
        <div className="flex items-center gap-1 text-muted-foreground">
          <Badge variant={step >= 1 ? 'default' : 'outline'} className="text-xs">1. Fornecedor</Badge>
          <ChevronRight className="h-3 w-3" />
          <Badge variant={step >= 2 ? 'default' : 'outline'} className="text-xs">2. Categoria</Badge>
          <ChevronRight className="h-3 w-3" />
          <Badge variant={step >= 3 ? 'default' : 'outline'} className="text-xs">3. Produto</Badge>
          <ChevronRight className="h-3 w-3" />
          <Badge variant={step >= 4 ? 'default' : 'outline'} className="text-xs">4. Upload PDF</Badge>
        </div>
      </div>

      {/* Selection summary */}
      {(vendorName || categoryName || productName) && (
        <div className="flex items-center gap-2 text-sm font-medium">
          {vendorName && <Badge variant="secondary">{vendorName}</Badge>}
          {categoryName && <><ChevronRight className="h-3 w-3" /><Badge variant="secondary">{categoryName}</Badge></>}
          {productName && <><ChevronRight className="h-3 w-3" /><Badge variant="secondary">{productName}</Badge></>}
        </div>
      )}

      {/* Step 1: Vendor */}
      {step === 1 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">1. Selecione ou crie um Fornecedor</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {vendors.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {vendors.map(v => (
                  <Button key={v.id} variant="outline" className="justify-start h-auto py-3" onClick={() => setSelectedVendorId(v.id)}>
                    {v.name}
                  </Button>
                ))}
              </div>
            )}
            {creatingVendor ? (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Nome</label>
                    <Input value={newVendor.name} onChange={e => setNewVendor({ name: e.target.value, slug: slugify(e.target.value) })} placeholder="Microsoft" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Slug</label>
                    <Input value={newVendor.slug} onChange={e => setNewVendor(v => ({ ...v, slug: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={createVendor}><Check className="mr-1 h-4 w-4" /> Criar</Button>
                  <Button size="sm" variant="ghost" onClick={() => setCreatingVendor(false)}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full border-dashed" onClick={() => setCreatingVendor(true)}>
                <Plus className="mr-2 h-4 w-4" /> Novo Fornecedor
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Category */}
      {step === 2 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">2. Selecione ou crie uma Categoria</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {filteredCategories.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {filteredCategories.map(c => (
                  <Button key={c.id} variant="outline" className="justify-start h-auto py-3" onClick={() => setSelectedCategoryId(c.id)}>
                    {c.name}
                  </Button>
                ))}
              </div>
            )}
            {creatingCategory ? (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Nome</label>
                    <Input value={newCategory.name} onChange={e => setNewCategory(c => ({ ...c, name: e.target.value, slug: slugify(e.target.value) }))} placeholder="AZ-900" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Slug</label>
                    <Input value={newCategory.slug} onChange={e => setNewCategory(c => ({ ...c, slug: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Descrição</label>
                  <Input value={newCategory.description} onChange={e => setNewCategory(c => ({ ...c, description: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={createCategory}><Check className="mr-1 h-4 w-4" /> Criar</Button>
                  <Button size="sm" variant="ghost" onClick={() => setCreatingCategory(false)}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full border-dashed" onClick={() => setCreatingCategory(true)}>
                <Plus className="mr-2 h-4 w-4" /> Nova Categoria
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Product */}
      {step === 3 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">3. Selecione ou crie um Produto</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {filteredProducts.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {filteredProducts.map(p => (
                  <Button key={p.id} variant="outline" className="justify-start h-auto py-3" onClick={() => setSelectedProductId(p.id)}>
                    {p.title}
                  </Button>
                ))}
              </div>
            )}
            {creatingProduct ? (
              <div className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Título</label>
                    <Input value={newProduct.title} onChange={e => setNewProduct(p => ({ ...p, title: e.target.value, slug: slugify(e.target.value) }))} placeholder="Simulado AZ-900" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Slug</label>
                    <Input value={newProduct.slug} onChange={e => setNewProduct(p => ({ ...p, slug: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Descrição</label>
                  <Input value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Preço (centavos)</label>
                    <Input type="number" value={newProduct.price_cents} onChange={e => setNewProduct(p => ({ ...p, price_cents: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Nº Questões</label>
                    <Input type="number" value={newProduct.question_count} onChange={e => setNewProduct(p => ({ ...p, question_count: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Tempo (min)</label>
                    <Input type="number" value={newProduct.time_limit_minutes} onChange={e => setNewProduct(p => ({ ...p, time_limit_minutes: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Nota mínima (%)</label>
                    <Input type="number" value={newProduct.passing_score} onChange={e => setNewProduct(p => ({ ...p, passing_score: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={createProduct}><Check className="mr-1 h-4 w-4" /> Criar</Button>
                  <Button size="sm" variant="ghost" onClick={() => setCreatingProduct(false)}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full border-dashed" onClick={() => setCreatingProduct(true)}>
                <Plus className="mr-2 h-4 w-4" /> Novo Produto
              </Button>
            )}

            {/* Show existing topics for this category */}
            {filteredTopics.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Tópicos desta categoria ({filteredTopics.length}):</p>
                <div className="flex flex-wrap gap-1">
                  {filteredTopics.map(t => (
                    <Badge key={t.id} variant="outline" className="text-xs">{t.name}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Upload PDF */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="h-5 w-5" /> 4. Upload do PDF
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Faça upload do PDF com as questões. A IA extrairá e mapeará automaticamente para os tópicos de <strong>{categoryName}</strong>.
            </p>
            <div>
              <label className="text-xs text-muted-foreground">URL do Syllabus / Study Guide (opcional)</label>
              <Input
                value={syllabusUrl}
                onChange={e => setSyllabusUrl(e.target.value)}
                placeholder="https://learn.microsoft.com/.../study-guides/ai-900"
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Cole o link do guia oficial da certificação. A IA usará para entender tópicos, pesos e contexto do exame.
              </p>
            </div>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input type="file" accept=".pdf" onChange={e => setPdfFile(e.target.files?.[0] || null)} className="hidden" id="pdf-upload-wizard" />
              <label htmlFor="pdf-upload-wizard" className="cursor-pointer space-y-2 block">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="font-medium">{pdfFile ? pdfFile.name : 'Clique para selecionar um PDF'}</p>
                <p className="text-xs text-muted-foreground">Formato: PDF com questões de múltipla escolha (máx 20MB)</p>
              </label>
            </div>
            <Button onClick={handleExtractQuestions} disabled={!pdfFile || extracting} className="w-full">
              {extracting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Extraindo questões com IA... (até 3 min)</>
              ) : (
                <><FileText className="mr-2 h-4 w-4" /> Extrair Questões</>
              )}
            </Button>
            {extracting && (
              <div className="space-y-3">
                {questionsFound > 0 && (
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <span>📊 {questionsFound} questões encontradas</span>
                  </div>
                )}
                <div className="bg-muted rounded-lg p-3 max-h-48 overflow-y-auto text-xs font-mono space-y-1">
                  {extractionLogs.map((log, i) => (
                    <p key={i} className={i === extractionLogs.length - 1 ? "text-primary font-semibold" : "text-muted-foreground"}>{log}</p>
                  ))}
                  {extractionLogs.length === 0 && <p className="text-muted-foreground animate-pulse">Preparando...</p>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
