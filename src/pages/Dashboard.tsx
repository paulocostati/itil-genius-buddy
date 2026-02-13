import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Play, History, Target, TrendingDown, LogOut, Trophy, BarChart3, GraduationCap, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface TopicStat {
  name: string;
  area: string;
  weight: number;
  total: number;
  correct: number;
  percentage: number;
}

interface ExamHistory {
  id: string;
  total_questions: number;
  score: number | null;
  completed: boolean;
  started_at: string;
  finished_at: string | null;
  is_practice: boolean;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<ExamHistory[]>([]);
  const [topicStats, setTopicStats] = useState<TopicStat[]>([]);
  const [questionCount, setQuestionCount] = useState(40);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    // Load exam history
    const { data: examData } = await supabase
      .from('exams')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(20);
    setExams((examData as ExamHistory[]) || []);

    // Load topic stats from answered questions
    const { data: topics } = await supabase.from('topics').select('*');
    const { data: examQuestions } = await supabase
      .from('exam_questions')
      .select('question_id, is_correct, questions(topic_id)')
      .not('is_correct', 'is', null);

    if (topics && examQuestions) {
      const stats: Record<string, TopicStat> = {};
      for (const t of topics as any[]) {
        stats[t.id] = { name: t.name, area: t.area, weight: Number(t.weight), total: 0, correct: 0, percentage: 0 };
      }
      for (const eq of examQuestions as any[]) {
        const topicId = eq.questions?.topic_id;
        if (topicId && stats[topicId]) {
          stats[topicId].total++;
          if (eq.is_correct) stats[topicId].correct++;
        }
      }
      const arr = Object.values(stats).map(s => ({
        ...s,
        percentage: s.total > 0 ? Math.round((s.correct / s.total) * 100) : -1,
      }));
      setTopicStats(arr);
    }
    setLoading(false);
  }

  async function createExam() {
    try {
      const { data, error } = await supabase.functions.invoke('start-exam', {
        body: { is_practice: false },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      navigate(`/exam/${data.exam_id}`);
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao criar exame: " + e.message);
    }
  }

  const completedExams = exams.filter(e => e.completed);
  const avgScore = completedExams.length > 0
    ? Math.round(completedExams.reduce((sum, e) => sum + (e.score || 0), 0) / completedExams.length)
    : 0;
  const weakTopics = topicStats
    .filter(t => t.total >= 2 && t.percentage < 65)
    .sort((a, b) => a.percentage - b.percentage);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero border-b border-border">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">EXAMTIS</h1>
              <p className="text-sm text-muted-foreground">Simulados para Certificações</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="text-muted-foreground hover:text-foreground">
                <Shield className="h-4 w-4 mr-2" /> Admin
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4 mr-2" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                <Trophy className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Simulados Completos</p>
                <p className="text-2xl font-bold">{completedExams.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-accent">
                <Target className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Média de Acertos</p>
                <p className="text-2xl font-bold">{avgScore}%</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${weakTopics.length > 0 ? 'gradient-warning' : 'gradient-success'}`}>
                <TrendingDown className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tópicos para Focar</p>
                <p className="text-2xl font-bold">{weakTopics.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* New Exam */}
          <Card className="border-0 shadow-lg animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" /> Novo Simulado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Número de questões</label>
                <div className="flex gap-2">
                  {[20, 30, 40].map(n => (
                    <Button key={n} variant={questionCount === n ? 'default' : 'outline'} size="sm"
                      onClick={() => setQuestionCount(n)}
                      className={questionCount === n ? 'gradient-primary text-primary-foreground' : ''}>
                      {n} questões
                    </Button>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Questões agrupadas por tópico, proporcionais ao peso do syllabus ITIL 4.
              </p>
              <Button onClick={createExam} className="gradient-primary text-primary-foreground" size="lg">
                <Play className="h-4 w-4 mr-2" /> Iniciar Simulado
              </Button>
            </CardContent>
          </Card>

          {/* Practice Mode */}
          <Card className="border-0 shadow-lg animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-accent" /> Treino por Tópico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Escolha um tópico específico e pratique suas questões com feedback imediato e explicações.
              </p>
              <Button onClick={() => navigate('/practice')} className="gradient-accent text-accent-foreground" size="lg">
                <GraduationCap className="h-4 w-4 mr-2" /> Praticar por Tópico
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weak Topics */}
          <Card className="border-0 shadow-md animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingDown className="h-5 w-5 text-warning" /> Onde Focar os Estudos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topicStats.filter(t => t.total > 0).length === 0 ? (
                <p className="text-sm text-muted-foreground">Faça seu primeiro simulado para ver as estatísticas.</p>
              ) : weakTopics.length === 0 ? (
                <p className="text-sm text-success font-medium">🎉 Excelente! Você está acima de 65% em todos os tópicos praticados!</p>
              ) : (
                <div className="space-y-4">
                  {weakTopics.map((t, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium truncate max-w-[200px]">{t.name}</span>
                        <span className={`text-sm font-mono font-bold ${t.percentage < 40 ? 'text-destructive' : 'text-warning'}`}>
                          {t.percentage}%
                        </span>
                      </div>
                      <Progress value={t.percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">{t.correct}/{t.total} acertos • Peso: {(t.weight * 100).toFixed(1)}%</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Topic Performance */}
          <Card className="border-0 shadow-md animate-fade-in" style={{ animationDelay: '0.25s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-primary" /> Desempenho por Tópico
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topicStats.filter(t => t.total > 0).length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum dado ainda. Faça um simulado!</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {topicStats.filter(t => t.total > 0).sort((a, b) => b.percentage - a.percentage).map((t, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{t.name}</p>
                        <Progress value={t.percentage} className="h-1.5 mt-1" />
                      </div>
                      <span className={`text-sm font-mono font-bold min-w-[3rem] text-right ${t.percentage >= 65 ? 'text-success' : t.percentage >= 40 ? 'text-warning' : 'text-destructive'}`}>
                        {t.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Exam History */}
        <Card className="border-0 shadow-md animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-primary" /> Histórico de Simulados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {exams.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum simulado realizado ainda.</p>
            ) : (
              <div className="space-y-2">
                {exams.map((exam) => (
                  <div key={exam.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => exam.completed ? navigate(`/result/${exam.id}`) : navigate(`/exam/${exam.id}`)}>
                    <div>
                      <p className="text-sm font-medium">
                        {(exam as any).is_practice ? '🎯 Treino' : '📝 Simulado'} • {exam.total_questions} questões
                        {exam.completed && exam.score !== null && (
                          <span className={`ml-2 font-mono ${(exam.score / exam.total_questions * 100) >= 65 ? 'text-success' : 'text-destructive'}`}>
                            {Math.round(exam.score / exam.total_questions * 100)}%
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(exam.started_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${exam.completed ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {exam.completed ? 'Concluído' : 'Em andamento'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
