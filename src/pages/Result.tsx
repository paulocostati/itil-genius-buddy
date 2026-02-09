import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, XCircle, Trophy, Target, BookOpen } from 'lucide-react';

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
    };
  };
}

interface ExamData {
  total_questions: number;
  score: number;
  started_at: string;
  finished_at: string | null;
}

export default function Result() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<ExamData | null>(null);
  const [questions, setQuestions] = useState<ResultQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [topicBreakdown, setTopicBreakdown] = useState<{ name: string; correct: number; total: number; pct: number }[]>([]);

  useEffect(() => {
    loadResult();
  }, [examId]);

  async function loadResult() {
    const { data: examData } = await supabase
      .from('exams')
      .select('total_questions, score, started_at, finished_at')
      .eq('id', examId!)
      .maybeSingle();

    const { data: qData } = await supabase
      .from('exam_questions')
      .select('id, question_order, selected_option, is_correct, questions(statement, option_a, option_b, option_c, option_d, correct_option, explanation, topics(name))')
      .eq('exam_id', examId!)
      .order('question_order');

    if (examData) setExam(examData as unknown as ExamData);
    if (qData) {
      const qs = qData as unknown as ResultQuestion[];
      setQuestions(qs);

      // Topic breakdown
      const byTopic: Record<string, { name: string; correct: number; total: number }> = {};
      for (const q of qs) {
        const name = q.questions.topics?.name || 'Desconhecido';
        if (!byTopic[name]) byTopic[name] = { name, correct: 0, total: 0 };
        byTopic[name].total++;
        if (q.is_correct) byTopic[name].correct++;
      }
      setTopicBreakdown(
        Object.values(byTopic).map(t => ({ ...t, pct: Math.round((t.correct / t.total) * 100) })).sort((a, b) => a.pct - b.pct)
      );
    }
    setLoading(false);
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!exam) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Resultado não encontrado.</div>;

  const percentage = Math.round((exam.score / exam.total_questions) * 100);
  const passed = percentage >= 65;
  const optionLabel = (key: string, q: ResultQuestion['questions']) => {
    const map: Record<string, string> = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
    return map[key] || '';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Result */}
      <div className={`${passed ? 'gradient-success' : 'gradient-danger'} text-primary-foreground`}>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-scale-in">
            <Trophy className="h-16 w-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-4xl font-bold mb-2">{percentage}%</h1>
            <p className="text-lg opacity-90">{exam.score} de {exam.total_questions} questões corretas</p>
            <p className="mt-2 text-sm opacity-80">
              {passed ? '🎉 Parabéns! Você atingiu a nota de aprovação (65%)!' : '📚 Continue estudando! A nota de aprovação é 65%.'}
            </p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar ao Dashboard
        </Button>

        {/* Topic Breakdown */}
        <Card className="border-0 shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" /> Desempenho por Tópico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topicBreakdown.map((t, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t.name}</span>
                  <span className={`text-sm font-mono font-bold ${t.pct >= 65 ? 'text-success' : t.pct >= 40 ? 'text-warning' : 'text-destructive'}`}>
                    {t.correct}/{t.total} ({t.pct}%)
                  </span>
                </div>
                <Progress value={t.pct} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Question Details Toggle */}
        <Button variant="outline" className="w-full" onClick={() => setShowDetails(!showDetails)}>
          <BookOpen className="h-4 w-4 mr-2" />
          {showDetails ? 'Ocultar' : 'Ver'} Revisão das Questões
        </Button>

        {showDetails && (
          <div className="space-y-4 animate-fade-in">
            {questions.map((q) => (
              <Card key={q.id} className={`border-l-4 ${q.is_correct ? 'border-l-success' : 'border-l-destructive'} shadow-sm`}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2 mb-3">
                    {q.is_correct ? (
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    )}
                    <p className="text-sm font-medium leading-relaxed">
                      <span className="text-muted-foreground mr-1">{q.question_order}.</span>
                      {q.questions.statement}
                    </p>
                  </div>

                  <div className="ml-7 space-y-1 text-sm">
                    {['A', 'B', 'C', 'D'].map(key => {
                      const isCorrect = key === q.questions.correct_option;
                      const isSelected = key === q.selected_option;
                      return (
                        <div key={key} className={`p-2 rounded-lg ${
                          isCorrect ? 'bg-success/10 text-success font-medium' :
                          isSelected && !isCorrect ? 'bg-destructive/10 text-destructive line-through' :
                          'text-muted-foreground'
                        }`}>
                          <span className="font-mono font-bold mr-2">{key})</span>
                          {optionLabel(key, q.questions)}
                          {isCorrect && ' ✓'}
                          {isSelected && !isCorrect && ' ✗'}
                        </div>
                      );
                    })}
                  </div>

                  {q.questions.explanation && (
                    <div className="ml-7 mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-xs text-muted-foreground mb-1 font-medium">Explicação:</p>
                      <p className="text-sm">{q.questions.explanation}</p>
                    </div>
                  )}

                  <div className="ml-7 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {q.questions.topics?.name}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
