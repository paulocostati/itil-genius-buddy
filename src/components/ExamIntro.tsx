import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Target, BookOpen, CheckCircle, AlertTriangle, ListChecks } from 'lucide-react';

interface ExamIntroProps {
  examTitle?: string;
  totalQuestions: number;
  durationMinutes?: number;
  passPercentage?: number;
  onStart: () => void;
}

export default function ExamIntro({
  examTitle = "Simulado de Exame",
  totalQuestions,
  durationMinutes = 60,
  passPercentage = 65,
  onStart
}: ExamIntroProps) {
  const passMark = Math.ceil(totalQuestions * (passPercentage / 100));

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-0 shadow-2xl animate-fade-in">
        <CardContent className="pt-8 pb-8 space-y-6">
          <div className="text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">{examTitle}</h1>
            <p className="text-sm text-muted-foreground mt-1">Simulado Oficial</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <Clock className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Duração</p>
                <p className="text-sm font-bold">{durationMinutes} minutos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <Target className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Questões</p>
                <p className="text-sm font-bold">{totalQuestions}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Aprovação</p>
                <p className="text-sm font-bold">{passPercentage}% ({passMark}/{totalQuestions})</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <ListChecks className="h-5 w-5 text-accent flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Bloom's</p>
                <p className="text-sm font-bold">Nível 1 e 2</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <h3 className="font-semibold text-foreground">Tipos de Questão:</h3>
            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary mt-0.5">STD</span>
                <p><strong className="text-foreground">Standard</strong> — Pergunta com 4 alternativas, 1 correta.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent mt-0.5">LIST</span>
                <p><strong className="text-foreground">List</strong> — 4 afirmativas, selecione a opção com as 2 corretas.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning/15 text-warning mt-0.5">MW</span>
                <p><strong className="text-foreground">Missing Word</strong> — Complete a frase com a palavra que falta.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/15 text-destructive mt-0.5">NEG</span>
                <p><strong className="text-foreground">Negative</strong> — Qual NÃO é... (atenção à negação).</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20">
            <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Este é um exame <strong className="text-foreground">fechado</strong> (sem consulta). O timer inicia quando você clicar em "Iniciar". Não há pontuação negativa.
            </p>
          </div>

          <Button onClick={onStart} size="lg" className="w-full gradient-primary text-primary-foreground text-base">
            Iniciar Simulado
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
