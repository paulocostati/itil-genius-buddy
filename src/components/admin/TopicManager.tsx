import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface Category { id: string; name: string; slug: string; vendors?: { name: string }; }
interface Topic {
  id: string; name: string; area: string; weight: number; blooms_level: string;
  description: string | null; category_id: string | null;
  categories?: { name: string; vendors?: { name: string } } | null;
}

const defaultForm = {
  name: '', area: '', weight: '1', blooms_level: 'BL2', description: '', category_id: '',
};

export default function TopicManager() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');

  const load = useCallback(async () => {
    setLoading(true);
    const [topicRes, catRes] = await Promise.all([
      (supabase.from as any)('topics').select('*, categories(name, vendors(name))').order('area').order('name'),
      (supabase.from as any)('categories').select('id, name, slug, vendors(name)').order('name'),
    ]);
    setTopics(topicRes.data || []);
    setCategories(catRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filterCategoryId === 'all'
    ? topics
    : filterCategoryId === 'none'
      ? topics.filter(t => !t.category_id)
      : topics.filter(t => t.category_id === filterCategoryId);

  async function handleSave() {
    if (!form.name.trim() || !form.area.trim()) { toast.error('Nome e área são obrigatórios'); return; }
    const payload = {
      name: form.name, area: form.area, weight: parseFloat(form.weight) || 1,
      blooms_level: form.blooms_level, description: form.description || null,
      category_id: form.category_id || null,
    };
    try {
      if (editingId) {
        const { error } = await (supabase.from as any)('topics').update(payload).eq('id', editingId);
        if (error) throw error;
        toast.success('Tópico atualizado!');
      } else {
        const { error } = await (supabase.from as any)('topics').insert(payload);
        if (error) throw error;
        toast.success('Tópico criado!');
      }
      setEditingId(null); setIsAdding(false); setForm(defaultForm); load();
    } catch (e: any) { toast.error(e.message || 'Erro'); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este tópico? Questões vinculadas ficarão órfãs.')) return;
    const { error } = await (supabase.from as any)('topics').delete().eq('id', id);
    if (error) { toast.error(error.message); return; }
    toast.success('Tópico removido!'); load();
  }

  function startEdit(t: Topic) {
    setEditingId(t.id); setIsAdding(false);
    setForm({
      name: t.name, area: t.area, weight: String(t.weight),
      blooms_level: t.blooms_level, description: t.description || '',
      category_id: t.category_id || '',
    });
  }

  // Count questions per topic
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    (supabase.from as any)('questions').select('topic_id').then(({ data }: any) => {
      const counts: Record<string, number> = {};
      (data || []).forEach((q: any) => { counts[q.topic_id] = (counts[q.topic_id] || 0) + 1; });
      setQuestionCounts(counts);
    });
  }, []);

  if (loading) return <p className="text-muted-foreground py-4">Carregando tópicos...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h3 className="font-semibold text-lg">Tópicos ({filtered.length})</h3>
        <div className="flex gap-2">
          <Select value={filterCategoryId} onValueChange={setFilterCategoryId}>
            <SelectTrigger className="w-[200px] h-9 text-sm"><SelectValue placeholder="Filtrar..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              <SelectItem value="none">Sem categoria</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id}>{(c as any).vendors?.name} › {c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => { setIsAdding(true); setEditingId(null); setForm(defaultForm); }} disabled={isAdding}>
            <Plus className="mr-1 h-4 w-4" /> Novo Tópico
          </Button>
        </div>
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
                    <SelectItem key={c.id} value={c.id}>{(c as any).vendors?.name} › {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Nome</label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Gerenciamento de Incidente" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Área</label>
                <Input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} placeholder="7. Práticas ITIL" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Peso</label>
                <Input type="number" step="0.1" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Bloom's Level</label>
                <Select value={form.blooms_level} onValueChange={v => setForm(f => ({ ...f, blooms_level: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['BL1', 'BL2', 'BL3', 'BL4'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Descrição</label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}><Save className="mr-1 h-4 w-4" /> Salvar</Button>
              <Button size="sm" variant="ghost" onClick={() => { setIsAdding(false); setEditingId(null); }}><X className="mr-1 h-4 w-4" /> Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {filtered.map(t => (
          <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium">{t.name}</p>
                <Badge variant="outline" className="text-xs">{t.area}</Badge>
                <Badge variant="secondary" className="text-xs">{questionCounts[t.id] || 0}q</Badge>
                <Badge variant="outline" className="text-xs">{t.blooms_level}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {t.categories ? `${(t as any).categories?.vendors?.name} › ${t.categories.name}` : 'Sem categoria'} • Peso: {t.weight}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(t)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground text-center py-4">Nenhum tópico encontrado.</p>}
      </div>
    </div>
  );
}
