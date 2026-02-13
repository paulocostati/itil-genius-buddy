import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight, BarChart3, BookOpen, Target, Layout, Smartphone, Layers } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

const plans = [
  { days: 30, price: 12900, label: "30 dias", desc: "Acesso completo a todas as certificações", popular: false },
  { days: 60, price: 19700, label: "60 dias", desc: "Mais tempo para revisar e consolidar", popular: true },
  { days: 90, price: 27900, label: "90 dias", desc: "Melhor custo por dia de acesso", popular: false },
];

const planFeatures = [
  "ITIL 4 completo",
  "AZ-900 e AI-900 inclusos",
  "Simulados ilimitados",
  "Explicações detalhadas",
  "Dashboard estratégico",
  "Ativação sob demanda",
];

const benefits = [
  { icon: Target, title: "Questões por prática oficial", desc: "Organizadas pelo peso real do syllabus ITIL 4." },
  { icon: BookOpen, title: "Formato real do exame", desc: "Simulados que replicam fielmente a experiência da prova." },
  { icon: Layers, title: "Explicações técnicas", desc: "Cada questão com justificativa clara e objetiva." },
  { icon: BarChart3, title: "Diagnóstico por domínio", desc: "Identifique exatamente onde precisa melhorar." },
  { icon: Layout, title: "Ativação flexível", desc: "Compre agora e ative quando estiver pronto." },
  { icon: Smartphone, title: "Compra única", desc: "Sem assinatura. Sem renovação automática." },
];

const faqs = [
  { q: "Quando começa meu acesso?", a: "Seu acesso começa quando você clicar em 'Ativar' no seu dashboard. Compre agora e ative quando estiver pronto para estudar." },
  { q: "Posso ativar depois?", a: "Sim! Após a confirmação do pagamento, seu crédito fica disponível no dashboard para ativação quando você quiser." },
  { q: "O acesso renova automaticamente?", a: "Não. Não há cobrança recorrente. Você compra uma vez e pronto." },
  { q: "Posso comprar novamente após expirar?", a: "Sim, basta adquirir um novo plano a qualquer momento." },
  { q: "A plataforma funciona em dispositivos móveis?", a: "Sim, 100% responsiva." },
];

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-[hsl(222,30%,6%)] text-[hsl(210,20%,95%)]">
      {/* Hero */}
      <section className="relative pt-32 pb-40 overflow-hidden">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <p className="text-sm font-medium tracking-[0.2em] uppercase text-[hsl(215,70%,55%)]">
                Preparação estratégica para ITIL 4
              </p>
              <h1 className="text-4xl md:text-[3.5rem] leading-[1.08] font-extrabold tracking-tight">
                A forma estratégica de conquistar sua{" "}
                <span className="bg-gradient-to-r from-[hsl(215,70%,55%)] to-[hsl(200,80%,60%)] bg-clip-text text-transparent">
                  ITIL 4.
                </span>
              </h1>
              <p className="text-lg text-[hsl(215,15%,55%)] leading-relaxed max-w-lg">
                Simulados estruturados pelo peso real do syllabus oficial,
                com diagnóstico inteligente e explicações detalhadas.
              </p>
              <p className="text-sm text-[hsl(215,15%,45%)]">
                Inclui acesso completo também para AZ-900 e AI-900.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button
                  size="lg"
                  className="h-13 px-10 text-base font-semibold bg-[hsl(215,70%,55%)] hover:bg-[hsl(215,70%,50%)] text-white"
                  asChild
                >
                  <a href="#plans">Garantir acesso premium</a>
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-13 px-10 text-base text-[hsl(215,15%,55%)] hover:text-white hover:bg-white/5"
                  asChild
                >
                  <a href="#benefits">
                    Ver como funciona <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Platform mockup */}
            <div className="hidden lg:block">
              <div className="relative rounded-2xl border border-[hsl(220,20%,15%)] bg-[hsl(222,25%,10%)] p-6 shadow-2xl shadow-[hsl(215,70%,55%)]/5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-[hsl(0,60%,45%)]" />
                  <div className="w-3 h-3 rounded-full bg-[hsl(45,80%,50%)]" />
                  <div className="w-3 h-3 rounded-full bg-[hsl(130,50%,45%)]" />
                </div>
                <div className="space-y-4">
                  <div className="h-4 w-2/3 rounded bg-[hsl(220,20%,16%)]" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-20 rounded-lg bg-[hsl(220,20%,14%)] border border-[hsl(220,20%,18%)]" />
                    <div className="h-20 rounded-lg bg-[hsl(220,20%,14%)] border border-[hsl(220,20%,18%)]" />
                  </div>
                  <div className="h-32 rounded-lg bg-[hsl(220,20%,14%)] border border-[hsl(220,20%,18%)]" />
                  <div className="grid grid-cols-3 gap-2">
                    {[65, 82, 74].map((v) => (
                      <div key={v} className="flex flex-col items-center gap-1 p-3 rounded-lg bg-[hsl(220,20%,14%)] border border-[hsl(220,20%,18%)]">
                        <span className="text-lg font-bold text-[hsl(215,70%,55%)]">{v}%</span>
                        <span className="text-[10px] text-[hsl(215,15%,45%)]">Score</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background glow */}
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[400px] rounded-full bg-[hsl(215,70%,55%)]/[0.04] blur-[120px] -z-0" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full bg-[hsl(200,80%,60%)]/[0.03] blur-[100px] -z-0" />
      </section>

      {/* Authority / Positioning */}
      <section className="py-28 border-t border-[hsl(220,20%,12%)]">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            Não é um banco de questões.
          </h2>
          <p className="text-lg text-[hsl(215,15%,55%)] leading-relaxed">
            É uma preparação estratégica baseada na estrutura oficial do exame ITIL 4.
            Questões organizadas por peso do syllabus, para que você estude com foco
            no que realmente importa para a prova.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-28 scroll-mt-20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Uma preparação estruturada e profissional
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="p-6 rounded-2xl bg-[hsl(222,25%,10%)] border border-[hsl(220,20%,15%)] hover:border-[hsl(215,70%,55%)]/20 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-[hsl(215,70%,55%)]/10 flex items-center justify-center text-[hsl(215,70%,55%)] mb-5">
                  <b.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2">{b.title}</h3>
                <p className="text-sm text-[hsl(215,15%,50%)] leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-28 border-t border-[hsl(220,20%,12%)]">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 tracking-tight">
            Como funciona
          </h2>
          <div className="grid md:grid-cols-3 gap-16">
            {[
              { step: "01", title: "Escolha sua certificação", desc: "Selecione o plano e a certificação desejada." },
              { step: "02", title: "Realize simulados estratégicos", desc: "Questões organizadas por peso e prática do exame." },
              { step: "03", title: "Analise e ajuste", desc: "Use o diagnóstico para focar onde mais importa." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-5xl font-extralight text-[hsl(215,70%,55%)]/25 mb-4 tabular-nums">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-[hsl(215,15%,50%)] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="plans" className="py-28 scroll-mt-20">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Escolha seu período de acesso
            </h2>
            <p className="text-[hsl(215,15%,50%)] mt-4 text-lg">
              Compre uma vez. Ative quando quiser. Sem assinatura.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.days}
                className={`relative flex flex-col rounded-2xl p-[1px] ${
                  plan.popular
                    ? "bg-gradient-to-b from-[hsl(215,70%,55%)]/40 to-transparent"
                    : "bg-[hsl(220,20%,15%)]"
                }`}
              >
                <div className={`flex flex-col h-full rounded-2xl bg-[hsl(222,25%,10%)] p-8 ${
                  plan.popular ? "shadow-xl shadow-[hsl(215,70%,55%)]/5" : ""
                }`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="text-xs font-semibold tracking-wider uppercase bg-[hsl(215,70%,55%)] text-white px-4 py-1 rounded-full">
                        Mais Popular
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-6 pt-2">
                    <p className="text-sm font-medium text-[hsl(215,15%,50%)] uppercase tracking-wider mb-4">
                      {plan.label}
                    </p>
                    <span className="text-4xl font-bold">{formatPrice(plan.price)}</span>
                    <p className="text-sm text-[hsl(215,15%,45%)] mt-3">{plan.desc}</p>
                  </div>
                  <Separator className="bg-[hsl(220,20%,15%)] mb-6" />
                  <ul className="space-y-3 flex-1">
                    {planFeatures.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-[hsl(215,70%,55%)] shrink-0 mt-0.5" />
                        <span className="text-[hsl(215,15%,65%)]">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full h-12 mt-8 text-sm font-semibold ${
                      plan.popular
                        ? "bg-[hsl(215,70%,55%)] hover:bg-[hsl(215,70%,50%)] text-white"
                        : "bg-[hsl(220,20%,16%)] hover:bg-[hsl(220,20%,20%)] text-[hsl(210,20%,90%)] border border-[hsl(220,20%,20%)]"
                    }`}
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

      {/* Trust */}
      <section className="py-20 border-t border-[hsl(220,20%,12%)]">
        <div className="container px-4 md:px-6 text-center max-w-2xl mx-auto">
          <p className="text-lg text-[hsl(215,15%,50%)] leading-relaxed">
            Compra única. Ativação sob demanda. Sem assinatura recorrente.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-28">
        <div className="container px-4 md:px-6 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 tracking-tight">
            Perguntas frequentes
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-[hsl(220,20%,15%)]">
                <AccordionTrigger className="text-left text-base hover:text-[hsl(215,70%,55%)] hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-[hsl(215,15%,50%)]">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Individual Products */}
      <section className="py-24 border-t border-[hsl(220,20%,12%)]">
        <div className="container px-4 md:px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Ou compre por simulado individual</h2>
              <p className="text-[hsl(215,15%,45%)] mt-1 text-sm">Prefere comprar só um? Sem problema.</p>
            </div>
            <Button variant="ghost" asChild className="hidden md:inline-flex text-[hsl(215,15%,50%)] hover:text-white">
              <Link to="/catalog">Ver catálogo <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "ITIL 4", count: "Foundation & Specialist" },
              { name: "AWS", count: "Cloud Practitioner" },
              { name: "Azure", count: "AZ-900 & AI-900" },
              { name: "Scrum", count: "PSM I & PSPO I" },
            ].map((cat) => (
              <Link
                key={cat.name}
                to={`/catalog?search=${cat.name}`}
                className="group flex flex-col p-5 rounded-2xl border border-[hsl(220,20%,15%)] bg-[hsl(222,25%,10%)] hover:border-[hsl(215,70%,55%)]/20 transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-[hsl(215,70%,55%)]/10 text-[hsl(215,70%,55%)] flex items-center justify-center mb-3 text-sm font-bold group-hover:scale-110 transition-transform">
                  {cat.name[0]}
                </div>
                <h3 className="font-semibold text-sm">{cat.name}</h3>
                <p className="text-xs text-[hsl(215,15%,45%)] mt-1">{cat.count}</p>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center md:hidden">
            <Button variant="outline" className="border-[hsl(220,20%,15%)] text-[hsl(215,15%,55%)]" asChild>
              <Link to="/catalog">Ver catálogo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-[hsl(220,20%,12%)]">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm font-semibold tracking-wider">EXAMTIS</p>
            <div className="flex gap-6 text-sm text-[hsl(215,15%,45%)]">
              <a href="#" className="hover:text-white transition-colors">Termos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="mailto:contato@examtis.com" className="hover:text-white transition-colors">Contato</a>
              <Link to="/auth?mode=login" className="hover:text-white transition-colors">Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
