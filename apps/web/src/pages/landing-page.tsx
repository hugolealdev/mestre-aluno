import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BrainCircuit,
  CalendarRange,
  GraduationCap,
  ShieldCheck,
  Wallet
} from 'lucide-react';
import { Link } from 'react-router-dom';

const trustStats = [
  { value: 'Operação real', label: 'Banco, API e pagamentos conectados' },
  { value: '3 perfis', label: 'Aluno, professor e administrador' },
  { value: 'Google + Stripe', label: 'Agenda, Meet e checkout oficial' },
  { value: 'Cloud first', label: 'Supabase, Render e Vercel' }
];

const features = [
  {
    title: 'Busca inteligente',
    description: 'Encontre professores e conteúdos por nome, matéria, assunto e intenção de estudo.',
    icon: BrainCircuit
  },
  {
    title: 'Agendamento real',
    description: 'Professor publica disponibilidade, aluno agenda e o sistema registra a aula com pagamento confirmado.',
    icon: CalendarRange
  },
  {
    title: 'Biblioteca protegida',
    description: 'Conteúdos comprados ficam salvos com acesso vitalício por links assinados e storage privado.',
    icon: BookOpen
  },
  {
    title: 'Aulas seguras',
    description: 'Google Meet vinculado à aula e liberado apenas perto do horário para evitar uso indevido.',
    icon: ShieldCheck
  },
  {
    title: 'Gestão financeira',
    description: 'Assinaturas, aulas, verificação e conteúdos operados pelo Stripe com confirmação por webhook.',
    icon: Wallet
  },
  {
    title: 'Reputação verificável',
    description: 'Perfis verificados, tarefas, avaliações e histórico ajudam a criar confiança na plataforma.',
    icon: BadgeCheck
  }
];

const pricingCards = [
  {
    title: 'Aluno Free',
    price: 'Sem mensalidade',
    items: ['Até 5 aulas na plataforma', 'Busca e perfil completo', 'Compra de conteúdos avulsos']
  },
  {
    title: 'Aluno Pro',
    price: 'R$ 19,90/mês',
    items: ['Aulas ilimitadas', 'Biblioteca vitalícia', 'Histórico e métricas completas']
  },
  {
    title: 'Professor Free',
    price: 'Sem mensalidade',
    items: ['Até 20 aulas', 'Até 20 alunos', 'Até 5 arquivos publicados']
  },
  {
    title: 'Professor Pro',
    price: 'R$ 69,90/mês',
    items: ['Operação ilimitada', 'Agenda e vitrine completas', 'Mais escala para aulas e conteúdos']
  }
];

export function LandingPage() {
  return (
    <main>
      <section className="overflow-hidden py-20 lg:py-28">
        <div className="container-shell grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
              Plataforma educacional em produção
            </span>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 lg:text-6xl">
              Aprenda com professores reais e conduza toda a jornada em um só lugar.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Busque por matéria, agende aulas, compre conteúdos, entregue tarefas e acompanhe sua
              evolução com pagamentos, agenda e autenticação reais desde o início.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
              >
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/descobrir"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Ver professores
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {trustStats.map((item) => (
                <div key={item.label} className="landing-card p-5">
                  <p className="text-lg font-semibold text-slate-900">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="landing-card relative overflow-hidden p-8">
              <div className="absolute inset-x-6 top-6 h-32 rounded-full bg-blue-100 blur-3xl" />
              <div className="relative space-y-5">
                <div className="rounded-3xl bg-slate-950 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-300">Painel do professor</p>
                      <p className="mt-2 text-2xl font-semibold">Agenda, alunos e conteúdos</p>
                    </div>
                    <GraduationCap className="h-10 w-10 text-blue-300" />
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="rounded-3xl bg-blue-50 p-5">
                    <p className="text-sm text-blue-700">Busca por IA</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      Encontre por intenção de estudo
                    </p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">Pagamentos</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      Stripe com confirmação por webhook
                    </p>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                  <p className="text-sm text-slate-500">Experiência operacional</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    Landing inspirada em E-learning e painel orientado a Star Admin2
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container-shell">
          <div className="landing-card grid gap-6 p-8 md:grid-cols-4">
            {trustStats.map((item) => (
              <div key={item.label}>
                <p className="text-3xl font-semibold text-slate-950">{item.value}</p>
                <p className="mt-2 text-sm text-slate-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-shell">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Benefícios principais
            </span>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              Uma operação educacional completa para aluno, professor e administrador.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Os fluxos principais foram desenhados para funcionar com autenticação, dados,
              pagamentos e permissões reais.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="landing-card p-7">
                <feature.icon className="h-10 w-10 text-blue-600" />
                <h3 className="mt-5 text-xl font-semibold text-slate-950">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container-shell grid gap-10 lg:grid-cols-2">
          <div className="landing-card p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
              Como funciona para o aluno
            </p>
            <ol className="mt-6 space-y-5 text-sm leading-7 text-slate-600">
              <li>1. Cria conta, preenche o perfil e escolhe o plano.</li>
              <li>2. Busca por professor, matéria, assunto ou intenção de estudo.</li>
              <li>3. Agenda aula ou compra conteúdo com checkout oficial.</li>
              <li>4. Estuda, responde tarefas e acompanha a própria evolução.</li>
            </ol>
          </div>
          <div className="landing-card p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
              Como funciona para o professor
            </p>
            <ol className="mt-6 space-y-5 text-sm leading-7 text-slate-600">
              <li>1. Cria conta, escolhe plano e completa o perfil profissional.</li>
              <li>2. Define agenda, especialidades e valor-base.</li>
              <li>3. Publica conteúdos, recebe alunos e aplica tarefas.</li>
              <li>4. Acompanha agenda, repasses, avaliações e crescimento operacional.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Busca inteligente / IA
            </span>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              Descoberta guiada por assunto, matéria e similaridade de intenção.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              A busca foi pensada para expandir resultados de forma útil, sem exigir que o aluno
              conheça o nome exato do professor ou do material.
            </p>
          </div>
          <div className="landing-card grid gap-5 p-8 md:grid-cols-2">
            <div className="rounded-3xl bg-blue-50 p-5">
              <p className="text-sm font-semibold text-blue-700">Assunto e intenção</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                A plataforma cruza texto buscado com tags, biografias, conteúdos e áreas de ensino.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-700">Vitrine ampla</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                Resultados podem apontar para professores, aulas e conteúdos relacionados.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5 md:col-span-2">
              <p className="text-sm font-semibold text-slate-700">Operação comercial com contexto</p>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                O aluno chega mais rápido ao que precisa e o professor ganha exposição para aulas e
                materiais compatíveis com sua especialidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container-shell">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Professores e matérias
              </span>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                Áreas de estudo em destaque
              </h2>
            </div>
            <Link to="/descobrir" className="text-sm font-semibold text-blue-700">
              Ver professores
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {['Matemática e exatas', 'Idiomas e conversação', 'Reforço escolar', 'Vestibulares e concursos'].map((card) => (
              <div key={card} className="landing-card p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                  Especialidade
                </p>
                <h3 className="mt-4 text-xl font-semibold text-slate-950">{card}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Professores com agenda, conteúdos e histórico profissional organizados na plataforma.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-shell">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Conteúdos
            </span>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              Materiais digitais vendidos com acesso protegido e vitalício.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {['Guias rápidos', 'Apostilas avançadas', 'Materiais complementares'].map((title) => (
              <div key={title} className="landing-card p-7">
                <p className="text-sm font-semibold text-blue-700">Conteúdo em destaque</p>
                <h3 className="mt-4 text-2xl font-semibold text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Compra segura com snapshot do item para preservar acesso mesmo após mudanças do
                  conteúdo público.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container-shell">
          <div className="text-center">
            <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              Planos
            </span>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              Modelos claros para aluno e professor
            </h2>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-4">
            {pricingCards.map((plan, index) => (
              <div
                key={plan.title}
                className={`landing-card p-7 ${index === 1 || index === 3 ? 'border-blue-500' : ''}`}
              >
                <p className="text-lg font-semibold text-slate-950">{plan.title}</p>
                <p className="mt-2 text-3xl font-semibold text-blue-700">{plan.price}</p>
                <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                  {plan.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Link
                  to="/auth"
                  className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Assinar plano
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-shell grid gap-6 lg:grid-cols-3">
          {[
            'Consigo encontrar professor e conteúdo sem sair da mesma plataforma.',
            'A agenda ficou mais organizada e meus materiais passaram a render de verdade.',
            'O painel administrativo centraliza suporte, verificação e financeiro com clareza.'
          ].map((quote, index) => (
            <div key={quote} className="landing-card p-7">
              <p className="text-sm leading-7 text-slate-700">{quote}</p>
              <p className="mt-5 text-sm font-semibold text-slate-950">
                {index === 0 ? 'Aluno' : index === 1 ? 'Professor' : 'Administrador'}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container-shell">
          <div className="landing-card grid gap-8 p-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
                Empresas e institucional
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                Base pronta para operação white-label, grupos educacionais e redes parceiras.
              </h2>
            </div>
            <div className="space-y-4 text-sm leading-7 text-slate-600">
              <p>Controle de módulos, identidade institucional e visão consolidada da operação.</p>
              <p>Modelo adequado para escalar a plataforma sem depender de fluxos manuais ou locais.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-shell">
          <div className="landing-card bg-slate-950 p-10 text-white">
            <h2 className="text-4xl font-semibold tracking-tight">
              Pronto para começar sua jornada na Mestre Aluno?
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
              Crie sua conta, entre na plataforma e avance com um ambiente pensado para educação,
              operação e crescimento real.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/auth"
                className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Criar conta
              </Link>
              <Link
                to="/painel"
                className="rounded-2xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Entrar na plataforma
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 py-14 text-slate-300">
        <div className="container-shell grid gap-10 md:grid-cols-4">
          <div>
            <p className="text-lg font-semibold text-white">Mestre Aluno</p>
            <p className="mt-4 text-sm leading-7">
              Plataforma que conecta ensino, operação e monetização em um só ambiente.
            </p>
          </div>
          <div>
            <p className="font-semibold text-white">Plataforma</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>Funcionalidades</li>
              <li>Professores</li>
              <li>Conteúdos</li>
              <li>Planos</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white">Suporte</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>Ajuda</li>
              <li>Contato</li>
              <li>Status</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white">Legal</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>Termos</li>
              <li>Privacidade</li>
              <li>LGPD</li>
            </ul>
          </div>
        </div>
      </footer>
    </main>
  );
}
