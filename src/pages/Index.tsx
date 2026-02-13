import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, Globe } from "lucide-react";
import itil4Badge from "@/assets/itil4-badge.png";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

const plans = [
  {
    tier: "EXECUTIVE",
    days: 90,
    price: 49700,
    desc: "Acesso completo • Relatórios detalhados • Suporte prioritário",
    features: ["ITIL 4 completo", "AZ-900 e AI-900", "Simulados ilimitados", "Relatórios avançados", "Dashboard estratégico", "Suporte prioritário"],
    popular: false,
  },
  {
    tier: "PROFESSIONAL",
    days: 60,
    price: 29700,
    desc: "O equilíbrio ideal entre tempo e investimento",
    features: ["ITIL 4 completo", "AZ-900 e AI-900", "Simulados ilimitados", "Explicações detalhadas", "Dashboard estratégico", "Ativação sob demanda"],
    popular: true,
  },
  {
    tier: "ESSENTIAL",
    days: 30,
    price: 19700,
    desc: "Acesso completo por 30 dias",
    features: ["ITIL 4 completo", "AZ-900 e AI-900", "Simulados ilimitados", "Explicações detalhadas", "Dashboard de desempenho", "Ativação sob demanda"],
    popular: false,
  },
];

const methodology = [
  "Simulados ponderados pelo peso oficial do exame",
  "Relatório de desempenho por domínio",
  "Identificação de lacunas críticas",
  "Ciclos estratégicos de repetição",
  "Ambiente limpo e profissional",
];

const faqs = [
  { q: "Quando começa meu acesso?", a: "Seu acesso começa quando você clicar em 'Ativar' no dashboard. Compre agora e ative quando estiver pronto." },
  { q: "Posso ativar depois?", a: "Sim. Após confirmação do pagamento, o crédito fica disponível para ativação quando você decidir." },
  { q: "O acesso renova automaticamente?", a: "Não. Compra única. Sem cobrança recorrente." },
  { q: "Posso comprar novamente após expirar?", a: "Sim, a qualquer momento." },
  { q: "Funciona em dispositivos móveis?", a: "Sim, 100% responsiva." },
  { q: "Como funciona a garantia?", a: "Se em 7 dias a plataforma não aumentar sua confiança, devolvemos 100% do valor." },
];

const fmt = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Tagline bar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-2.5 container border-b border-border">
        <span className="text-[10px] tracking-[0.25em] uppercase text-dim">
          Plataforma Estratégica de Simulação para Certificações
        </span>
        <button className="flex items-center gap-1.5 text-[10px] tracking-wider uppercase text-dim opacity-60 hover:opacity-100 transition-opacity">
          <Globe className="h-3 w-3" /> EN
        </button>
      </div>

      {/* Hero */}
      <section className="relative pt-28 pb-36 overflow-hidden">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-12 items-center">
            <div className="space-y-8 max-w-xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/[0.08]">
                <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-primary">ITIL 4 Foundation</span>
                <span className="text-[10px] text-dim">•</span>
                <span className="text-[10px] tracking-wider uppercase text-dim">Certificação Principal</span>
              </div>
              <h1 className="text-4xl md:text-[3.6rem] leading-[1.04] font-extrabold tracking-tight">
                <span className="text-primary">ITIL 4</span> exige{" "}
                estratégia.{" "}
                <span className="text-foreground/50">Não tentativa.</span>
              </h1>
              <p className="text-lg leading-relaxed text-foreground/80">
                Simulações estruturadas com base no peso oficial do exame para profissionais que querem aprovação com precisão.
              </p>
              <p className="text-sm text-dim">
                Inclui acesso às certificações AZ-900 e AI-900.
              </p>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="h-13 px-10 text-sm font-semibold tracking-wide" asChild>
                    <a href="#plans">Acessar preparação estratégica</a>
                  </Button>
                  <Button size="lg" variant="ghost" className="h-13 px-10 text-sm tracking-wide text-muted-foreground" asChild>
                    <a href="#methodology">Entender a metodologia <ArrowRight className="ml-2 h-4 w-4" /></a>
                  </Button>
                </div>
              </div>
            </div>

            {/* ITIL 4 Badge - Visual highlight */}
            <div className="hidden lg:flex flex-col items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-125" />
                <img src={itil4Badge} alt="ITIL 4 Foundation Certified by PeopleCert" className="relative h-64 w-64 object-contain drop-shadow-2xl" />
              </div>
              <p className="text-xs text-dim mt-4 tracking-wider uppercase text-center">Certificação oficial by PeopleCert</p>
            </div>

            {/* Mockup */}
            <div className="hidden lg:block">
              <div className="rounded-2xl p-8 shadow-2xl bg-card border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
                    <span className="ml-3 text-[10px] font-semibold tracking-wider uppercase text-primary">ITIL 4 Foundation</span>
                  </div>
                  <span className="text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-full border border-primary/20 text-dim">Baseado no blueprint oficial</span>
                </div>
                <div className="space-y-4">
                  {[
                    { domain: "Sistema de Valor", weight: 34, score: 78 },
                    { domain: "Práticas", weight: 42, score: 85 },
                    { domain: "Princípios", weight: 14, score: 62 },
                    { domain: "Governança", weight: 10, score: 91 },
                  ].map((d) => (
                    <div key={d.domain} className="p-3 rounded-lg bg-background border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">{d.domain} <span className="text-dim">({d.weight}%)</span></span>
                        <span className={`text-sm font-bold ${d.score >= 80 ? 'text-success' : d.score >= 70 ? 'text-primary' : 'text-warning'}`}>{d.score}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden bg-secondary">
                        <div className={`h-full rounded-full transition-all ${d.score >= 80 ? 'bg-success' : d.score >= 70 ? 'bg-primary' : 'bg-warning'}`} style={{ width: `${d.score}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-3 pt-2">
                    <div className="flex-1 h-9 rounded-lg flex items-center justify-center text-xs font-semibold bg-primary text-primary-foreground">Novo Simulado</div>
                    <div className="flex-1 h-9 rounded-lg flex items-center justify-center text-xs bg-secondary text-muted-foreground">Relatório Completo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[400px] rounded-full blur-[140px] -z-0 bg-primary/[0.03]" />
      </section>

      {/* Positioning */}
      <section className="py-28 border-t border-border">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Não é um banco de questões.</h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            A maioria estuda em volume. Poucos estudam com direcionamento.
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground">
            A EXAMTIS organiza simulados com base na estrutura oficial do exame, permitindo foco real nas áreas com maior impacto na sua aprovação.
          </p>
        </div>
      </section>

      {/* Problema Real */}
      <section className="py-28 border-t border-border">
        <div className="container px-4 md:px-6 max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">O que normalmente acontece</h2>
          <div className="space-y-3 text-lg text-muted-foreground">
            <p>Você resolve centenas de questões.</p>
            <p>Assiste aulas.</p>
            <p>Revisa PDFs.</p>
            <p className="pt-2">Mas não sabe onde realmente está perdendo pontos.</p>
          </div>
          <p className="text-xl font-semibold pt-4 text-primary">
            "Sem diagnóstico, não existe estratégia."
          </p>
        </div>
      </section>

      {/* Methodology */}
      <section id="methodology" className="py-28 scroll-mt-20 border-t border-border">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-14">Como a EXAMTIS funciona</h2>
          <div className="space-y-0">
            {methodology.map((item, i) => (
              <div key={i} className="flex items-center gap-6 py-5 border-b border-border">
                <span className="text-sm font-light tabular-nums w-8 text-dim">0{i + 1}</span>
                <span className="text-lg font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Storytelling */}
      <section className="py-28 border-t border-border">
        <div className="container px-4 md:px-6 max-w-2xl mx-auto text-center space-y-4">
          <p className="text-xl md:text-2xl leading-relaxed font-light text-muted-foreground">
            Você não precisa estudar mais.
          </p>
          <p className="text-xl md:text-2xl leading-relaxed font-semibold">
            Precisa estudar com precisão.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-28 scroll-mt-20 border-t border-border">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-6 max-w-xl mx-auto">
            <p className="text-xl font-semibold tracking-tight">Reprovar custa mais do que se preparar estrategicamente.</p>
            <p className="text-sm mt-2 text-dim">
              Taxa de reaplicação, tempo perdido e impacto profissional podem ultrapassar R$ 800.
            </p>
          </div>
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Escolha seu nível de acesso</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.tier}
                className={`relative flex flex-col rounded-2xl overflow-hidden bg-card border ${plan.popular ? 'border-primary/40 shadow-[0_0_40px_hsl(215_70%_55%/0.08)]' : 'border-border'}`}
                style={plan.popular ? { background: 'linear-gradient(180deg, hsl(215 70% 55% / 0.08) 0%, hsl(var(--card)) 40%)' } : undefined}
              >
                {plan.popular && (
                  <div className="text-center pt-3">
                    <span className="text-[10px] font-semibold tracking-[0.2em] uppercase px-4 py-1 rounded-full bg-primary text-primary-foreground">
                      Mais Popular
                    </span>
                  </div>
                )}
                <div className="p-8 flex flex-col h-full">
                  <div className="text-center mb-6">
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-1 text-dim">{plan.tier}</p>
                    <p className="text-sm mb-4 text-muted-foreground">{plan.days} dias</p>
                    <span className="text-4xl font-bold">{fmt(plan.price)}</span>
                  </div>
                  <p className="text-sm text-center mb-6 text-muted-foreground">{plan.desc}</p>
                  <Separator className="mb-6 bg-border" />
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full h-12 mt-8 text-sm font-semibold tracking-wide ${plan.popular ? '' : 'bg-transparent text-foreground border border-border hover:bg-secondary'}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link to={user ? `/plans/checkout?days=${plan.days}` : `/auth?mode=signup&next=/plans/checkout?days=${plan.days}`}>
                      Garantir acesso
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm mt-8 text-dim">
            Compra única. Ativação sob demanda. Sem renovação automática.
          </p>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-20 border-t border-border">
        <div className="container px-4 md:px-6 text-center max-w-2xl mx-auto space-y-3">
          <p className="text-lg font-semibold">Garantia de satisfação de 7 dias.</p>
          <p className="text-sm text-muted-foreground">
            Se a plataforma não elevar sua confiança, devolvemos 100% do valor. Sem perguntas.
          </p>
        </div>
      </section>

      {/* Individual */}
      <section className="py-24 border-t border-border">
        <div className="container px-4 md:px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Ou compre por simulado individual</h2>
              <p className="text-sm mt-1 text-dim">Prefere um simulado específico? Sem problema.</p>
            </div>
            <Button variant="ghost" asChild className="hidden md:inline-flex text-muted-foreground">
              <Link to="/catalog">Ver catálogo <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "ITIL 4", sub: "Foundation & Specialist" },
              { name: "AWS", sub: "Cloud Practitioner" },
              { name: "Azure", sub: "AZ-900 & AI-900" },
              { name: "Scrum", sub: "PSM I & PSPO I" },
            ].map((cat) => (
              <Link key={cat.name} to={`/catalog?search=${cat.name}`} className="group flex flex-col p-5 rounded-2xl transition-all bg-card border border-border hover:border-primary/30">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 text-sm font-bold group-hover:scale-110 transition-transform bg-primary/10 text-primary">
                  {cat.name[0]}
                </div>
                <h3 className="font-semibold text-sm">{cat.name}</h3>
                <p className="text-xs mt-1 text-dim">{cat.sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-28 border-t border-border">
        <div className="container px-4 md:px-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12 tracking-tight">Perguntas frequentes</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                <AccordionTrigger className="text-left text-sm hover:no-underline">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-semibold tracking-[0.2em]">EXAMTIS</p>
            <div className="flex items-center gap-6 text-xs text-dim">
              <a href="#" className="hover:text-foreground transition-colors">Termos</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
              <a href="mailto:contato@examtis.com" className="hover:text-foreground transition-colors">Contato</a>
              <Link to="/auth?mode=login" className="hover:text-foreground transition-colors">Login</Link>
              <button className="flex items-center gap-1 opacity-50 hover:opacity-80 transition-opacity">
                <Globe className="h-3 w-3" /> PT-BR
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
