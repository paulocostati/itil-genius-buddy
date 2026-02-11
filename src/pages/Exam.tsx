import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Flag, Clock, CheckCircle, Save } from 'lucide-react';
import ExamIntro from '@/components/ExamIntro';
import { toast } from 'sonner';

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

  // Data State
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [examData, setExamData] = useState<any>(null);

  // UI State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Flow State
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (examId) loadExam();
    return () => stopTimer();
  }, [examId]);

  // Timer Effect
  useEffect(() => {
    if (started && timeLeft !== null) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            stopTimer();
            finishExam(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => stopTimer();
  }, [started]);

  function stopTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  async function loadExam() {
    try {
      // 1. Fetch Exam Details with Product Info
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .select(`
            *,
            product:products (
                title,
                duration_minutes
            )
        `)
        .eq('id', examId!)
        .single();

      if (examError || !exam) throw new Error("Erro ao carregar exame.");
      setExamData(exam);

      // 2. Check if completed
      if (exam.completed) {
        navigate(`/result/${examId}`, { replace: true });
        return;
      }

      // 3. Fetch Questions
      const { data: qData, error: qError } = await supabase
        .from('exam_questions')
        .select('id, question_id, question_order, selected_option, questions(id, statement, option_a, option_b, option_c, option_d, question_type, topics(name))')
        .eq('exam_id', examId!)
        .order('question_order');

      if (qError) throw qError;

      const qs = qData as unknown as ExamQuestion[];
      setQuestions(qs);

      // 4. Restore Answers
      const restored: Record<string, string> = {};
      let answeredCount = 0;
      for (const q of qs) {
        if (q.selected_option) {
          restored[q.id] = q.selected_option;
          answeredCount++;
        }
      }
      setAnswers(restored);

      // 5. Determine State
      const startTime = new Date(exam.started_at).getTime();
      const now = new Date().getTime();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);

      const durationMinutes = exam.product?.duration_minutes || 60;
      const timeLimitSeconds = durationMinutes * 60;

      // Allow restart if < 2 mins elapsed AND no answers
      const isFresh = elapsedSeconds < 120 && answeredCount === 0;

      if (!isFresh) {
        setStarted(true);
        const remaining = Math.max(0, timeLimitSeconds - elapsedSeconds);
        setTimeLeft(remaining);
      } else {
        setStarted(false);
      }

    } catch (error) {
      console.error(error);
      toast.error("Falha ao carregar o exame.");
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  const handleStartExam = async () => {
    setStarted(true);
    const now = new Date().toISOString();
    await supabase.from('exams').update({ started_at: now }).eq('id', examId!);

    // Reset timer
    const durationMinutes = examData?.product?.duration_minutes || 60;
    setTimeLeft(durationMinutes * 60);
  };

  const selectOption = useCallback(async (questionId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
    await supabase
      .from('exam_questions')
      .update({ selected_option: option, answered_at: new Date().toISOString() })
      .eq('id', questionId);
  }, []);

  async function finishExam(auto = false) {
    if (submitting) return;
    setSubmitting(true);
    stopTimer();

    if (auto) toast.info("Tempo esgotado! Enviando respostas...");
    else toast.info("Finalizando exame...");

    try {
      const questionIds = questions.map(q => q.question_id);
      const { data: correctData } = await supabase
        .from('questions')
        .select('id, correct_option')
        .in('id', questionIds);

      const correctMap = new Map<string, string>();
      correctData?.forEach((q: any) => correctMap.set(q.id, q.correct_option));

      let score = 0;
      const updates = [];

      for (const q of questions) {
        const selected = answers[q.id] || null;
        const correct = correctMap.get(q.question_id);
        const isCorrect = selected === correct;
        if (isCorrect) score++;

        updates.push(
          supabase
            .from('exam_questions')
            .update({ is_correct: isCorrect, selected_option: selected })
            .eq('id', q.id)
        );
      }

      await Promise.all(updates);
      await supabase
        .from('exams')
        .update({
          completed: true,
          score,
          finished_at: new Date().toISOString()
        })
        .eq('id', examId!);

      navigate(`/result/${examId}`, { replace: true });
    } catch (e) {
      console.error(e);
      toast.error("Erro ao finalizar. Tente novamente.");
      setSubmitting(false);
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  if (!started && examData) {
    return (
      <ExamIntro
        examTitle={examData.product?.title}
        durationMinutes={examData.product?.duration_minutes}
        totalQuestions={questions.length}
        onStart={handleStartExam}
      />
    );
  }

  const current = questions[currentIndex];
  if (!current) return <div className="p-8 text-center">Questão não encontrada</div>;

  const currentTopicName = current?.questions?.topics?.name || '';
  const prevTopicName = currentIndex > 0 ? questions[currentIndex - 1]?.questions?.topics?.name || '' : '';
  const showTopicHeader = currentTopicName !== prevTopicName;

  const answeredCount = Object.keys(answers).length;
  const options = ['A', 'B', 'C', 'D'].map(key => ({
    key,
    label: key,
    text: (current.questions as any)[`option_${key.toLowerCase()}`]
  }));

  const minutes = timeLeft !== null ? Math.floor(timeLeft / 60) : 0;
  const seconds = timeLeft !== null ? timeLeft % 60 : 0;
  const timeWarning = (timeLeft || 0) <= 300;
  const timeCritical = (timeLeft || 0) <= 60;

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
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Questão</span>
            <span className="text-lg font-bold text-primary">{currentIndex + 1}</span>
            <span className="text-sm text-muted-foreground">/ {questions.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 text-sm font-mono font-bold px-3 py-1 rounded-lg transition-colors ${timeCritical ? 'bg-destructive/15 text-destructive animate-pulse' :
              timeWarning ? 'bg-warning/15 text-warning' :
                'bg-muted text-muted-foreground'
              }`}>
              <Clock className="h-4 w-4" />
              <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
            </div>
            <div className="flex items-center gap-1 text-sm hidden sm:flex">
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(answeredCount / questions.length) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
        {/* Navigation Bar (Scrollable) */}
        <div className="border-t bg-muted/20">
          <div className="container mx-auto px-4 py-2 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {questions.map((q, i) => (
                <button key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-8 w-8 rounded-md text-xs font-bold transition-all flex items-center justify-center ${i === currentIndex
                      ? 'bg-primary text-primary-foreground shadow-md scale-110'
                      : answers[q.id]
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-background text-muted-foreground border hover:bg-muted'
                    }`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 container mx-auto px-4 py-6 max-w-3xl">
        {showTopicHeader && (
          <div className="mb-4 flex items-center gap-2">
            <span className="h-px flex-1 bg-border"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {currentTopicName}
            </span>
            <span className="h-px flex-1 bg-border"></span>
          </div>
        )}
        <Card className="border-0 shadow-lg animate-fade-in" key={current.id}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-base md:text-lg leading-relaxed font-medium mb-8 text-foreground">
              {current.questions.statement}
            </p>
            <div className="space-y-3">
              {options.map(opt => {
                const selected = answers[current.id] === opt.key;
                return (
                  <button key={opt.key}
                    onClick={() => selectOption(current.id, opt.key)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 group ${selected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-muted hover:border-primary/40 hover:bg-muted/30'
                      }`}>
                    <div className="flex items-start gap-4">
                      <span className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold transition-colors ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-muted/80'
                        }`}>
                        {opt.label}
                      </span>
                      <span className="text-base pt-0.5">{opt.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom navigation */}
      <div className="border-t bg-card shadow-sm sticky bottom-0 p-4">
        <div className="container mx-auto max-w-3xl flex items-center justify-between gap-4">
          <Button variant="outline" onClick={() => setCurrentIndex(i => i - 1)} disabled={currentIndex === 0}>
            <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
          </Button>

          {currentIndex < questions.length - 1 ? (
            <Button onClick={() => setCurrentIndex(i => i + 1)} className="min-w-[120px]">
              Próxima <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => finishExam(false)} disabled={submitting} variant="destructive" className="min-w-[140px]">
              {submitting ? 'Enviando...' : 'Finalizar Prova'} <Flag className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
