import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Trash2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ExtractedQuestion {
  statement: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e?: string | null;
  correct_option: string;
  explanation: string;
  question_type: string;
  topic_id: string | null;
}

interface Topic {
  id: string;
  name: string;
  area: string;
}

interface Props {
  questions: ExtractedQuestion[];
  topics: Topic[];
  onImportDone: () => void;
}

export default function QuestionPreviewTable({ questions: initialQuestions, topics, onImportDone }: Props) {
  const [questions, setQuestions] = useState<ExtractedQuestion[]>(initialQuestions);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [selected, setSelected] = useState<Set<number>>(new Set(initialQuestions.map((_, i) => i)));

  function toggleSelect(idx: number) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }

  function removeQuestion(idx: number) {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
    setSelected(prev => {
      const next = new Set<number>();
      prev.forEach(i => {
        if (i < idx) next.add(i);
        else if (i > idx) next.add(i - 1);
      });
      return next;
    });
  }

  function updateQuestion(idx: number, field: keyof ExtractedQuestion, value: string) {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  }

  async function handleImport() {
    const validTopicIds = new Set(topics.map(t => t.id));
    const toImport = questions.filter((_, i) => selected.has(i));
    const valid = toImport.filter(q => q.topic_id && validTopicIds.has(q.topic_id) && q.statement && q.correct_option);

    if (valid.length === 0) {
      toast.error("Nenhuma questão válida para importar. Verifique tópicos e campos obrigatórios.");
      return;
    }

    if (valid.length < toImport.length) {
      const skipped = toImport.length - valid.length;
      toast.warning(`${skipped} questões sem tópico serão ignoradas. Atribua um tópico para importá-las.`);
    }

    setImporting(true);
    setImportProgress({ current: 0, total: valid.length });

    try {
      const batchSize = 10;
      let imported = 0;

      for (let i = 0; i < valid.length; i += batchSize) {
        const batch = valid.slice(i, i + batchSize);
        const rows = batch
          .filter(q => q.statement && q.option_a && q.option_b)
          .map(q => ({
            statement: q.statement.trim(),
            option_a: q.option_a.trim(),
            option_b: q.option_b.trim(),
            option_c: q.option_c?.trim() || null,
            option_d: q.option_d?.trim() || null,
            option_e: q.option_e?.trim() || null,
            correct_option: q.correct_option.replace(/[^a-eA-E]/g, '').charAt(0).toUpperCase() || 'A',
            explanation: q.explanation || null,
            question_type: q.question_type || 'standard',
            topic_id: q.topic_id,
            source: 'PDF Import',
          }));

        const { error } = await (supabase.from as any)('questions').insert(rows);
        if (error) throw error;

        imported += batch.length;
        setImportProgress({ current: imported, total: valid.length });
      }

      toast.success(`${valid.length} questões importadas com sucesso!`);
      onImportDone();
    } catch (e: any) {
      console.error(e);
      toast.error(`Erro ao importar (${importProgress.current}/${importProgress.total}): ${e.message || "Erro desconhecido"}`);
    } finally {
      setImporting(false);
    }
  }

  const validTopicIdsForCount = new Set(topics.map(t => t.id));
  const selectedCount = [...selected].filter(i => i < questions.length).length;
  const validCount = questions.filter((q, i) => selected.has(i) && q.topic_id && validTopicIdsForCount.has(q.topic_id) && q.statement && q.correct_option).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {questions.length} questões extraídas • {selectedCount} selecionadas • {validCount} válidas
          </p>
          {importing && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <Progress value={(importProgress.current / importProgress.total) * 100} className="flex-1 h-2" />
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  {importProgress.current} / {importProgress.total}
                </span>
              </div>
              <p className="text-xs text-primary font-medium">
                Importando questão {importProgress.current} de {importProgress.total}...
              </p>
            </div>
          )}
        </div>
        <Button onClick={handleImport} disabled={importing || validCount === 0} className="bg-green-600 hover:bg-green-700">
          <Save className="mr-2 h-4 w-4" />
          {importing ? `Importando ${importProgress.current}/${importProgress.total}...` : `Importar ${validCount} Questões`}
        </Button>
      </div>

      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {questions.map((q, idx) => (
          <Card key={idx} className={`transition-opacity ${!selected.has(idx) ? 'opacity-50' : ''}`}>
            <CardHeader className="py-3 px-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={selected.has(idx)}
                    onChange={() => toggleSelect(idx)}
                    className="mt-1"
                  />
                  <span className="text-xs font-mono text-muted-foreground">#{idx + 1}</span>
                  <CardTitle className="text-sm font-medium line-clamp-2">{q.statement.substring(0, 120)}...</CardTitle>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {q.topic_id && validTopicIdsForCount.has(q.topic_id) ? (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Mapeada</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">Sem tópico</Badge>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeQuestion(idx)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {selected.has(idx) && (
              <CardContent className="py-2 px-4 space-y-2 text-sm">
                <div>
                  <label className="text-xs text-muted-foreground">Enunciado:</label>
                  <textarea
                    className="w-full border rounded p-2 text-sm min-h-[60px] bg-background"
                    value={q.statement}
                    onChange={e => updateQuestion(idx, 'statement', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(['a', 'b', 'c', 'd'] as const).filter(letter => {
                    const val = q[`option_${letter}` as keyof ExtractedQuestion] as string | null;
                    return letter === 'a' || letter === 'b' || (val && val.trim() !== '');
                  }).map(letter => (
                    <div key={letter} className={`flex items-start gap-1 p-2 rounded border ${q.correct_option.toLowerCase() === letter ? 'bg-green-50 border-green-300' : ''}`}>
                      <span className="font-bold text-xs mt-1 uppercase">{letter})</span>
                      <Input
                        className="h-auto text-xs p-1"
                        value={(q[`option_${letter}` as keyof ExtractedQuestion] as string) || ''}
                        onChange={e => updateQuestion(idx, `option_${letter}` as keyof ExtractedQuestion, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Resposta correta:</label>
                    <Select value={q.correct_option} onValueChange={v => updateQuestion(idx, 'correct_option', v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['A', 'B', 'C', 'D'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Tópico:</label>
                    <Select value={q.topic_id || ''} onValueChange={v => updateQuestion(idx, 'topic_id', v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {topics.map(t => <SelectItem key={t.id} value={t.id}>{t.name} ({t.area})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
