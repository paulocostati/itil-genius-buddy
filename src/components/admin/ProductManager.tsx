import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Save, X, Upload, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Category { id: string; name: string; slug: string; vendors?: { name: string }; }
interface Product {
  id: string; category_id: string; title: string; slug: string; description: string | null;
  price_cents: number; question_count: number; time_limit_minutes: number; passing_score: number;
  is_active: boolean; is_demo_available: boolean; cover_image: string | null;
  categories?: { name: string; vendors?: { name: string } };
}

const defaultForm = {
  title: '', slug: '', description: '', category_id: '',
  price_cents: '4990', question_count: '40', time_limit_minutes: '60', passing_score: '65',
  is_active: true, is_demo_available: false, cover_image: '' as string,
};

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      (supabase.from as any)('products').select('*, categories(name, vendors(name))').order('title'),
      (supabase.from as any)('categories').select('id, name, slug, vendors(name)').order('name'),
    ]);
    setProducts(prodRes.data || []);
    setCategories(catRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function slugify(t: string) { return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

  async function handleCoverUpload(file: File) {
    if (!file.type.startsWith('image/')) { toast.error('Selecione uma imagem'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Imagem deve ter no máximo 5MB'); return; }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('product-covers').upload(path, file);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('product-covers').getPublicUrl(path);
      setForm(f => ({ ...f, cover_image: publicUrl }));
      toast.success('Imagem enviada!');
    } catch (e: any) {
      toast.error(e.message || 'Erro ao enviar imagem');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!form.title.trim() || !form.category_id) { toast.error('Título e categoria são obrigatórios'); return; }
    const slug = form.slug || slugify(form.title);
    const payload = {
      title: form.title, slug, description: form.description || null, category_id: form.category_id,
      price_cents: parseInt(form.price_cents) || 0,
      question_count: parseInt(form.question_count) || 40,
      time_limit_minutes: parseInt(form.time_limit_minutes) || 60,
      passing_score: parseInt(form.passing_score) || 65,
      is_active: form.is_active, is_demo_available: form.is_demo_available,
      cover_image: form.cover_image || null,
    };

    try {
      if (editingId) {
        const { error } = await (supabase.from as any)('products').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Produto atualizado!');
      } else {
        const { error } = await (supabase.from as any)('products').insert(payload);
        if (error) throw error;
        toast.success('Produto criado!');
      }
      setEditingId(null); setIsAdding(false); setForm(defaultForm); load();
    } catch (e: any) { toast.error(e.message || 'Erro'); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este produto?')) return;
    const { error } = await (supabase.from as any)('products').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Produto removido!'); load();
  }

  function startEdit(p: Product) {
    setEditingId(p.id); setIsAdding(false);
    setForm({
      title: p.title, slug: p.slug, description: p.description || '', category_id: p.category_id,
      price_cents: String(p.price_cents), question_count: String(p.question_count),
      time_limit_minutes: String(p.time_limit_minutes), passing_score: String(p.passing_score),
      is_active: p.is_active, is_demo_available: p.is_demo_available,
      cover_image: p.cover_image || '',
    });
  }

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  if (loading) return <p className="text-muted-foreground py-4">Carregando produtos...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Produtos ({products.length})</h3>
        <Button size="sm" onClick={() => { setIsAdding(true); setEditingId(null); setForm(defaultForm); }} disabled={isAdding}>
          <Plus className="mr-1 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      {(isAdding || editingId) && (
        <Card className="border-primary/30">
          <CardContent className="pt-4 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Categoria</label>
              <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Título</label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: slugify(e.target.value) }))} placeholder="Simulado AZ-900" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Slug</label>
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Descrição</label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="text-xs text-muted-foreground">Imagem de capa</label>
              <div className="flex items-center gap-3 mt-1">
                {form.cover_image ? (
                  <div className="relative w-24 h-16 rounded border overflow-hidden bg-muted">
                    <img src={form.cover_image} alt="Capa" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, cover_image: '' }))}
                      className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-16 rounded border border-dashed flex items-center justify-center bg-muted/50">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <label className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild disabled={uploading}>
                    <span>
                      <Upload className="mr-1 h-4 w-4" />
                      {uploading ? 'Enviando...' : 'Upload'}
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleCoverUpload(file);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Preço (centavos)</label>
                <Input type="number" value={form.price_cents} onChange={e => setForm(f => ({ ...f, price_cents: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Nº Questões</label>
                <Input type="number" value={form.question_count} onChange={e => setForm(f => ({ ...f, question_count: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Tempo (min)</label>
                <Input type="number" value={form.time_limit_minutes} onChange={e => setForm(f => ({ ...f, time_limit_minutes: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Nota mínima (%)</label>
                <Input type="number" value={form.passing_score} onChange={e => setForm(f => ({ ...f, passing_score: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} /> Ativo
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_demo_available} onChange={e => setForm(f => ({ ...f, is_demo_available: e.target.checked }))} /> Demo disponível
              </label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}><Save className="mr-1 h-4 w-4" /> Salvar</Button>
              <Button size="sm" variant="ghost" onClick={() => { setIsAdding(false); setEditingId(null); }}><X className="mr-1 h-4 w-4" /> Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {products.map(p => (
          <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              {p.cover_image ? (
                <img src={p.cover_image} alt={p.title} className="w-12 h-8 rounded object-cover border" />
              ) : (
                <div className="w-12 h-8 rounded border bg-muted flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{p.title}</p>
                  {!p.is_active && <Badge variant="outline" className="text-xs">Inativo</Badge>}
                  {p.is_demo_available && <Badge variant="secondary" className="text-xs">Demo</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(p as any).categories?.vendors?.name} › {(p as any).categories?.name} • {formatPrice(p.price_cents)} • {p.question_count}q / {p.time_limit_minutes}min
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(p)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {products.length === 0 && <p className="text-muted-foreground text-center py-4">Nenhum produto cadastrado.</p>}
      </div>
    </div>
  );
}