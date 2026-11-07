import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Clock, Lightbulb, TriangleAlert, Quote, PenLine, BookOpen } from 'lucide-react'
import { Botao, Cartao, Container, Selo, Vazio } from '../components/ui.jsx'
import { AULAS, buscarAula, REDACAO_MODELO } from '../data/aulas.js'
import { GRUPOS_CONECTIVOS } from '../engine/dados/conectivos.js'
import { salvarRascunho } from '../lib/armazenamento.js'

function Bloco({ b }) {
  if (b.h) return <h2 className="mt-8 text-xl font-bold text-slate-900">{b.h}</h2>
  if (b.p) return <p className="mt-4 leading-relaxed text-slate-700">{b.p}</p>
  if (b.lista) return <ul className="mt-4 list-disc space-y-2 pl-6 leading-relaxed text-slate-700">{b.lista.map((x) => <li key={x}>{x}</li>)}</ul>
  if (b.numerada) return <ol className="mt-4 list-decimal space-y-2 pl-6 leading-relaxed text-slate-700">{b.numerada.map((x) => <li key={x}>{x}</li>)}</ol>
  if (b.dica) return <p className="mt-5 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900"><Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> {b.dica}</p>
  if (b.alerta) return <p className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900"><TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /> {b.alerta}</p>
  if (b.exemplo) return <blockquote className="mt-5 rounded-2xl border-l-4 border-tinta-400 bg-papel p-5 font-serif leading-8 text-slate-800 ring-1 ring-slate-200"><Quote className="mb-2 h-5 w-5 text-tinta-400" />{b.exemplo}</blockquote>
  if (b.tabela) {
    return (
      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-slate-50"><tr>{b.tabela.cabecalho.map((c) => <th key={c} className="px-4 py-3 font-semibold text-slate-700">{c}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {b.tabela.linhas.map((l, i) => <tr key={i}>{l.map((c, j) => <td key={j} className={`px-4 py-3 align-top ${j === 0 ? 'font-medium text-slate-900' : 'text-slate-600'}`}>{c}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
    )
  }
  if (b.conectivos) {
    return (
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {Object.entries(GRUPOS_CONECTIVOS).map(([tipo, lista]) => (
          <Cartao key={tipo} className="p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-violet-700">{tipo}</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {lista.map((c) => <span key={c} className="rounded-md bg-violet-50 px-2 py-1 text-xs font-medium text-violet-800">{c}</span>)}
            </div>
          </Cartao>
        ))}
      </div>
    )
  }
  if (b.modelo) {
    return (
      <div className="mt-6 space-y-4">
        <p className="text-sm font-semibold text-slate-500">Tema: {REDACAO_MODELO.tema}</p>
        {REDACAO_MODELO.paragrafos.map((p, i) => (
          <div key={i} className="grid gap-3 lg:grid-cols-[1fr_280px]">
            <p className="rounded-2xl bg-papel p-5 font-serif leading-8 text-slate-800 ring-1 ring-slate-200 indent-8">{p.texto}</p>
            <p className="rounded-2xl border border-tinta-100 bg-tinta-50/60 p-4 text-sm leading-relaxed text-tinta-900"><b className="block text-xs uppercase tracking-wider text-tinta-600">{i + 1}º parágrafo</b>{p.comentario}</p>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function Aula() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const aula = buscarAula(slug)
  if (!aula) {
    return <Container className="py-16"><Vazio icone={BookOpen} titulo="Aula não encontrada" acao={<Botao to="/aprenda">Ver todas as aulas</Botao>} /></Container>
  }
  const i = AULAS.indexOf(aula)
  const anterior = AULAS[i - 1]
  const proxima = AULAS[i + 1]
  const corrigirModelo = () => {
    salvarRascunho({ texto: REDACAO_MODELO.paragrafos.map((p) => p.texto).join('\n'), temaId: 'enem-2023' })
    navigate('/escrever/enem-2023')
  }

  return (
    <Container className="max-w-4xl py-5 sm:py-10">
      <Link to="/aprenda" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-tinta-700"><ArrowLeft className="h-4 w-4" /> Todas as aulas</Link>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Selo cor="tinta">Aula {i + 1} de {AULAS.length}</Selo>
        <Selo>{aula.modulo}</Selo>
        <span className="flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3.5 w-3.5" /> {aula.duracao}</span>
      </div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{aula.titulo}</h1>
      <p className="mt-2 text-lg text-slate-600">{aula.resumo}</p>
      <article className="mt-6">{aula.blocos.map((b, k) => <Bloco key={k} b={b} />)}</article>
      {aula.slug === 'modelo-nota-1000' && <Botao className="mt-6" icone={PenLine} onClick={corrigirModelo}>Corrigir a redação modelo</Botao>}
      <nav className="mt-12 grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-2">
        {anterior ? (
          <Link to={`/aprenda/${anterior.slug}`} className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-tinta-200 hover:bg-tinta-50/40">
            <span className="flex items-center gap-1 text-xs text-slate-500"><ArrowLeft className="h-3.5 w-3.5" /> Anterior</span>
            <span className="mt-1 block font-semibold text-slate-900">{anterior.titulo}</span>
          </Link>
        ) : <span />}
        {proxima && (
          <Link to={`/aprenda/${proxima.slug}`} className="rounded-2xl border border-slate-200 bg-white p-4 text-right transition hover:border-tinta-200 hover:bg-tinta-50/40">
            <span className="flex items-center justify-end gap-1 text-xs text-slate-500">Próxima <ArrowRight className="h-3.5 w-3.5" /></span>
            <span className="mt-1 block font-semibold text-slate-900">{proxima.titulo}</span>
          </Link>
        )}
      </nav>
    </Container>
  )
}
