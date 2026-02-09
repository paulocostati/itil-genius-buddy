import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Flag, Clock, CheckCircle } from 'lucide-react';
import ExamIntro from '@/components/ExamIntro';

interface ExamQuestion {
  id: string;
  question_id: string;
  question_order: number;
  selected_option: string | null;
  questions: {
    id: string;
    statement: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    question_type: string;
    topics: {
      name: string;
    };
  };
}

export default function Exam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes in seconds
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadExam();
  }, [examId]);

  // Countdown timer
  useEffect(() => {
    if (!started) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started]);

  async function loadExam() {
    const { data } = await supabase
      .from('exam_questions')
      .select('id, question_id, question_order, selected_option, questions(id, statement, option_a, option_b, option_c, option_d, question_type, topics(name))')
      .eq('exam_id', examId!)
      .order('question_order');

    if (data) {
      const qs = data as unknown as ExamQuestion[];
      setQuestions(qs);
      const restored: Record<string, string> = {};
      for (const q of qs) {
        if (q.selected_option) restored[q.id] = q.selected_option;
      }
      if (Object.keys(restored).length > 0) {
        setAnswers(restored);
        setStarted(true); // Resume if already started
      }
    }
    setLoading(false);
  }

  const selectOption = useCallback((questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  }, []);

  async function finishExam() {
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const questionIds = questions.map(q => q.question_id);
    const { data: correctData } = await supabase
      .from('questions')
      .select('id, correct_option')
      .in('id', questionIds);

    const correctMap = new Map<string, string>();
    if (correctData) {
      for (const q of correctData as any[]) {
        correctMap.set(q.id, q.correct_option);
      }
    }

    let score = 0;
    for (const q of questions) {
      const selected = answers[q.id] || null;
      const correct = correctMap.get(q.question_id) || '';
      const isCorrect = selected === correct;
      if (isCorrect) score++;

      await supabase
        .from('exam_questions')
        .update({ selected_option: selected, is_correct: isCorrect, answered_at: new Date().toISOString() })
        .eq('id', q.id);
    }

    await supabase
      .from('exams')
      .update({ completed: true, score, finished_at: new Date().toISOString() })
      .eq('id', examId!);

    navigate(`/result/${examId}`, { replace: true });
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  // Show intro screen before starting
  if (!started && Object.keys(answers).length === 0) {
    return <ExamIntro totalQuestions={questions.length} onStart={() => setStarted(true)} />;
  }

  const current = questions[currentIndex];
  const currentTopicName = current?.questions?.topics?.name || '';
  const prevTopicName = currentIndex > 0 ? questions[currentIndex - 1]?.questions?.topics?.name || '' : '';
  const showTopicHeader = currentTopicName !== prevTopicName;
  if (!current) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Nenhuma questão encontrada.</div>;

  const answeredCount = Object.keys(answers).length;
  const options: { key: string; label: string; text: string }[] = [
    { key: 'A', label: 'A', text: current.questions.option_a },
    { key: 'B', label: 'B', text: current.questions.option_b },
    { key: 'C', label: 'C', text: current.questions.option_c },
    { key: 'D', label: 'D', text: current.questions.option_d },
  ];

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeWarning = timeLeft <= 300; // 5 min warning
  const timeCritical = timeLeft <= 60; // 1 min critical

  const questionType = current.questions.question_type || 'standard';
  const typeBadge: Record<string, { label: string; color: string }> = {
    standard: { label: 'STD', color: 'bg-primary/15 text-primary' },
    list: { label: 'LIST', color: 'bg-accent/15 text-accent' },
    missing_word: { label: 'MW', color: 'bg-warning/15 text-warning' },
    negative: { label: 'NEG', color: 'bg-destructive/15 text-destructive' },
  };
  const badge = typeBadge[questionType] || typeBadge.standard;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Questão</span>
            <span className="text-lg font-bold text-primary">{currentIndex + 1}</span>
            <span className="text-sm text-muted-foreground">de {questions.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 text-sm font-mono font-bold px-3 py-1 rounded-lg ${
              timeCritical ? 'bg-destructive/15 text-destructive animate-pulse' :
              timeWarning ? 'bg-warning/15 text-warning' :
              'bg-muted text-muted-foreground'
            }`}>
              <Clock className="h-4 w-4" />
              <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="font-medium">{answeredCount}/{questions.length}</span>
            </div>
          </div>
        </div>
        {/* Question navigation dots */}
        <div className="container mx-auto px-4 pb-3">
          <div className="flex flex-wrap gap-1">
            {questions.map((q, i) => (
              <button key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`h-7 w-7 rounded-md text-xs font-medium transition-all ${
                  i === currentIndex
                    ? 'gradient-primary text-primary-foreground shadow-md scale-110'
                    : answers[q.id]
                    ? 'bg-success/20 text-success border border-success/30'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 container mx-auto px-4 py-6 max-w-3xl">
        {showTopicHeader && (
          <div className="mb-4 px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-primary/10">
              {currentTopicName}
            </span>
          </div>
        )}
        <Card className="border-0 shadow-lg animate-fade-in" key={current.id}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-base leading-relaxed font-medium mb-6">{current.questions.statement}</p>
            <div className="space-y-3">
              {options.map(opt => {
                const selected = answers[current.id] === opt.key;
                return (
                  <button key={opt.key}
                    onClick={() => selectOption(current.id, opt.key)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selected
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border hover:border-primary/40 hover:bg-muted/50'
                    }`}>
                    <div className="flex items-start gap-3">
                      <span className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                        selected ? 'gradient-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {opt.label}
                      </span>
                      <span className="text-sm leading-relaxed pt-1">{opt.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom navigation */}
      <div className="border-t bg-card shadow-sm sticky bottom-0">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={currentIndex === 0} onClick={() => setCurrentIndex(i => i - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
          </Button>
          {currentIndex < questions.length - 1 ? (
            <Button size="sm" onClick={() => setCurrentIndex(i => i + 1)} className="gradient-primary text-primary-foreground">
              Próxima <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button size="sm" onClick={finishExam} disabled={submitting} className="gradient-accent text-accent-foreground">
              <Flag className="h-4 w-4 mr-1" /> {submitting ? 'Finalizando...' : 'Finalizar Prova'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
