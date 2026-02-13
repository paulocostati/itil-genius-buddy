import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Award, Zap, Shield, Clock, Smartphone, RefreshCw, HelpCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const plans = [
  { days: 30, price: 3900, label: "30 dias", desc: "Acesso completo por 30 dias", popular: false },
  { days: 60, price: 6900, label: "60 dias", desc: "Mais tempo para revisar", popular: true },
  { days: 90, price: 8900, label: "90 dias", desc: "Melhor custo-benefício", popular: false },
];

const features = [
  "Acesso a todas as certificações",
  "Simulados ilimitados",
  "Explicações detalhadas",
  "Dashboard de desempenho",
  "Compra única",
  "Ativação sob demanda",
];

const faqs = [
  { q: "Quando começa meu acesso?", a: "Seu acesso começa quando você clicar em 'Ativar' no seu dashboard. Compre agora e ative quando estiver pronto para estudar." },
  { q: "Posso ativar depois?", a: "Sim! Após a confirmação do pagamento, seu crédito fica disponível no dashboard para ativação quando você quiser." },
  { q: "O acesso renova automaticamente?", a: "Não. Não há cobrança recorrente. Você compra uma vez e pronto." },
  { q: "Posso comprar novamente após expirar?", a: "Sim, basta adquirir um novo plano a qualquer momento." },
  { q: "Posso usar no celular?", a: "Sim, a plataforma é 100% responsiva e funciona em qualquer dispositivo." },
];

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-hero text-primary-foreground pt-24 pb-32 overflow-hidden">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
            <Badge variant="secondary" className="text-sm px-4 py-1.5 bg-white/10 text-white border-white/20">
              ITIL 4 • AZ-900 • AI-900 e mais
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Passe na ITIL 4 com preparação estratégica e controle total do seu tempo.
            </h1>
            <p className="text-xl text-white/80 max-w-[700px]">
              Compre agora e ative quando quiser. Acesso completo aos simulados de ITIL, AZ-900 e AI-900
              com explicações detalhadas e diagnóstico inteligente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Button size="lg" className="h-14 px-10 text-lg bg-white text-primary font-semibold hover:bg-white/90 shadow-lg" asChild>
                <a href="#plans">Começar Agora</a>
              </Button>
              <Button size="lg" className="h-14 px-10 text-lg bg-white/15 text-white font-semibold border-2 border-white/40 hover:bg-white/25 backdrop-blur-sm" asChild>
                <Link to="/catalog">Ver Simulados</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0 opacity-20">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-white/20 blur-3xl" />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-white/10 blur-3xl" />
        </div>
      </section>

      {/* Features / Value Props */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: Award, title: "Conteúdo Oficial", desc: "Baseado nos exames oficiais mais recentes. Questões revisadas por especialistas." },
              { icon: Zap, title: "Modo Prova e Revisão", desc: "Simule o ambiente real de prova ou estude com explicações detalhadas para cada questão." },
              { icon: Shield, title: "Garantia de Aprovação", desc: "Milhares de alunos aprovados. Se você gabaritar nossos simulados, estará pronto." },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="plans" className="py-20 scroll-mt-20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Escolha seu período de acesso</h2>
            <p className="text-muted-foreground mt-3 text-lg">Compre uma vez. Ative quando quiser. Sem assinatura.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.days}
                className={`relative flex flex-col ${plan.popular ? "border-primary shadow-lg scale-105" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gradient-primary text-primary-foreground px-4">Mais Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-2xl">{plan.label}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold">{formatPrice(plan.price)}</span>
                  </div>
                  <p className="text-muted-foreground mt-2">{plan.desc}</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full h-12 text-base ${plan.popular ? "gradient-primary text-primary-foreground" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link to={user ? `/plans/checkout?days=${plan.days}` : `/auth?mode=signup&next=/plans/checkout?days=${plan.days}`}>
                      Comprar acesso
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 md:px-6 text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Clock className="h-6 w-6 text-primary" />
            <RefreshCw className="h-6 w-6 text-primary" />
            <Smartphone className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Sem assinatura. Sem cobrança recorrente.</h3>
          <p className="text-muted-foreground text-lg">
            Você compra uma vez e ativa quando estiver pronto para começar.
            Sem surpresas na fatura.
          </p>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Como Funciona</h2>
          <div className="grid md:grid-cols-4 gap-8 relative">
            {[
              { step: "01", title: "Escolha o Plano", desc: "Selecione 30, 60 ou 90 dias de acesso." },
              { step: "02", title: "Pagamento via Pix", desc: "Pague de forma segura e rápida." },
              { step: "03", title: "Ative Quando Quiser", desc: "Seu acesso fica pendente até você ativar." },
              { step: "04", title: "Estude e Passe", desc: "Simulados ilimitados até o fim do seu plano." },
            ].map((item, i) => (
              <div key={i} className="relative flex flex-col items-center text-center z-10">
                <div className="w-16 h-16 rounded-full bg-white text-primary font-bold text-2xl flex items-center justify-center mb-6 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-primary-foreground/80">{item.desc}</p>
              </div>
            ))}
            <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-white/20 -z-0" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container px-4 md:px-6 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Perguntas Frequentes</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Ou compre por simulado individual</h2>
              <p className="text-muted-foreground mt-2">Prefere comprar só um? Sem problema.</p>
            </div>
            <Button variant="ghost" asChild className="hidden md:inline-flex">
              <Link to="/catalog">Ver tudo <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "ITIL 4", count: "Foundation & Specialist", color: "bg-primary/10 text-primary" },
              { name: "AWS", count: "Cloud Practitioner & Architect", color: "bg-accent/10 text-accent" },
              { name: "Azure", count: "Fundamentals & Admin", color: "bg-primary/10 text-primary" },
              { name: "Scrum", count: "PSM I & PSPO I", color: "bg-accent/10 text-accent" },
            ].map((cat) => (
              <Link
                key={cat.name}
                to={`/catalog?search=${cat.name}`}
                className="group flex flex-col p-6 rounded-xl border bg-card hover:shadow-lg transition-all hover:border-primary/50"
              >
                <div className={`w-12 h-12 rounded-lg ${cat.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <span className="font-bold text-lg">{cat.name[0]}</span>
                </div>
                <h3 className="font-bold text-lg">{cat.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{cat.count}</p>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild>
              <Link to="/catalog">Ver todas as categorias</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container px-4 md:px-6">
          <div className="gradient-hero text-white rounded-3xl p-10 md:p-16 text-center space-y-8 shadow-2xl">
            <h2 className="text-3xl md:text-5xl font-bold max-w-2xl mx-auto">
              Pronto para garantir sua certificação?
            </h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              Junte-se a milhares de profissionais que aceleraram suas carreiras com a Examtis.
            </p>
            <Button size="lg" className="h-14 px-10 text-lg bg-white text-foreground hover:bg-white/90" asChild>
              <a href="#plans">Começar Agora</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
