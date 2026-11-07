import { Link } from 'react-router-dom'
import {
  PenLine, ArrowRight, Check, ListChecks, Highlighter, MessageSquareText, Gauge, Library, ChartLine,
  Compass, GraduationCap, ShieldCheck, Zap, Upload, Target, CircleHelp, Camera, UserPlus, CalendarClock, Telescope, ChevronRight,
} from 'lucide-react'
import { Botao, Cartao, Container, Selo } from '../components/ui.jsx'
import NotaGauge from '../components/NotaGauge.jsx'
import { COMP, CHAVES } from '../lib/competencias.js'
import { DESCRITORES } from '../engine/corretor.js'
import { TEMAS } from '../data/temas.js'
import { APOSTAS, diasParaProva } from '../data/apostas.js'

function Previa() {
  const notas = { c1: 200, c2: 160, c3: 200, c4: 200, c5: 160 }
  return (
    <Cartao className="relative overflow-hidden p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Exemplo de correção</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-800">Herança africana no Brasil</p>
        </div>
        <Selo cor="verde">Corrigida em 2s</Selo>
      </div>
      <div className="mt-4 flex items-center gap-5">
        <NotaGauge total={920} tamanho={128} />
        <div className="flex-1 space-y-2.5">
          {CHAVES.map((k) => (
            <div key={k} className="flex items-center gap-2">
              <span className={`w-7 text-xs font-bold ${COMP[k].texto}`}>{COMP[k].curto}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full" style={{ width: `${notas[k] / 2}%`, background: COMP[k].cor }} />
              </div>
              <span className="w-8 text-right text-xs font-semibold tabular-nums text-slate-600">{notas[k]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 rounded-xl bg-papel p-4 font-serif text-[15px] leading-7 text-slate-700 ring-1 ring-slate-200">
        <span className="rounded bg-violet-100/80 px-0.5 underline decoration-violet-500 decoration-2 underline-offset-4">Além disso</span>, a valorização da cultura
        afro-brasileira <span className="rounded bg-rose-100/70 px-0.5 underline decoration-wavy decoration-rose-500 underline-offset-4">à partir</span> da
        escola é prevista pela <span className="rounded bg-amber-100/80 px-0.5 underline decoration-amber-500 decoration-2 underline-offset-4">Lei 10.639</span>…
        <div className="mt-3 rounded-lg border border-rose-200 bg-white p-3 font-sans text-xs leading-5 text-slate-600 shadow-sm">
          <b className="text-rose-600">C1 · Crase</b> — Não há crase em “a partir de”: “partir” é verbo.
          <span className="ml-1 rounded bg-emerald-50 px-1.5 py-0.5 font-semibold text-emerald-700">a partir</span>
        </div>
      </div>
    </Cartao>
  )
}

const RECURSOS = [
  { icone: Camera, titulo: 'Correção por foto', texto: 'Escreveu no papel? Tire uma foto: o texto é transcrito automaticamente para você conferir e corrigir.' },
  { icone: Gauge, titulo: 'Nota por competência', texto: 'Nota de 0 a 1000 dividida nas 5 competências oficiais, com o nível alcançado em cada uma.' },
  { icone: Highlighter, titulo: 'Erros marcados no texto', texto: 'Ortografia, acentuação, crase, concordância, pontuação e informalidade destacados na sua redação.' },
  { icone: MessageSquareText, titulo: 'Comentários detalhados', texto: 'Pontos fortes, o que melhorar e o caminho exato para subir de nível em cada competência.' },
  { icone: Target, titulo: 'Detecção de fuga ao tema', texto: 'Verifica se você abordou o recorte temático completo, tangenciou ou fugiu do tema.' },
  { icone: ListChecks, titulo: 'Proposta de intervenção', texto: 'Checagem dos 5 elementos: agente, ação, meio/modo, finalidade e detalhamento.' },
  { icone: Library, titulo: `${TEMAS.length} temas`, texto: 'Todos os temas oficiais do ENEM desde 1998 e dezenas de temas inéditos para treinar.' },
  { icone: ChartLine, titulo: 'Gráficos de desempenho', texto: 'Acompanhe sua evolução por competência a cada redação corrigida.' },
  { icone: Compass, titulo: 'Redação guiada', texto: 'Escreva parágrafo por parágrafo com orientações e checklist em tempo real.' },
  { icone: GraduationCap, titulo: 'Curso completo', texto: 'Aulas sobre estrutura, competências, repertório, conectivos e redação modelo.' },
  { icone: UserPlus, titulo: 'Conta gratuita', texto: 'Crie sua conta para guardar todas as redações e acompanhar sua evolução em qualquer dispositivo.' },
]

const FAQ = [
  ['É gratuito mesmo?', 'Sim. Todas as funções — correção detalhada, marcações, comentários, gráficos, redação guiada e curso — são gratuitas e ilimitadas. Não existe plano pago.'],
  ['Preciso criar conta?', 'Não. Você pode corrigir sem cadastro e o histórico fica salvo no seu navegador. Se preferir, crie uma conta para guardar suas correções na nuvem e acessá-las em qualquer dispositivo.'],
  ['Como a nota é calculada?', 'O corretor analisa sua redação pelos critérios da matriz de referência do ENEM: domínio da norma-padrão (C1), compreensão da proposta e repertório (C2), argumentação (C3), coesão (C4) e proposta de intervenção (C5). Cada competência vale de 0 a 200, em níveis de 40 pontos.'],
  ['A nota é igual à do ENEM?', 'É uma estimativa automática baseada nos critérios oficiais. Ela é ótima para treinar e identificar pontos fracos, mas a nota real depende da avaliação de dois corretores humanos.'],
  ['Meu texto fica salvo onde?', 'No seu navegador (ou na sua conta, se fizer login). A verificação ortográfica avançada envia o texto à API pública do LanguageTool apenas para checagem — você pode desativá-la no editor. A leitura de foto e a segunda opinião com IA enviam o conteúdo ao serviço de IA do site (Google Gemini, no plano gratuito, cujos termos permitem usar o conteúdo para melhorar o serviço).'],
  ['Posso corrigir redação escrita à mão?', 'Sim! Envie uma foto da folha: o texto é transcrito automaticamente e você confere a transcrição antes de corrigir. Com conta, a leitura usa IA e entende até letra cursiva. Você também pode digitar, colar o texto ou enviar um arquivo .txt.'],
]

export default function Inicio() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_70%_0%,rgba(55,104,246,.12),transparent),radial-gradient(40%_40%_at_0%_100%,rgba(251,191,36,.10),transparent)]" />
        <Container className="grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_1fr] lg:py-20">
          <div className="animate-surgir">
            {diasParaProva() !== null && (
              <Link to="/temas?aba=apostas" className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-400 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm transition hover:bg-amber-300">
                <CalendarClock className="h-3.5 w-3.5" /> {diasParaProva() === 0 ? 'Redação do ENEM é hoje' : diasParaProva() === 1 ? 'Redação do ENEM é amanhã' : `ENEM em ${diasParaProva()} dias`} · ver apostas 2026 <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
            <div><Selo cor="tinta" className="mb-5"><ShieldCheck className="h-3.5 w-3.5" /> 100% gratuito · sem cadastro · sem plano pago</Selo></div>
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl">
              Correção de redação ENEM <span className="text-tinta-600">detalhada</span> e instantânea.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Descubra sua nota em segundos. Escolha um tema, escreva e receba nota por competência,
              erros marcados no texto e comentários para chegar aos 1000 pontos.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Botao to="/escrever" tamanho="lg" icone={PenLine}>Corrigir minha redação</Botao>
              <Botao to="/escrever?foto=1" tamanho="lg" variante="secundario" icone={Camera}>Enviar foto da redação</Botao>
            </div>
            <ul className="mt-8 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
              {['Nota de 0 a 1000', 'Erros destacados', 'Resultado em segundos'].map((t) => (
                <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> {t}</li>
              ))}
            </ul>
          </div>
          <div className="animate-surgir [animation-delay:120ms]"><Previa /></div>
        </Container>
      </section>

      {/* APOSTAS ENEM 2026 */}
      {diasParaProva() !== null && (
        <section className="pb-4">
          <Container>
            <div className="overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-white">
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-400 text-white shadow-md shadow-amber-400/40 animate-pulsar"><CalendarClock className="h-6 w-6" /></span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-700">ENEM 2026</p>
                    <h2 className="text-lg font-bold text-slate-900">{diasParaProva() === 0 ? 'A redação é hoje! Boa prova!' : diasParaProva() === 1 ? 'A redação é amanhã (8/11)' : `Faltam ${diasParaProva()} dias para a redação`}</h2>
                    <p className="text-sm text-slate-600">Treine com os temas que mais podem cair, com análise e repertório.</p>
                  </div>
                </div>
                <Botao to="/temas?aba=apostas" icone={Telescope}>Ver apostas</Botao>
              </div>
              <ul className="grid divide-y divide-amber-100 border-t border-amber-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {APOSTAS.filter((a) => a.nivel === 'Forte').map((a) => (
                  <li key={a.id}>
                    <Link to="/temas?aba=apostas" className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-slate-800 transition hover:bg-amber-50/60">
                      <span className="line-clamp-2 flex-1">{a.titulo}</span><ChevronRight className="h-4 w-4 shrink-0 text-amber-500" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>
      )}

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="border-y border-slate-200/70 bg-white py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-tinta-600">Como funciona</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">A maneira mais rápida de treinar redação</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: 1, icone: Library, t: 'Escolha um tema', d: `${TEMAS.length} temas: todos os oficiais do ENEM e inéditos com cara de prova. Ou digite o seu.` },
              { n: 2, icone: PenLine, t: 'Escreva ou fotografe', d: 'Escreva no editor com contador de linhas e cronômetro, ou envie uma foto da redação feita no papel.' },
              { n: 3, icone: Zap, t: 'Receba a correção', d: 'Nota por competência, erros marcados, comentários e o caminho para subir de nível.' },
            ].map((p) => (
              <div key={p.n} className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
                <span className="absolute right-5 top-5 text-5xl font-black text-slate-200/80">{p.n}</span>
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-tinta-600 text-white shadow-sm"><p.icone className="h-5 w-5" /></div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{p.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{p.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Botao to="/escrever" iconeDireita={ArrowRight}>Começar agora</Botao>
          </div>
        </Container>
      </section>

      {/* RECURSOS */}
      <section className="py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-tinta-600">Tudo incluso, de graça</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Recursos que costumam ser pagos — aqui são livres</h2>
            <p className="mt-3 text-slate-600">Sem limite de correções, sem período de teste e sem cartão de crédito.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RECURSOS.map((r) => (
              <Cartao key={r.titulo} className="p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-tinta-50 text-tinta-600"><r.icone className="h-5 w-5" /></div>
                <h3 className="mt-3 font-semibold text-slate-900">{r.titulo}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{r.texto}</p>
              </Cartao>
            ))}
          </div>
        </Container>
      </section>

      {/* COMPETÊNCIAS */}
      <section className="border-y border-slate-200/70 bg-white py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-tinta-600">Critérios oficiais</p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Avaliada nas 5 competências do ENEM</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {CHAVES.map((k) => (
              <div key={k} className={`rounded-2xl border ${COMP[k].borda} ${COMP[k].bg} p-5`}>
                <span className={`text-sm font-black ${COMP[k].texto}`}>{COMP[k].curto} · 200 pts</span>
                <h3 className="mt-2 font-semibold text-slate-900">{COMP[k].titulo}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{DESCRITORES[k].nome}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-slate-500">
            Quer entender cada uma a fundo? <Link to="/aprenda/competencias" className="font-semibold text-tinta-700 hover:underline">Veja a aula sobre as competências →</Link>
          </p>
        </Container>
      </section>

      {/* GUIADA + CURSO */}
      <section className="py-16">
        <Container className="grid gap-6 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl bg-tinta-700 p-8 text-white">
            <Compass className="absolute -right-6 -top-6 h-40 w-40 text-white/10" />
            <Selo cor="vidro">Modo Redação Guiada</Selo>
            <h3 className="mt-4 text-2xl font-bold">Escreva parágrafo por parágrafo, com um guia ao lado</h3>
            <p className="mt-2 max-w-md text-tinta-100">Orientações para introdução, desenvolvimento e conclusão, com checklist da proposta de intervenção em tempo real.</p>
            <Botao to="/guiada" variante="claro" className="mt-6" iconeDireita={ArrowRight}>Experimentar</Botao>
          </div>
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white">
            <GraduationCap className="absolute -right-6 -top-6 h-40 w-40 text-white/10" />
            <Selo cor="vidro">Curso gratuito</Selo>
            <h3 className="mt-4 text-2xl font-bold">Saiba o que escrever do primeiro ao último parágrafo</h3>
            <p className="mt-2 max-w-md text-slate-300">Estrutura, as 5 competências, repertório, conectivos, proposta de intervenção e redação modelo comentada.</p>
            <Botao to="/aprenda" variante="claro" className="mt-6" iconeDireita={ArrowRight}>Acessar o curso</Botao>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-200/70 bg-white py-16">
        <Container className="max-w-3xl">
          <div className="text-center">
            <CircleHelp className="mx-auto h-8 w-8 text-tinta-600" />
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Perguntas frequentes</h2>
          </div>
          <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200">
            {FAQ.map(([p, r]) => (
              <details key={p} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
                  {p}
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{r}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA FINAL */}
      <section className="pt-16">
        <Container>
          <div className="flex flex-col items-center gap-6 rounded-3xl bg-gradient-to-br from-tinta-600 to-tinta-800 px-6 py-12 text-center text-white sm:px-12">
            <h2 className="text-3xl font-bold tracking-tight">Sua próxima redação pode ser nota 1000</h2>
            <p className="max-w-xl text-tinta-100">Treine com frequência, corrija em segundos e acompanhe sua evolução. Tudo de graça.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Botao to="/escrever" variante="claro" tamanho="lg" icone={PenLine}>Corrigir minha redação</Botao>
              <Botao to="/escrever?foto=1" tamanho="lg" className="bg-white/10 hover:bg-white/20 shadow-none" icone={Camera}>Enviar foto da redação</Botao>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
