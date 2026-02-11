import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Award, Zap, Shield } from "lucide-react";

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background pt-20 pb-32 overflow-hidden">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-primary">
              Domine suas Certificações de TI
            </h1>
            <p className="text-xl text-muted-foreground max-w-[700px]">
              Simulados premium para ITIL, AWS, Azure, Scrum e mais.
              Conteúdo atualizado, explicações detalhadas e modo prova real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Button size="lg" className="h-12 px-8 text-lg" asChild>
                <Link to="/catalog">Ver Simulados</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg" asChild>
                <Link to="/auth?mode=signup">Criar Conta Grátis</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-3xl" />
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-400/20 blur-3xl" />
        </div>
      </section>

      {/* Features / Value Props */}
      <section className="py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Conteúdo Oficial</h3>
              <p className="text-muted-foreground">
                Baseado nos exames oficiais mais recentes. Questões revisadas por especialistas.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Modo Prova e Revisão</h3>
              <p className="text-muted-foreground">
                Simule o ambiente real de prova ou estude com explicações detalhadas para cada questão.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Garantia de Aprovação</h3>
              <p className="text-muted-foreground">
                Milhares de alunos aprovados. Se você gabaritar nossos simulados, estará pronto.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-20">
        <div className="container px-4 md:px-6">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Principais Categorias</h2>
              <p className="text-muted-foreground mt-2">Explore simulados por tecnologia</p>
            </div>
            <Button variant="ghost" asChild className="hidden md:inline-flex">
              <Link to="/catalog">Ver tudo <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Example Hardcoded Categories until DB is full */}
            {[
              { name: 'ITIL 4', count: 'Foundation & Specialist', color: 'bg-blue-100 text-blue-700' },
              { name: 'AWS', count: 'Cloud Practitioner & Architect', color: 'bg-orange-100 text-orange-700' },
              { name: 'Azure', count: 'Fundamentals & Admin', color: 'bg-sky-100 text-sky-700' },
              { name: 'Scrum', count: 'PSM I & PSPO I', color: 'bg-green-100 text-green-700' },
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

      {/* How it Works */}
      <section id="how-it-works" className="py-20 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-16">Como Funciona</h2>
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Steps */}
            {[
              { step: '01', title: 'Escolha o Simulado', desc: 'Navegue pelo catálogo e encontre sua certificação.' },
              { step: '02', title: 'Pagamento via Pix', desc: 'Faça o pedido e pague de forma segura e rápida.' },
              { step: '03', title: 'Envie o Comprovante', desc: 'Anexe o comprovante na sua área de pedidos.' },
              { step: '04', title: 'Acesso Liberado', desc: 'Nossa equipe ativa seu acesso em poucas horas.' },
            ].map((item, i) => (
              <div key={i} className="relative flex flex-col items-center text-center z-10">
                <div className="w-16 h-16 rounded-full bg-white text-primary font-bold text-2xl flex items-center justify-center mb-6 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-primary-foreground/80">{item.desc}</p>
              </div>
            ))}
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-white/20 -z-0" />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24">
        <div className="container px-4 md:px-6">
          <div className="bg-slate-950 text-white rounded-3xl p-10 md:p-16 text-center space-y-8 shadow-2xl">
            <h2 className="text-3xl md:text-5xl font-bold max-w-2xl mx-auto">
              Pronto para garantir sua certificação?
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Junte-se a milhares de profissionais que aceleraram suas carreiras com a Examtis.
            </p>
            <Button size="lg" className="h-14 px-10 text-lg bg-white text-slate-950 hover:bg-slate-200" asChild>
              <Link to="/catalog">Começar Agora</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
