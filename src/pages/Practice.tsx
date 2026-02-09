import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ChevronLeft, ChevronRight, Eye, EyeOff, BookOpen } from 'lucide-react';

interface TopicInfo {
  id: string;
  name: string;
  area: string;
  weight: number;
  questionCount: number;
}

interface PracticeQuestion {
  id: string;
  statement: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string | null;
}

export default function Practice() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const topicId = searchParams.get('topic');

  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });

  useEffect(() => {
    if (topicId) {
      loadQuestions(topicId);
    } else {
      loadTopics();
    }
  }, [topicId]);

  async function loadTopics() {
    const { data: topicsData } = await supabase.from('topics').select('id, name, area, weight');
    const { data: questionsData } = await supabase.from('questions').select('id, topic_id');

    if (topicsData && questionsData) {
      const countMap = new Map<string, number>();
      for (const q of questionsData) {
        countMap.set(q.topic_id, (countMap.get(q.topic_id) || 0) + 1);
      }
      const grouped: Record<string, TopicInfo[]> = {};
      for (const t of topicsData as any[]) {
        const info: TopicInfo = { id: t.id, name: t.name, area: t.area, weight: Number(t.weight), questionCount: countMap.get(t.id) || 0 };
        if (!grouped[t.area]) grouped[t.area] = [];
        grouped[t.area].push(info);
      }
      setTopics(Object.values(grouped).flat());
    }
    setLoading(false);
  }

  async function loadQuestions(tid: string) {
    const { data } = await supabase
      .from('questions')
      .select('id, statement, option_a, option_b, option_c, option_d, correct_option, explanation')
      .eq('topic_id', tid);

    if (data) {
      setQuestions((data as PracticeQuestion[]).sort(() => Math.random() - 0.5));
    }
    setLoading(false);
  }

  const handleSelect = useCallback((opt: string) => {
    if (showAnswer) return;
    setSelectedOption(opt);
    setShowAnswer(true);
    const current = questions[currentIndex];
    if (opt === current.correct_option) {
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    }
  }, [showAnswer, questions, currentIndex]);

  function nextQuestion() {
    setSelectedOption(null);
    setShowAnswer(false);
    setCurrentIndex(i => i + 1);
  }

  function prevQuestion() {
    setSelectedOption(null);
    setShowAnswer(false);
    setCurrentIndex(i => i - 1);
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  // Topic selection view
  if (!topicId) {
    // Determine difficulty/level badges based on weight
    const getBadges = (weight: number): { label: string; color: string }[] => {
      const difficulty = weight >= 0.12 ? { label: 'ALTO', color: 'bg-destructive/15 text-destructive' }
        : weight >= 0.05 ? { label: 'MED', color: 'bg-primary/15 text-primary' }
        : { label: 'BAIXO', color: 'bg-success/15 text-success' };
      const level = weight >= 0.10 ? { label: 'NB2', color: 'bg-accent/15 text-accent' }
        : { label: 'NB1', color: 'bg-primary/15 text-primary' };
      return [difficulty, level];
    };

    return (
      <div className="min-h-screen bg-background">
        <div className="gradient-hero text-primary-foreground">
          <div className="container mx-auto px-4 py-8">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-primary-foreground hover:bg-primary-foreground/10 mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">📚 Selecione os Tópicos</h1>
            <p className="text-sm opacity-80 mt-1">Escolha um tópico para praticar questões específicas</p>
          </div>
        </div>
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {topics.sort((a, b) => b.weight - a.weight).map((t, idx) => {
              const badges = getBadges(t.weight);
              return (
                <Card key={t.id}
                  className="border border-border/60 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={() => navigate(`/practice?topic=${t.id}`)}>
                  <CardContent className="py-5 px-5 space-y-3">
                    <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                      {idx + 1}. {t.name}
                    </h3>
                    <div className="flex gap-2">
                      {badges.map((b, i) => (
                        <span key={i} className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${b.color}`}>
                          {b.label}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t.questionCount} questões • Peso {(t.weight * 100).toFixed(0)}% no exame
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // Practice question view
  if (questions.length === 0) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Nenhuma questão neste tópico.</div>;

  const current = questions[currentIndex];
  const options = [
    { key: 'A', text: current.option_a },
    { key: 'B', text: current.option_b },
    { key: 'C', text: current.option_c },
    { key: 'D', text: current.option_d },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/practice')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Tópicos
          </Button>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">{currentIndex + 1}/{questions.length}</span>
            <span className="text-success font-medium">✓ {stats.correct}</span>
            <span className="text-destructive font-medium">✗ {stats.wrong}</span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 container mx-auto px-4 py-6 max-w-3xl">
        <Card className="border-0 shadow-lg animate-fade-in" key={current.id}>
          <CardContent className="pt-6">
            <p className="text-base leading-relaxed font-medium mb-6">{current.statement}</p>
            <div className="space-y-3">
              {options.map(opt => {
                const isCorrect = opt.key === current.correct_option;
                const isSelected = opt.key === selectedOption;
                let className = 'border-border hover:border-primary/40 hover:bg-muted/50';
                if (showAnswer) {
                  if (isCorrect) className = 'border-success bg-success/10';
                  else if (isSelected) className = 'border-destructive bg-destructive/10';
                  else className = 'border-border opacity-50';
                } else if (isSelected) {
                  className = 'border-primary bg-primary/5 shadow-md';
                }
                return (
                  <button key={opt.key}
                    onClick={() => handleSelect(opt.key)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${className}`}>
                    <div className="flex items-start gap-3">
                      <span className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                        showAnswer && isCorrect ? 'gradient-success text-primary-foreground' :
                        showAnswer && isSelected ? 'bg-destructive text-destructive-foreground' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {opt.key}
                      </span>
                      <span className="text-sm leading-relaxed pt-1">{opt.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {showAnswer && current.explanation && (
              <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10 animate-fade-in">
                <p className="text-xs text-muted-foreground mb-1 font-medium">Explicação:</p>
                <p className="text-sm">{current.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom navigation */}
      <div className="border-t bg-card shadow-sm sticky bottom-0">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={currentIndex === 0} onClick={prevQuestion}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
          </Button>
          {showAnswer && currentIndex < questions.length - 1 ? (
            <Button size="sm" onClick={nextQuestion} className="gradient-primary text-primary-foreground">
              Próxima <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : showAnswer && currentIndex === questions.length - 1 ? (
            <Button size="sm" onClick={() => navigate('/practice')} className="gradient-accent text-accent-foreground">
              Finalizar Treino
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
