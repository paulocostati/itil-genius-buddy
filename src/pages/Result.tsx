import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, XCircle, Trophy, Target, BookOpen, Clock, Activity, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ResultQuestion {
  id: string;
  question_order: number;
  selected_option: string | null;
  is_correct: boolean | null;
  questions: {
    statement: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: string;
    explanation: string | null;
    topics: {
      name: string;
      area: string;
    };
  };
}

interface ExamData {
  total_questions: number;
  score: number;
  started_at: string;
  finished_at: string | null;
  is_demo: boolean;
  product_id: string;
}

export default function Result() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState<ExamData | null>(null);
  const [questions, setQuestions] = useState<ResultQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Analytics
  const [topicBreakdown, setTopicBreakdown] = useState<{ name: string; correct: number; total: number; pct: number }[]>([]);
  const [areaBreakdown, setAreaBreakdown] = useState<{ name: string; correct: number; total: number; pct: number }[]>([]);

  // Filters
  const [filter, setFilter] = useState<'all' | 'incorrect' | 'correct'>('all');

  useEffect(() => {
    loadResult();
  }, [examId]);

  async function loadResult() {
    try {
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .select('total_questions, score, started_at, finished_at, is_demo, product_id')
        .eq('id', examId!)
        .single();

      if (examError) throw examError;

      const { data: qData, error: qError } = await supabase
        .from('exam_questions')
        .select(`
            id, question_order, selected_option, is_correct, 
            questions(
                statement, option_a, option_b, option_c, option_d, 
                correct_option, explanation, 
                topics(name, area)
            )
        `)
        .eq('exam_id', examId!)
        .order('question_order');

      if (qError) throw qError;

      if (examData) setExam(examData as unknown as ExamData);

      const qs = qData as unknown as ResultQuestion[];
      setQuestions(qs);

      // --- Analytics ---
      const byTopic: Record<string, { name: string; correct: number; total: number }> = {};
      const byArea: Record<string, { name: string; correct: number; total: number }> = {};

      for (const q of qs) {
        // Topic Stats
        const tName = q.questions.topics?.name || 'Geral';
        if (!byTopic[tName]) byTopic[tName] = { name: tName, correct: 0, total: 0 };
        byTopic[tName].total++;
        if (q.is_correct) byTopic[tName].correct++;

        // Area Stats
        const aName = q.questions.topics?.area || 'Outros';
        if (!byArea[aName]) byArea[aName] = { name: aName, correct: 0, total: 0 };
        byArea[aName].total++;
        if (q.is_correct) byArea[aName].correct++;
      }

      setTopicBreakdown(Object.values(byTopic).map(t => ({ ...t, pct: Math.round((t.correct / t.total) * 100) })).sort((a, b) => a.pct - b.pct));
      setAreaBreakdown(Object.values(byArea).map(t => ({ ...t, pct: Math.round((t.correct / t.total) * 100) })).sort((a, b) => a.pct - b.pct));

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const criticalTopics = topicBreakdown.filter(t => t.pct < 65);
  const goodTopics = topicBreakdown.filter(t => t.pct >= 80);
  const neutralTopics = topicBreakdown.filter(t => t.pct >= 65 && t.pct < 80);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!exam) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Resultado não encontrado.</div>;

  const percentage = Math.round((exam.score / exam.total_questions) * 100);
  const passed = percentage >= 65;

  // Time Calculation
  const startTime = new Date(exam.started_at).getTime();
  const finishTime = exam.finished_at ? new Date(exam.finished_at).getTime() : new Date().getTime();
  const durationMinutes = Math.floor((finishTime - startTime) / 60000);

  const filteredQuestions = questions.filter(q => {
    if (filter === 'incorrect') return q.is_correct === false;
    if (filter === 'correct') return q.is_correct === true;
    return true;
  });

  const optionLabel = (key: string, q: ResultQuestion['questions']) => {
    const map: Record<string, string> = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
    return map[key] || '';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <div className={`relative overflow-hidden ${passed ? 'bg-gradient-to-br from-green-600 to-emerald-800' : 'bg-gradient-to-br from-red-600 to-rose-800'} text-white shadow-xl`}>
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('/grid-pattern.svg')]"></div>
        <div className="container mx-auto px-4 pt-12 pb-16 relative z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-white/80 hover:text-white hover:bg-white/10 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao Início
          </Button>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2 opacity-90">
                {passed ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                <span className="text-lg font-medium tracking-wide uppercase">
                  {passed ? 'Aprovado' : 'Reprovado'}
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-2 tracking-tight">
                {percentage}%
              </h1>
              <p className="text-xl md:text-2xl font-light opacity-90">
                {exam.score} de {exam.total_questions} questões corretas
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
              <div className="p-3 text-center min-w-[100px]">
                <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Tempo</p>
                <p className="text-2xl font-bold flex items-center justify-center gap-2">
                  <Clock className="h-5 w-5" />
                  {durationMinutes} <span className="text-sm font-normal">min</span>
                </p>
              </div>
              <div className="p-3 text-center min-w-[100px]">
                <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Status</p>
                <p className="text-xl font-bold flex items-center justify-center gap-2 mt-1">
                  {passed ? 'Suficiente' : 'Insuficiente'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 -mt-8 relative z-20 max-w-5xl space-y-8">

        {/* CTA for Demo Users */}
        {exam.is_demo && exam.product_id && (
          <Card className="border-2 border-primary/20 bg-background shadow-lg animate-in slide-in-from-bottom-4">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 mb-2 text-primary">
                  <Trophy className="h-6 w-6" /> Desbloqueie todo o potencial!
                </h3>
                <p className="text-muted-foreground">
                  Você acabou de testar a versão demo. Adquira o simulado completo para acessar:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-foreground/80">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Banco com centenas de questões</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Histórico detalhado de evolução</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Garantia de aprovação</li>
                </ul>
              </div>
              <Button
                size="lg"
                className="gradient-primary text-primary-foreground shadow-lg px-8 h-12 text-lg whitespace-nowrap"
                onClick={async () => {
                  const { data } = await (supabase.from as any)('products').select('slug').eq('id', exam.product_id).single();
                  if (data) navigate(`/checkout/${data.slug}`);
                }}
              >
                Comprar Agora
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50 p-1">
            <TabsTrigger value="overview" className="text-base">Visão Geral</TabsTrigger>
            <TabsTrigger value="review" className="text-base">Revisão das Questões</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6 animate-in fade-in">
            {/* Study Report / Recommendations */}
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Activity className="h-5 w-5" /> Relatório de Diagnóstico
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {criticalTopics.length > 0 ? (
                  <div className="flex gap-4 p-4 rounded-xl bg-red-50 border border-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-500 shrink-0 mt-1" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-red-900">Onde você precisa focar:</h4>
                      <p className="text-sm text-red-800">
                        Baseado no seu desempenho, recomendamos reforçar o estudo nos seguintes tópicos:
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {criticalTopics.slice(0, 4).map((t, idx) => (
                          <span key={idx} className="px-2 py-1 bg-white border border-red-200 text-red-700 rounded text-xs font-semibold shadow-sm">
                            {t.name} ({t.pct}%)
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4 p-4 rounded-xl bg-green-50 border border-green-100">
                    <Trophy className="h-6 w-6 text-green-500 shrink-0 mt-1" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-green-900">Excelente desempenho global!</h4>
                      <p className="text-sm text-green-800">
                        Você não possui tópicos críticos neste simulado. Continue revisando para manter a consistência.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                      <div className="w-2 h-2 rounded-full bg-green-500" /> Seus Pontos Fortes
                    </h4>
                    <ul className="space-y-2">
                      {goodTopics.length > 0 ? goodTopics.slice(0, 3).map((t, i) => (
                        <li key={i} className="text-sm flex items-center justify-between p-2 rounded bg-muted/30">
                          <span>{t.name}</span>
                          <span className="font-bold text-green-600">{t.pct}%</span>
                        </li>
                      )) : <li className="text-sm text-muted-foreground italic">Nenhum tópico com mais de 80% ainda.</li>}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                      <div className="w-2 h-2 rounded-full bg-orange-400" /> Próximos Alvos
                    </h4>
                    <ul className="space-y-2">
                      {neutralTopics.length > 0 ? neutralTopics.slice(0, 3).map((t, i) => (
                        <li key={i} className="text-sm flex items-center justify-between p-2 rounded bg-muted/30">
                          <span>{t.name}</span>
                          <span className="font-bold text-orange-600">{t.pct}%</span>
                        </li>
                      )) : <li className="text-sm text-muted-foreground italic">Foque primeiro nos tópicos críticos.</li>}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Performance by Area */}
              <Card shadow-sm>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-primary" /> Desempenho por Área
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {areaBreakdown.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium truncate max-w-[200px]">{item.name}</span>
                        <span className={`font-mono font-bold ${item.pct >= 65 ? 'text-green-600' : 'text-red-500'}`}>
                          {item.pct}%
                        </span>
                      </div>
                      <Progress value={item.pct} className={`h-2 ${item.pct >= 65 ? 'bg-green-100' : 'bg-red-100'}`} />
                      <p className="text-xs text-muted-foreground text-right">{item.correct} de {item.total} corretas</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Detailed Topics */}
              <Card shadow-sm>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-primary" /> Detalhe por Tópico
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {topicBreakdown.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors border border-transparent hover:border-muted-foreground/10">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-tight">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.correct}/{item.total} acertos</p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-bold ${item.pct >= 80 ? 'bg-green-100 text-green-700' :
                        item.pct >= 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                        {item.pct}%
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* REVIEW TAB */}
          <TabsContent value="review" className="animate-in fade-in space-y-6">
            <div className="flex flex-wrap gap-2 pb-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className="rounded-full"
              >
                Todas
              </Button>
              <Button
                variant={filter === 'incorrect' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => setFilter('incorrect')}
                className="rounded-full"
              >
                <XCircle className="h-3 w-3 mr-1" /> Erradas
              </Button>
              <Button
                variant={filter === 'correct' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setFilter('correct')}
                className={`rounded-full ${filter === 'correct' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}`}
              >
                <CheckCircle className="h-3 w-3 mr-1" /> Corretas
              </Button>
            </div>

            <div className="space-y-4">
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  Nenhuma questão encontrada com este filtro.
                </div>
              ) : (
                filteredQuestions.map((q) => (
                  <Card key={q.id} className={`overflow-hidden border-l-4 ${q.is_correct ? 'border-l-green-500' : 'border-l-red-500'}`}>
                    <CardHeader className="bg-muted/20 py-3 px-4 border-b">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-muted-foreground">#{q.question_order}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.is_correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {q.is_correct ? 'Correta' : 'Incorreta'}
                          </span>
                          <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded border hidden sm:inline-block">
                            {q.questions.topics?.name}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                      <p className="text-base font-medium mb-6 leading-relaxed">
                        {q.questions.statement}
                      </p>

                      <div className="space-y-2">
                        {['A', 'B', 'C', 'D'].map(key => {
                          const isCorrect = key === q.questions.correct_option;
                          const isSelected = key === q.selected_option;

                          let style = "border-transparent bg-muted/40 text-muted-foreground";
                          let icon = null;

                          if (isCorrect) {
                            style = "border-green-200 bg-green-50 text-green-900 ring-1 ring-green-200";
                            icon = <CheckCircle className="h-4 w-4 text-green-600" />;
                          } else if (isSelected) { // Automatically implies Incorrect since logic above checked isCorrect
                            style = "border-red-200 bg-red-50 text-red-900 ring-1 ring-red-200";
                            icon = <XCircle className="h-4 w-4 text-red-600" />;
                          }

                          return (
                            <div key={key} className={`flex items-start gap-3 p-3 rounded-lg border text-sm transition-all ${style}`}>
                              <div className="font-bold min-w-[20px]">{key})</div>
                              <div className="flex-1 leading-relaxed">
                                {optionLabel(key, q.questions)}
                              </div>
                              {icon}
                            </div>
                          );
                        })}
                      </div>

                      {q.questions.explanation && !q.is_correct && (
                        <div className="mt-6 p-4 bg-blue-50/50 border border-blue-100 rounded-lg animate-in fade-in">
                          <div className="flex items-center gap-2 mb-1 text-blue-800 font-semibold text-sm">
                            <BookOpen className="h-4 w-4" /> Explicação
                          </div>
                          <p className="text-sm text-blue-900/80 leading-relaxed">
                            {q.questions.explanation}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

      </main>
    </div>
  );
}
