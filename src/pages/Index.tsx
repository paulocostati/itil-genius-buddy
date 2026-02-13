import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, BarChart3, BookOpen, Target, Layout, Smartphone, Layers } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

const plans = [
  { days: 30, price: 12900, label: "30 dias", desc: "Acesso completo a todas as certificações", popular: false },
  { days: 60, price: 19700, label: "60 dias", desc: "Mais tempo para revisar e consolidar conhecimento", popular: true },
  { days: 90, price: 27900, label: "90 dias", desc: "Preparação completa e intensiva — melhor custo por dia", popular: false },
];

const planFeatures = [
  "ITIL 4, AZ-900 e AI-900",
  "Simulados ilimitados",
  "Explicações detalhadas",
  "Dashboard de desempenho",
  "Compra única",
  "Ativação sob demanda",
];

const benefits = [
  { icon: Target, title: "Questões por prática e peso do exame", desc: "Organizadas de acordo com o syllabus oficial para foco máximo." },
  { icon: BookOpen, title: "Simulados no formato real da prova", desc: "Ambiente que replica fielmente a experiência do exame." },
  { icon: Layers, title: "Explicações detalhadas e objetivas", desc: "Cada questão acompanhada de justificativa clara." },
  { icon: BarChart3, title: "Diagnóstico de desempenho por área", desc: "Identifique exatamente onde precisa melhorar." },
  { icon: Layout, title: "Plataforma moderna e responsiva", desc: "Estude de qualquer lugar, em qualquer dispositivo." },
  { icon: Smartphone, title: "Acesso completo a 3 certificações", desc: "ITIL 4, AZ-900 e AI-900 incluídos em todos os planos." },
];

const faqs = [
  { q: "Quando começa meu acesso?", a: "Seu acesso começa quando você clicar em 'Ativar' no seu dashboard. Compre agora e ative quando estiver pronto para estudar." },
  { q: "Posso ativar depois?", a: "Sim! Após a confirmação do pagamento, seu crédito fica disponível no dashboard para ativação quando você quiser." },
  { q: "O acesso renova automaticamente?", a: "Não. Não há cobrança recorrente. Você compra uma vez e pronto." },
  { q: "Posso comprar novamente após expirar?", a: "Sim, basta adquirir um novo plano a qualquer momento." },
  { q: "A plataforma funciona em dispositivos móveis?", a: "Sim, a plataforma é 100% responsiva e funciona perfeitamente em qualquer dispositivo." },
];

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative pt-28 pb-36 overflow-hidden bg-background">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
            <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
              Acesso completo às certificações ITIL 4, AZ-900 e AI-900
            </p>
            <h1 className="text-4xl md:text-[3.5rem] leading-[1.1] font-extrabold tracking-tight text-foreground">
              Preparação estratégica para conquistar sua certificação{" "}
              <span className="text-gradient-primary">ITIL 4.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-[640px] leading-relaxed">
              Simulados estruturados com base no syllabus oficial, explicações
              detalhadas e diagnóstico inteligente para quem leva certificação a sério.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button size="lg" className="h-13 px-10 text-base font-semibold" asChild>
                <a href="#plans">Garantir meu acesso</a>
              </Button>
              <Button size="lg" variant="ghost" className="h-13 px-10 text-base text-muted-foreground hover:text-foreground" asChild>
                <a href="#benefits">Conhecer a plataforma <ArrowRight className="ml-2 h-4 w-4" /></a>
              </Button>
            </div>
          </div>
        </div>
        {/* Subtle gradient orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-primary/5 blur-[120px] -z-0" />
      </section>

      {/* Authority */}
      <section className="py-24 border-t border-border">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-6">
            Não é apenas um banco de questões.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            A Examtis foi criada para oferecer preparação estratégica, organizando
            questões por peso do syllabus oficial, permitindo que você estude com
            foco no que realmente importa para a prova.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-24 bg-muted/20 scroll-mt-20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Uma preparação estruturada e profissional
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((b) => (
              <div key={b.title} className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-5">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 border-t border-border">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 tracking-tight">
            Como funciona
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Escolha sua certificação", desc: "Navegue pelo catálogo e selecione o plano ideal para sua preparação." },
              { step: "02", title: "Realize simulados estratégicos", desc: "Questões organizadas por peso e prática do exame oficial." },
              { step: "03", title: "Analise e ajuste", desc: "Use o diagnóstico de desempenho para focar onde mais importa." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-5xl font-extralight text-primary/30 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="plans" className="py-24 bg-muted/20 scroll-mt-20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Escolha seu período de acesso</h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Compre uma vez. Ative quando quiser. Sem assinatura.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.days}
                className={`relative flex flex-col transition-shadow ${
                  plan.popular
                    ? "border-primary shadow-xl ring-1 ring-primary/20"
                    : "hover:shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-0.5 text-xs font-semibold tracking-wide">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-10 pb-4">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    {plan.label}
                  </p>
                  <div>
                    <span className="text-4xl font-bold text-foreground">{formatPrice(plan.price)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{plan.desc}</p>
                </CardHeader>
                <Separator />
                <CardContent className="flex-1 pt-6">
                  <ul className="space-y-3">
                    {planFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-2 pb-8">
                  <Button
                    className={`w-full h-12 text-sm font-semibold ${plan.popular ? "" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link to={user ? `/plans/checkout?days=${plan.days}` : `/auth?mode=signup&next=/plans/checkout?days=${plan.days}`}>
                      Garantir acesso
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 border-t border-border">
        <div className="container px-4 md:px-6 text-center max-w-2xl mx-auto">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Sem assinatura recorrente. Sem cobranças automáticas. Você compra uma vez
            e ativa quando estiver pronto para iniciar sua preparação.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-muted/20">
        <div className="container px-4 md:px-6 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 tracking-tight">
            Perguntas frequentes
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Individual Products */}
      <section className="py-24 border-t border-border">
        <div className="container px-4 md:px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Ou compre por simulado individual</h2>
              <p className="text-muted-foreground mt-1">Prefere comprar só um? Sem problema.</p>
            </div>
            <Button variant="ghost" asChild className="hidden md:inline-flex text-muted-foreground hover:text-foreground">
              <Link to="/catalog">Ver catálogo <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "ITIL 4", count: "Foundation & Specialist" },
              { name: "AWS", count: "Cloud Practitioner & Architect" },
              { name: "Azure", count: "Fundamentals & Admin" },
              { name: "Scrum", count: "PSM I & PSPO I" },
            ].map((cat) => (
              <Link
                key={cat.name}
                to={`/catalog?search=${cat.name}`}
                className="group flex flex-col p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 text-sm font-bold transition-transform group-hover:scale-110">
                  {cat.name[0]}
                </div>
                <h3 className="font-semibold">{cat.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{cat.count}</p>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild>
              <Link to="/catalog">Ver catálogo completo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 bg-foreground text-background">
        <div className="container px-4 md:px-6 text-center max-w-2xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Pronto para garantir sua certificação?
          </h2>
          <p className="text-background/60 text-lg">
            Junte-se a profissionais que aceleraram suas carreiras com preparação estratégica.
          </p>
          <Button size="lg" className="h-13 px-10 text-base bg-background text-foreground hover:bg-background/90 font-semibold" asChild>
            <a href="#plans">Garantir meu acesso</a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-foreground text-background/50 border-t border-background/10">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm font-semibold text-background/80">Examtis</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-background transition-colors">Termos de uso</a>
              <a href="#" className="hover:text-background transition-colors">Privacidade</a>
              <a href="mailto:contato@examtis.com" className="hover:text-background transition-colors">Contato</a>
              <Link to="/auth?mode=login" className="hover:text-background transition-colors">Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
