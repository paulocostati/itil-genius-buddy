import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Settings,
  ListFilter,
  Layers,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  Activity,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

interface TopicInfo {
  id: string;
  name: string;
  area: string;
  weight: number;
  questionCount: number;
  bloomsLevel: string;
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
  question_type: string;
  topic_id: string;
}

type QuestionType = 'standard' | 'negative' | 'missing_word' | 'list';

const QUESTION_TYPES: { id: QuestionType; label: string; color: string }[] = [
  { id: 'standard', label: 'Padrão', color: 'bg-blue-100 text-blue-800' },
  { id: 'negative', label: 'Negativa (EXCETO)', color: 'bg-red-100 text-red-800' },
  { id: 'missing_word', label: 'Completar Lacuna', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'list', label: 'Lista', color: 'bg-purple-100 text-purple-800' },
];

export default function Practice() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State for Configuration
  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);

  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(['standard', 'negative', 'missing_word', 'list']));
  const [questionCount, setQuestionCount] = useState<number[]>([10]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // State for Session
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });
  const [topicPerformance, setTopicPerformance] = useState<Record<string, { correct: number, total: number }>>({});

  // Initial Data Load
  useEffect(() => {
    loadTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-select topic from URL if present
  useEffect(() => {
    const urlTopic = searchParams.get('topic');
    if (urlTopic && topics.length > 0 && !sessionActive && !sessionFinished) {
      if (selectedTopics.size === 0) {
        setSelectedTopics(new Set([urlTopic]));
      }
    }
  }, [topics, searchParams, sessionActive, sessionFinished, selectedTopics.size]);

  async function loadTopics() {
    try {
      setLoadingTopics(true);
      const categoryId = searchParams.get('category');

      // Check Subscription or Entitlement
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: hasSub } = await (supabase.rpc as any)('has_active_subscription', { _user_id: user.id });
        if (hasSub) {
          setIsSubscribed(true);
        } else {
          // Check if user has any active entitlement
          const { data: entitlement } = await (supabase.from as any)('entitlements')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'ACTIVE')
            .limit(1)
            .maybeSingle();
          setIsSubscribed(!!entitlement);
        }
      }

      let query = (supabase.from as any)('topics').select('id, name, area, weight, category_id');

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data: topicsData, error: topicsError } = await query;

      if (topicsError) throw topicsError;

      const { data: counts, error: countError } = await (supabase as any).rpc('get_topic_question_counts');

      let countMap = new Map<string, number>();

      if (!countError && counts) {
        (counts as any[]).forEach((c: { topic_id: string; count: number }) => {
          countMap.set(c.topic_id, Number(c.count));
        });
      }

      if (countMap.size === 0) {
        const { data: allQ, error: qError } = await supabase.from('questions').select('topic_id');
        if (!qError && allQ) {
          allQ.forEach(q => countMap.set(q.topic_id, (countMap.get(q.topic_id) || 0) + 1));
        }
      }

      if (topicsData) {
        const activeTopics = topicsData
          .filter(t => (countMap.get(t.id) || 0) > 0)
          .map(t => ({
            id: t.id,
            name: t.name,
            area: t.area || 'Geral',
            weight: t.weight || 1,
            questionCount: countMap.get(t.id) || 0,
            bloomsLevel: 'N/A'
          }))
          .sort((a, b) => a.area.localeCompare(b.area) || a.name.localeCompare(b.name));

        setTopics(activeTopics);
      }
    } catch (error) {
      console.error("Error loading topics:", error);
      toast.error("Erro ao carregar tópicos");
    } finally {
      setLoadingTopics(false);
    }
  }

  const handleTopicToggle = (id: string) => {
    const newSet = new Set(selectedTopics);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedTopics(newSet);
  };

  const handleAreaToggle = (area: string) => {
    const areaTopicIds = topics.filter(t => t.area === area).map(t => t.id);
    const allSelected = areaTopicIds.every(id => selectedTopics.has(id));

    const newSet = new Set(selectedTopics);
    if (allSelected) {
      areaTopicIds.forEach(id => newSet.delete(id));
    } else {
      areaTopicIds.forEach(id => newSet.add(id));
    }
    setSelectedTopics(newSet);
  };

  const startPractice = async () => {
    if (selectedTopics.size === 0) {
      toast.warning("Selecione pelo menos um tópico.");
      return;
    }

    setLoadingQuestions(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .in('topic_id', Array.from(selectedTopics))
        .in('question_type', Array.from(selectedTypes));

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.info("Nenhuma questão encontrada com esses filtros.");
        setLoadingQuestions(false);
        return;
      }

      const shuffled = data.sort(() => Math.random() - 0.5).slice(0, questionCount[0]);

      setQuestions(shuffled);
      setCurrentIndex(0);
      setStats({ correct: 0, wrong: 0 });
      setTopicPerformance({});
      setShowAnswer(false);
      setSelectedOption(null);
      setSessionActive(true);
      setSessionFinished(false);
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao iniciar prática: " + e.message);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const resetPractice = () => {
    setSessionActive(false);
    setSessionFinished(false);
    setQuestions([]);
  };

  const handleAnswer = useCallback((opt: string) => {
    if (showAnswer) return;
    setSelectedOption(opt);
    setShowAnswer(true);

    const question = questions[currentIndex];
    const isCorrect = opt === question.correct_option;

    setTopicPerformance(prev => {
      const current = prev[question.topic_id] || { correct: 0, total: 0 };
      return {
        ...prev,
        [question.topic_id]: {
          correct: current.correct + (isCorrect ? 1 : 0),
          total: current.total + 1
        }
      };
    });

    if (isCorrect) {
      setStats(s => ({ ...s, correct: s.correct + 1 }));
    } else {
      setStats(s => ({ ...s, wrong: s.wrong + 1 }));
    }
  }, [showAnswer, questions, currentIndex]);

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setShowAnswer(false);
      setSelectedOption(null);
    } else {
      setSessionFinished(true);
      setSessionActive(false);
    }
  };

  const availableQuestionCount = useMemo(() => {
    if (selectedTopics.size === 0) return topics.reduce((sum, t) => sum + t.questionCount, 0);
    return topics.filter(t => selectedTopics.has(t.id)).reduce((sum, t) => sum + t.questionCount, 0);
  }, [selectedTopics, topics]);

  // Clamp questionCount when available changes
  useEffect(() => {
    const maxAllowed = isSubscribed ? availableQuestionCount : Math.min(availableQuestionCount, 20);
    if (maxAllowed > 0 && questionCount[0] > maxAllowed) {
      setQuestionCount([Math.max(5, maxAllowed)]);
    }
  }, [availableQuestionCount, isSubscribed]);

  const groupedTopics = useMemo(() => {
    const groups: Record<string, TopicInfo[]> = {};
    topics.forEach(t => {
      if (!groups[t.area]) groups[t.area] = [];
      groups[t.area].push(t);
    });
    return groups;
  }, [topics]);

  const recommendations = useMemo(() => {
    return Object.entries(topicPerformance)
      .map(([id, p]) => {
        const topic = topics.find(t => t.id === id);
        const pct = Math.round((p.correct / p.total) * 100);
        return { name: topic?.name || 'Desconhecido', pct, correct: p.correct, total: p.total };
      })
      .sort((a, b) => a.pct - b.pct);
  }, [topicPerformance, topics]);

  // --- RENDER LOGIC ---

  if (loadingTopics) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (sessionFinished) {
    const percentage = Math.round((stats.correct / questions.length) * 100);
    const critical = recommendations.filter(r => r.pct < 70);

    return (
      <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={resetPractice} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Voltar ao Início
          </Button>
          <Badge variant={percentage >= 70 ? "secondary" : "destructive"} className={`px-4 py-1 text-sm font-bold ${percentage >= 70 ? 'bg-green-100 text-green-700' : ''}`}>
            {percentage}% de Aproveitamento
          </Badge>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Resumo do Treino</h1>
          <p className="text-muted-foreground">Veja abaixo seu desempenho por tópico e recomendações de estudo.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center p-6 space-y-2">
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto" />
            <p className="text-2xl font-bold">{stats.correct}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Acertos</p>
          </Card>
          <Card className="text-center p-6 space-y-2">
            <XCircle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="text-2xl font-bold">{stats.wrong}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Erros</p>
          </Card>
          <Card className="text-center p-6 space-y-2">
            <Target className="h-8 w-8 text-primary mx-auto" />
            <p className="text-2xl font-bold">{questions.length}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
          </Card>
        </div>

        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Activity className="h-5 w-5" /> Relatório de Estudo
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {critical.length > 0 ? (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex gap-4">
                <AlertCircle className="h-6 w-6 text-red-500 shrink-0 mt-1" />
                <div className="space-y-1">
                  <h4 className="font-bold text-red-900 uppercase text-xs tracking-wider">Prioridade de Estudo:</h4>
                  <p className="text-sm text-red-800">
                    Você teve dificuldade com os seguintes tópicos. Recomendamos revisar o material teórico:
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {critical.map((r, i) => (
                      <span key={i} className="px-2 py-1 bg-white border border-red-200 text-red-700 rounded text-xs font-semibold">
                        {r.name} ({r.pct}%)
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex gap-4">
                <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-1" />
                <div className="space-y-1">
                  <h4 className="font-bold text-green-900 uppercase text-xs tracking-wider">Excelente Trabalho!</h4>
                  <p className="text-sm text-green-800">
                    Seu desempenho em todos os tópicos selecionados foi satisfatório. Continue praticando para masterizar!
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Detalhe por Tópico</h4>
              <div className="grid gap-3">
                {recommendations.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-transparent hover:border-muted-foreground/10 transition-colors">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.correct} acertos de {r.total} questões</p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold ${r.pct >= 80 ? 'bg-green-100 text-green-700' :
                      r.pct >= 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                      {r.pct}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button className="w-full h-12 text-lg gradient-primary text-primary-foreground" onClick={resetPractice}>
              Praticar Novamente
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!sessionActive) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Criar Sessão de Treino</h1>
            <p className="text-muted-foreground">Personalize seu estudo focado em tópicos específicos.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 border-primary/10 shadow-sm">
              <CardHeader className="pb-3 border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    <CardTitle>Áreas de Conhecimento</CardTitle>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => {
                        const allIds = topics.map(t => t.id);
                        const isAllSelected = allIds.every(id => selectedTopics.has(id));
                        if (isAllSelected) setSelectedTopics(new Set());
                        else setSelectedTopics(new Set(allIds));
                      }}
                    >
                      {topics.every(t => selectedTopics.has(t.id)) ? 'Desmarcar Tudo' : 'Selecionar Tudo'}
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      {selectedTopics.size} tópicos selecionados
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px] p-4">
                  {Object.entries(groupedTopics).map(([area, areaTopics]) => (
                    <div key={area} className="mb-6 last:mb-0">
                      <div className="flex items-center justify-between mb-2 sticky top-0 bg-background/95 backdrop-blur py-2 z-10 border-b">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`area-${area}`}
                            checked={areaTopics.every(id => selectedTopics.has(id.id))}
                            onCheckedChange={() => handleAreaToggle(area)}
                          />
                          <Label htmlFor={`area-${area}`} className="font-semibold text-base cursor-pointer">
                            {area}
                          </Label>
                        </div>
                        <Badge variant="secondary" className="text-xs">{areaTopics.reduce((acc, t) => acc + t.questionCount, 0)} questões</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6 pt-2">
                        {areaTopics.map(topic => (
                          <div key={topic.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${selectedTopics.has(topic.id)
                              ? 'bg-primary/5 border-primary/30'
                              : 'hover:bg-muted border-transparent'
                              }`}
                            onClick={() => handleTopicToggle(topic.id)}
                          >
                            <Checkbox
                              id={topic.id}
                              checked={selectedTopics.has(topic.id)}
                              className="mt-1"
                            />
                            <div className="grid gap-1">
                              <Label htmlFor={topic.id} className="font-medium cursor-pointer leading-tight">
                                {topic.name}
                              </Label>
                              <span className="text-xs text-muted-foreground">{topic.questionCount} questões</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-2 border-primary/10 shadow-sm sticky top-6">
              <CardHeader className="bg-muted/30 border-b pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <CardTitle>Configurações</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Label className="font-medium">Quantidade de Questões</Label>
                    <span className="text-sm font-bold bg-primary/10 px-2 py-0.5 rounded text-primary">{questionCount}</span>
                  </div>
                  <Slider
                    value={questionCount}
                    onValueChange={(val) => {
                      if (!isSubscribed && val[0] > 20) {
                        setQuestionCount([20]);
                        toast.info("Limite de 20 questões para versão gratuita.");
                      } else {
                        setQuestionCount(val);
                      }
                    }}
                    max={isSubscribed ? Math.max(5, availableQuestionCount) : Math.min(Math.max(5, availableQuestionCount), 20)}
                    min={5}
                    step={5}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Mín: 5</span>
                    <span>Máx: {isSubscribed ? availableQuestionCount : Math.min(availableQuestionCount, 20)}</span>
                  </div>
                  {!isSubscribed && (
                    <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
                      Modo gratuito limitado a 20 questões. Adquira o acesso completo para liberar todo o banco.
                    </p>
                  )}
                </div>

                <div className="space-y-4 pt-2 border-t text-sm">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium cursor-pointer" htmlFor="auto-reveal">Revelar resposta automaticamente</Label>
                    <Checkbox id="auto-reveal" checked={showAnswer} onCheckedChange={(checked) => setShowAnswer(!!checked)} />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <ListFilter className="h-4 w-4" />
                    <Label className="font-medium">Tipos de Questão</Label>
                  </div>
                  {QUESTION_TYPES.map(type => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type.id}`}
                        checked={selectedTypes.has(type.id)}
                        onCheckedChange={(checked) => {
                          const newSet = new Set(selectedTypes);
                          if (checked) newSet.add(type.id);
                          else newSet.delete(type.id);
                          setSelectedTypes(newSet);
                        }}
                      />
                      <Label htmlFor={`type-${type.id}`} className="text-sm font-normal cursor-pointer flex-1">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-6">
                <Button
                  className="w-full text-lg h-12 shadow-lg"
                  size="lg"
                  onClick={startPractice}
                  disabled={selectedTopics.size === 0 || loadingQuestions}
                >
                  {loadingQuestions ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Play className="mr-2 h-5 w-5 fill-current" />
                  )}
                  Iniciar Treino
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // --- ACTIVE SESSION ---
  const currentQ = questions[currentIndex];
  const typeInfo = QUESTION_TYPES.find(t => t.id === currentQ.question_type) || QUESTION_TYPES[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b bg-card shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => {
            if (confirm("Deseja sair do treino atual? O progresso será perdido.")) {
              resetPractice();
            }
          }}>
            <XCircle className="h-4 w-4 mr-2" /> Encerrar Treino
          </Button>

          <div className="flex items-center gap-6 text-sm font-medium">
            <div className="flex flex-col items-center">
              <span className="text-xs text-muted-foreground uppercase">Questão</span>
              <span>{currentIndex + 1} <span className="text-muted-foreground">/ {questions.length}</span></span>
            </div>
            <div className="h-8 w-px bg-border"></div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>{stats.correct}</span>
              </div>
              <div className="flex items-center gap-1.5 text-red-500">
                <XCircle className="h-4 w-4" />
                <span>{stats.wrong}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="h-1 bg-muted w-full">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl flex flex-col justify-center min-h-[60vh]">
        <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardContent className="pt-8 pb-8 px-6 md:px-10">
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="outline" className={`${typeInfo.color} border-0 px-3 py-1`}>
                {typeInfo.label}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {topics.find(t => t.id === currentQ.topic_id)?.name || 'Tópico Geral'}
              </Badge>
            </div>

            <h2 className="text-xl md:text-2xl font-medium leading-relaxed text-foreground mb-8">
              {currentQ.statement}
            </h2>

            <div className="space-y-3">
              {[
                { key: 'A', text: currentQ.option_a },
                { key: 'B', text: currentQ.option_b },
                { key: 'C', text: currentQ.option_c },
                { key: 'D', text: currentQ.option_d }
              ].map((opt) => {
                const isSelected = selectedOption === opt.key;
                const isCorrect = currentQ.correct_option === opt.key;

                let cardStyle = "border-2 hover:border-primary/50 cursor-pointer transition-all";
                let icon = null;

                if (showAnswer) {
                  if (isCorrect) {
                    cardStyle = "border-green-500 bg-green-50 ring-1 ring-green-500";
                    icon = <CheckCircle2 className="h-5 w-5 text-green-600 absolute right-4" />;
                  } else if (isSelected) {
                    cardStyle = "border-red-500 bg-red-50";
                    icon = <XCircle className="h-5 w-5 text-red-500 absolute right-4" />;
                  } else {
                    cardStyle = "border-transparent opacity-60";
                  }
                } else if (isSelected) {
                  cardStyle = "border-primary bg-primary/5 ring-1 ring-primary";
                }

                return (
                  <div
                    key={opt.key}
                    onClick={() => handleAnswer(opt.key)}
                    className={`relative p-4 rounded-xl flex items-start gap-4 ${cardStyle} ${showAnswer ? 'cursor-default' : ''}`}
                  >
                    <div className={`flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold border ${showAnswer && isCorrect ? 'bg-green-600 text-white border-green-600' :
                      showAnswer && isSelected ? 'bg-red-500 text-white border-red-500' :
                        isSelected ? 'bg-primary text-primary-foreground border-primary' :
                          'bg-muted text-muted-foreground border-border'
                      }`}>
                      {opt.key}
                    </div>
                    <div className="text-base pt-1 pr-8">{opt.text}</div>
                    {icon}
                  </div>
                );
              })}
            </div>

            {showAnswer && currentQ.explanation && (
              <div className="mt-8 p-6 rounded-xl bg-blue-50/50 border border-blue-100 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-2 mb-2 text-blue-800 font-semibold">
                  <BookOpen className="h-4 w-4" />
                  <span>Explicação</span>
                </div>
                <p className="text-blue-900/80 leading-relaxed text-sm md:text-base">
                  {currentQ.explanation}
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="bg-muted/20 border-t p-4 flex justify-between items-center">
            <span className="text-sm text-muted-foreground hidden md:inline-block">
              ITIL 4 Foundation Practice
            </span>

            {showAnswer ? (
              <Button onClick={nextQuestion} size="lg" className="w-full md:w-auto shadow-md">
                {currentIndex < questions.length - 1 ? (
                  <>Próxima Questão <ChevronRight className="ml-2 h-4 w-4" /></>
                ) : (
                  <>Finalizar <CheckCircle2 className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            ) : (
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <Button variant="outline" onClick={() => setShowAnswer(true)} className="w-full md:w-auto">
                  <BookOpen className="mr-2 h-4 w-4" /> Revelar Resposta
                </Button>
                <div className="hidden md:flex items-center text-sm text-muted-foreground px-4">
                  Selecione uma alternativa para validar
                </div>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
