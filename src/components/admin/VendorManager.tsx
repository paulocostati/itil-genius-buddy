import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface Vendor {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  created_at: string;
}

export default function VendorManager() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [isAdding, setIsAdding] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await (supabase.from as any)('vendors').select('*').order('name');
    setVendors(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Nome é obrigatório'); return; }
    const slug = form.slug || slugify(form.name);

    try {
      if (editingId) {
        const { error } = await (supabase.from as any)('vendors')
          .update({ name: form.name, slug, description: form.description || null })
          .eq('id', editingId);
        if (error) throw error;
        toast.success('Fornecedor atualizado!');
      } else {
        const { error } = await (supabase.from as any)('vendors')
          .insert({ name: form.name, slug, description: form.description || null });
        if (error) throw error;
        toast.success('Fornecedor criado!');
      }
      setEditingId(null);
      setIsAdding(false);
      setForm({ name: '', slug: '', description: '' });
      load();
    } catch (e: any) {
      toast.error(e.message || 'Erro ao salvar');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este fornecedor e todas as categorias/produtos vinculados?')) return;
    const { error } = await (supabase.from as any)('vendors').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Fornecedor removido!');
    load();
  }

  function startEdit(v: Vendor) {
    setEditingId(v.id);
    setIsAdding(false);
    setForm({ name: v.name, slug: v.slug, description: v.description || '' });
  }

  function startAdd() {
    setIsAdding(true);
    setEditingId(null);
    setForm({ name: '', slug: '', description: '' });
  }

  if (loading) return <p className="text-muted-foreground py-4">Carregando fornecedores...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Fornecedores ({vendors.length})</h3>
        <Button size="sm" onClick={startAdd} disabled={isAdding}>
          <Plus className="mr-1 h-4 w-4" /> Novo Fornecedor
        </Button>
      </div>

      {(isAdding || editingId) && (
        <Card className="border-primary/30">
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Nome</label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} placeholder="Microsoft" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Slug</label>
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="microsoft" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Descrição</label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Descrição opcional" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}><Save className="mr-1 h-4 w-4" /> Salvar</Button>
              <Button size="sm" variant="ghost" onClick={() => { setIsAdding(false); setEditingId(null); }}><X className="mr-1 h-4 w-4" /> Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {vendors.map(v => (
          <div key={v.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <div>
              <p className="font-medium">{v.name}</p>
              <p className="text-xs text-muted-foreground">/{v.slug} • {v.description || 'Sem descrição'}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(v)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(v.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {vendors.length === 0 && <p className="text-muted-foreground text-center py-4">Nenhum fornecedor cadastrado.</p>}
      </div>
    </div>
  );
}
