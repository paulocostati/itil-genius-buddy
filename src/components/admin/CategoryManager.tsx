import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface Vendor { id: string; name: string; slug: string; }
interface Category { id: string; vendor_id: string; name: string; slug: string; description: string | null; vendors?: { name: string }; }

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '', vendor_id: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const [catRes, venRes] = await Promise.all([
      (supabase.from as any)('categories').select('*, vendors(name)').order('name'),
      (supabase.from as any)('vendors').select('id, name, slug').order('name'),
    ]);
    setCategories(catRes.data || []);
    setVendors(venRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function slugify(t: string) { return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

  async function handleSave() {
    if (!form.name.trim() || !form.vendor_id) { toast.error('Nome e fornecedor são obrigatórios'); return; }
    const slug = form.slug || slugify(form.name);
    try {
      if (editingId) {
        const { error } = await (supabase.from as any)('categories')
          .update({ name: form.name, slug, description: form.description || null, vendor_id: form.vendor_id })
          .eq('id', editingId);
        if (error) throw error;
        toast.success('Categoria atualizada!');
      } else {
        const { error } = await (supabase.from as any)('categories')
          .insert({ name: form.name, slug, description: form.description || null, vendor_id: form.vendor_id });
        if (error) throw error;
        toast.success('Categoria criada!');
      }
      setEditingId(null); setIsAdding(false);
      setForm({ name: '', slug: '', description: '', vendor_id: '' });
      load();
    } catch (e: any) { toast.error(e.message || 'Erro'); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover categoria e todos os produtos vinculados?')) return;
    const { error } = await (supabase.from as any)('categories').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Categoria removida!'); load();
  }

  function startEdit(c: Category) {
    setEditingId(c.id); setIsAdding(false);
    setForm({ name: c.name, slug: c.slug, description: c.description || '', vendor_id: c.vendor_id });
  }

  if (loading) return <p className="text-muted-foreground py-4">Carregando categorias...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Categorias ({categories.length})</h3>
        <Button size="sm" onClick={() => { setIsAdding(true); setEditingId(null); setForm({ name: '', slug: '', description: '', vendor_id: '' }); }} disabled={isAdding}>
          <Plus className="mr-1 h-4 w-4" /> Nova Categoria
        </Button>
      </div>

      {(isAdding || editingId) && (
        <Card className="border-primary/30">
          <CardContent className="pt-4 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Fornecedor</label>
              <Select value={form.vendor_id} onValueChange={v => setForm(f => ({ ...f, vendor_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Nome</label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} placeholder="ITIL 4 Foundation" />
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
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}><Save className="mr-1 h-4 w-4" /> Salvar</Button>
              <Button size="sm" variant="ghost" onClick={() => { setIsAdding(false); setEditingId(null); }}><X className="mr-1 h-4 w-4" /> Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {categories.map(c => (
          <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">
                {(c as any).vendors?.name || 'Sem fornecedor'} • /{c.slug}
              </p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(c)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(c.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {categories.length === 0 && <p className="text-muted-foreground text-center py-4">Nenhuma categoria cadastrada.</p>}
      </div>
    </div>
  );
}
