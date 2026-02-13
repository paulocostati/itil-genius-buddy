import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";
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
  "Domain-weighted simulations",
  "Real exam difficulty level",
  "Domain performance diagnostics",
  "Strategic repetition cycles",
  "Clean, distraction-free interface",
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

  const c = {
    bg: "hsl(222,30%,5%)",
    surface: "hsl(222,25%,9%)",
    border: "hsl(220,20%,14%)",
    borderHover: "hsl(215,70%,55%)",
    text: "hsl(210,20%,95%)",
    textMuted: "hsl(215,15%,52%)",
    textDim: "hsl(215,15%,38%)",
    accent: "hsl(215,70%,55%)",
    accentHover: "hsl(215,70%,48%)",
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: c.bg, color: c.text }}>
      {/* Tagline bar */}
      <div className="text-center py-2 text-xs tracking-[0.25em] uppercase" style={{ color: c.textDim, borderBottom: `1px solid ${c.border}` }}>
        Strategic Certification Preparation Platform
      </div>

      {/* Hero */}
      <section className="relative pt-28 pb-36 overflow-hidden">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8 max-w-xl">
              <h1 className="text-4xl md:text-[3.4rem] leading-[1.06] font-extrabold tracking-tight">
                Strategic preparation for{" "}
                <span style={{ color: c.accent }}>ITIL 4</span>{" "}
                certification.
              </h1>
              <p className="text-lg leading-relaxed" style={{ color: c.textMuted }}>
                A performance-focused simulation platform structured around the official exam blueprint.
              </p>
              <p className="text-sm" style={{ color: c.textDim }}>
                Also includes AZ-900 and AI-900 access.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="h-13 px-10 text-sm font-semibold tracking-wide"
                  style={{ background: c.accent, color: "#fff" }}
                  asChild
                >
                  <a href="#plans">Access the platform</a>
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-13 px-10 text-sm tracking-wide"
                  style={{ color: c.textMuted }}
                  asChild
                >
                  <a href="#methodology">Explore methodology <ArrowRight className="ml-2 h-4 w-4" /></a>
                </Button>
              </div>
            </div>

            {/* Mockup */}
            <div className="hidden lg:block">
              <div
                className="rounded-2xl p-8 shadow-2xl"
                style={{ background: c.surface, border: `1px solid ${c.border}`, boxShadow: `0 25px 60px -12px ${c.accent}08` }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2.5 h-2.5 rounded-full bg-[hsl(0,50%,50%)]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[hsl(40,70%,50%)]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[hsl(130,45%,45%)]" />
                </div>
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-32 rounded" style={{ background: c.border }} />
                    <div className="h-3 w-16 rounded" style={{ background: c.border }} />
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {["Service Value System", "Practices", "Guiding Principles", "Governance"].map((d) => (
                      <div key={d} className="p-3 rounded-lg text-center" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                        <div className="text-xl font-bold" style={{ color: c.accent }}>
                          {Math.floor(60 + Math.random() * 35)}%
                        </div>
                        <div className="text-[9px] mt-1" style={{ color: c.textDim }}>{d}</div>
                      </div>
                    ))}
                  </div>
                  <div className="h-28 rounded-lg" style={{ background: c.bg, border: `1px solid ${c.border}` }} />
                  <div className="flex gap-3">
                    <div className="flex-1 h-8 rounded" style={{ background: c.accent }} />
                    <div className="flex-1 h-8 rounded" style={{ background: c.border }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[400px] rounded-full blur-[140px] -z-0" style={{ background: `${c.accent}06` }} />
      </section>

      {/* Positioning */}
      <section className="py-28" style={{ borderTop: `1px solid ${c.border}` }}>
        <div className="container px-4 md:px-6 max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            This is not a question bank.
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: c.textMuted }}>
            EXAMTIS is built for professionals who approach certification with precision.
            Every simulation follows the official domain weight distribution to ensure
            strategic preparation where it truly matters.
          </p>
        </div>
      </section>

      {/* Methodology */}
      <section id="methodology" className="py-28 scroll-mt-20" style={{ borderTop: `1px solid ${c.border}` }}>
        <div className="container px-4 md:px-6 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center mb-14">
            Structured for performance.
          </h2>
          <div className="space-y-0">
            {methodology.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-6 py-5"
                style={{ borderBottom: `1px solid ${c.border}` }}
              >
                <span className="text-sm font-light tabular-nums w-8" style={{ color: c.textDim }}>
                  0{i + 1}
                </span>
                <span className="text-lg font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Storytelling */}
      <section className="py-28" style={{ borderTop: `1px solid ${c.border}` }}>
        <div className="container px-4 md:px-6 max-w-2xl mx-auto text-center space-y-4">
          {[
            "Most candidates over-study.",
            "Few study strategically.",
            "Certification is not about volume.",
            "It is about precision.",
          ].map((line, i) => (
            <p key={i} className={`text-xl md:text-2xl font-light leading-relaxed ${i === 3 ? "font-semibold" : ""}`} style={{ color: i < 3 ? c.textMuted : c.text }}>
              {line}
            </p>
          ))}
          <p className="text-lg pt-4" style={{ color: c.accent }}>
            EXAMTIS was built for precision.
          </p>
        </div>
      </section>

      {/* Price Anchoring + Plans */}
      <section id="plans" className="py-28 scroll-mt-20" style={{ borderTop: `1px solid ${c.border}` }}>
        <div className="container px-4 md:px-6">
          {/* Anchoring */}
          <div className="text-center mb-6 max-w-xl mx-auto">
            <p className="text-xl font-semibold tracking-tight">
              Certification failure costs more than preparation.
            </p>
            <p className="text-sm mt-2" style={{ color: c.textDim }}>
              Exam retake fees, time lost, and opportunity cost often exceed R$ 800.
            </p>
          </div>

          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Choose your access level</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.tier}
                className="relative flex flex-col rounded-2xl overflow-hidden"
                style={{
                  background: plan.popular
                    ? `linear-gradient(180deg, ${c.accent}18 0%, ${c.surface} 40%)`
                    : c.surface,
                  border: `1px solid ${plan.popular ? c.accent + "40" : c.border}`,
                  boxShadow: plan.popular ? `0 0 40px ${c.accent}08` : "none",
                }}
              >
                {plan.popular && (
                  <div className="text-center pt-3">
                    <span
                      className="text-[10px] font-semibold tracking-[0.2em] uppercase px-4 py-1 rounded-full"
                      style={{ background: c.accent, color: "#fff" }}
                    >
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="p-8 flex flex-col h-full">
                  <div className="text-center mb-6">
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-1" style={{ color: c.textDim }}>
                      {plan.tier}
                    </p>
                    <p className="text-sm mb-4" style={{ color: c.textMuted }}>{plan.days} dias</p>
                    <span className="text-4xl font-bold">{fmt(plan.price)}</span>
                  </div>
                  <p className="text-sm text-center mb-6" style={{ color: c.textMuted }}>{plan.desc}</p>
                  <Separator style={{ background: c.border }} className="mb-6" />
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: c.accent }} />
                        <span style={{ color: c.textMuted }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full h-12 mt-8 text-sm font-semibold tracking-wide"
                    style={{
                      background: plan.popular ? c.accent : "transparent",
                      color: plan.popular ? "#fff" : c.text,
                      border: plan.popular ? "none" : `1px solid ${c.border}`,
                    }}
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
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-20" style={{ borderTop: `1px solid ${c.border}` }}>
        <div className="container px-4 md:px-6 text-center max-w-2xl mx-auto space-y-3">
          <p className="text-lg font-semibold">7-day satisfaction guarantee.</p>
          <p className="text-sm" style={{ color: c.textMuted }}>
            If the platform does not increase your confidence, we refund 100%. No questions asked.
          </p>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16" style={{ borderTop: `1px solid ${c.border}` }}>
        <div className="container px-4 md:px-6 text-center max-w-2xl mx-auto">
          <p className="text-sm" style={{ color: c.textDim }}>
            Compra única. Ativação sob demanda. Sem assinatura recorrente. Sem cobranças automáticas.
          </p>
        </div>
      </section>

      {/* Individual */}
      <section className="py-24" style={{ borderTop: `1px solid ${c.border}` }}>
        <div className="container px-4 md:px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Ou compre por simulado individual</h2>
              <p className="text-sm mt-1" style={{ color: c.textDim }}>Prefere um simulado específico? Sem problema.</p>
            </div>
            <Button variant="ghost" asChild className="hidden md:inline-flex" style={{ color: c.textMuted }}>
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
              <Link
                key={cat.name}
                to={`/catalog?search=${cat.name}`}
                className="group flex flex-col p-5 rounded-2xl transition-all"
                style={{ background: c.surface, border: `1px solid ${c.border}` }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 text-sm font-bold group-hover:scale-110 transition-transform"
                  style={{ background: `${c.accent}15`, color: c.accent }}
                >
                  {cat.name[0]}
                </div>
                <h3 className="font-semibold text-sm">{cat.name}</h3>
                <p className="text-xs mt-1" style={{ color: c.textDim }}>{cat.sub}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-28" style={{ borderTop: `1px solid ${c.border}` }}>
        <div className="container px-4 md:px-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12 tracking-tight">Perguntas frequentes</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} style={{ borderColor: c.border }}>
                <AccordionTrigger className="text-left text-sm hover:no-underline" style={{ color: c.text }}>
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent style={{ color: c.textMuted }}>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10" style={{ borderTop: `1px solid ${c.border}` }}>
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-semibold tracking-[0.2em]">EXAMTIS</p>
            <div className="flex gap-6 text-xs" style={{ color: c.textDim }}>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="mailto:contato@examtis.com" className="hover:text-white transition-colors">Contact</a>
              <Link to="/auth?mode=login" className="hover:text-white transition-colors">Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
