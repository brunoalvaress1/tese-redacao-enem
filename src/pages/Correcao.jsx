import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  PenLine, Printer, RotateCcw, CircleCheck, CircleX, TriangleAlert, Lightbulb, ArrowRight, FileText, Ban,
  ArrowUpRight, ListChecks, Quote, Target, Link2, Info, X, Calendar, Cloud, Camera,
} from 'lucide-react'
import { Botao, Cartao, Container, Selo, Carregando, Vazio, BarraNota, cx } from '../components/ui.jsx'
import NotaGauge from '../components/NotaGauge.jsx'
import TextoMarcado from '../components/TextoMarcado.jsx'
import SegundaOpiniao from '../components/SegundaOpiniao.jsx'
import { obterCorrecao, salvarRascunho } from '../lib/armazenamento.js'
import { COMP, CHAVES, formatarData } from '../lib/competencias.js'
import { DESCRITORES } from '../engine/corretor.js'
import { useAuth } from '../lib/auth.jsx'

const ROTULO_TEMA = {
  pleno: ['Tema abordado por completo', 'verde'],
  parcial: ['Tema abordado parcialmente', 'ambar'],
  tangencia: ['Tangenciamento do tema', 'rosa'],
  fuga: ['Fuga ao tema', 'rosa'],
  'sem-tema': ['Tema não informado', 'slate'],
}

function Lista({ itens, tipo }) {
  if (!itens?.length) return null
  const Icone = tipo === 'bom' ? CircleCheck : Lightbulb
  return (
    <ul className="space-y-2">
      {itens.map((t, i) => (
        <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-700">
          <Icone className={cx('mt-0.5 h-4 w-4 shrink-0', tipo === 'bom' ? 'text-emerald-500' : 'text-amber-500')} />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  )
}

function Check({ ok, children, sub }) {
  return (
    <li className="flex items-start gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5">
      {ok ? <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> : <CircleX className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />}
      <div className="min-w-0 text-sm">
        <p className={ok ? 'font-medium text-slate-800' : 'text-slate-600'}>{children}</p>
        {sub && <p className="mt-0.5 truncate text-xs text-slate-500">{sub}</p>}
      </div>
    </li>
  )
}

function Extras({ k, r }) {
  const a = r.analise
  if (k === 'c1') {
    const porTipo = r.competencias.c1.detalhes?.porTipo || {}
    return (
      <div className="flex flex-wrap gap-2">
        {Object.entries(porTipo).sort((x, y) => y[1] - x[1]).map(([t, n]) => <Selo key={t} cor="rosa">{t}: {n}</Selo>)}
        {!Object.keys(porTipo).length && <Selo cor="verde">Nenhum desvio encontrado</Selo>}
      </div>
    )
  }
  if (k === 'c2') {
    const [rot, cor] = ROTULO_TEMA[a.tema.status]
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2"><Target className="h-4 w-4 text-slate-400" /><Selo cor={cor}>{rot}</Selo></div>
        {a.tema.grupos?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 text-xs">
            {a.tema.encontrados.map((g) => <span key={g} className="rounded-md bg-emerald-50 px-2 py-1 font-medium text-emerald-700">✓ {g}</span>)}
            {a.tema.ausentes.map((g) => <span key={g} className="rounded-md bg-rose-50 px-2 py-1 font-medium text-rose-700">✗ {g}</span>)}
          </div>
        )}
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400"><Quote className="h-3.5 w-3.5" /> Repertório identificado</p>
          {a.repertorio.length ? (
            <ul className="space-y-1.5">
              {a.repertorio.map((x, i) => (
                <li key={i} className="flex items-center justify-between gap-2 rounded-lg bg-amber-50/60 px-3 py-2 text-sm">
                  <span className="truncate text-slate-800">“{x.trecho}”</span>
                  <span className="shrink-0 text-xs text-amber-700">{x.tipo} · {x.paragrafo + 1}º §</span>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-slate-500">Nenhum repertório sociocultural reconhecido.</p>}
        </div>
      </div>
    )
  }
  if (k === 'c3') {
    const p = a.projeto
    return (
      <ul className="grid gap-2">
        <Check ok={p.tese}>Tese na introdução</Check>
        <Check ok={p.anuncio}>Argumentos anunciados na introdução</Check>
        {p.desenvolvimento.map((d, i) => (
          <Check key={i} ok={d.desenvolvido && d.alinhado} sub={`${d.palavras} palavras · ${d.sentencas} frases · ${d.marcadores} operador(es) argumentativo(s)`}>
            {i + 2}º parágrafo {d.desenvolvido ? (d.alinhado ? 'desenvolvido e alinhado à tese' : 'desenvolvido, mas pouco alinhado à introdução') : 'pouco desenvolvido'}
          </Check>
        ))}
        <Check ok={p.conclusaoRetoma}>Conclusão retoma a discussão</Check>
      </ul>
    )
  }
  if (k === 'c4') {
    const c = a.coesao
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-violet-50 py-2"><p className="text-lg font-bold text-violet-700">{c.variedade}</p><p className="text-[11px] text-slate-500">conectivos diferentes</p></div>
          <div className="rounded-xl bg-violet-50 py-2"><p className="text-lg font-bold text-violet-700">{c.transicoesOk}/{c.transicoes}</p><p className="text-[11px] text-slate-500">parágrafos articulados</p></div>
          <div className="rounded-xl bg-violet-50 py-2"><p className="text-lg font-bold text-violet-700">{c.referenciais}</p><p className="text-[11px] text-slate-500">retomadas</p></div>
        </div>
        {c.conectivos.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {c.conectivos.map(([t, n]) => (
              <span key={t} className={cx('rounded-md px-2 py-1 text-xs font-medium', n >= 3 ? 'bg-amber-50 text-amber-800' : 'bg-violet-50 text-violet-700')}>{t}{n > 1 && ` ×${n}`}</span>
            ))}
          </div>
        )}
        {c.repeticoes.length > 0 && (
          <p className="text-xs text-slate-500">Repetições: {c.repeticoes.map((x) => `“${x.palavra}” (${x.vezes}×)`).join(', ')}</p>
        )}
      </div>
    )
  }
  if (k === 'c5') {
    const e = a.proposta.elementos
    const nomes = [['agente', 'Agente', 'Quem?'], ['acao', 'Ação', 'O quê?'], ['meio', 'Meio/modo', 'Como?'], ['finalidade', 'Finalidade', 'Para quê?'], ['detalhamento', 'Detalhamento', 'Detalhe']]
    return (
      <ul className="grid gap-2">
        {nomes.map(([key, nome, perg]) => <Check key={key} ok={!!e[key]} sub={e[key] ? `“${e[key]}”` : `Não identificado — ${perg}`}>{nome}</Check>)}
      </ul>
    )
  }
  return null
}

export default function Correcao() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const [r, setR] = useState(undefined)
  const [aba, setAba] = useState('c1')
  const [camadas, setCamadas] = useState({ 1: true, 2: true, 3: true, 4: false, 5: true })
  const [sel, setSel] = useState(null)

  useEffect(() => {
    let vivo = true
    obterCorrecao(id).then((x) => vivo && setR(x || null))
    return () => { vivo = false }
  }, [id])

  const marcasVisiveis = useMemo(() => (r ? r.marcas.filter((m) => camadas[m.competencia]) : []), [r, camadas])
  const desvios = useMemo(() => {
    if (!r) return []
    const vistas = new Set()
    return r.marcas.filter((m) => {
      if (m.natureza !== 'erro') return false
      if (m.tipo !== 'repetição') return true
      const chave = m.msg
      if (vistas.has(chave)) return false
      vistas.add(chave)
      return true
    })
  }, [r])
  const marcaSel = r?.marcas.find((m) => m.id === sel)

  if (r === undefined) return <Carregando texto="Carregando correção…" />
  if (r === null) {
    return (
      <Container className="py-16">
        <Vazio icone={FileText} titulo="Correção não encontrada" texto="Ela pode ter sido apagada ou feita em outro navegador. Faça login para acessar correções salvas na nuvem."
          acao={<Botao to="/escrever" icone={PenLine}>Corrigir uma redação</Botao>} />
      </Container>
    )
  }

  const reescrever = () => {
    salvarRascunho({ texto: r.texto, temaId: r.tema?.id || null, temaLivre: r.tema && !r.tema.id ? r.tema.titulo : null })
    navigate(r.tema?.id ? `/escrever/${r.tema.id}` : '/escrever')
  }
  const selecionar = (mid) => {
    setSel(mid)
    const m = r.marcas.find((x) => x.id === mid)
    if (m) setAba(`c${m.competencia}`)
  }
  const irParaMarca = (mid) => {
    const m = r.marcas.find((x) => x.id === mid)
    if (m && !camadas[m.competencia]) setCamadas((c) => ({ ...c, [m.competencia]: true }))
    setSel(mid)
    setTimeout(() => document.querySelector(`[data-marca="${mid}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60)
  }
  const comp = r.competencias[aba]

  return (
    <Container className="py-6 sm:py-10">
      {/* CABEÇALHO */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 sm:mb-6 sm:gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="h-4 w-4" /> {formatarData(r.criadoEm)}
            {usuario && <span className="flex items-center gap-1 text-emerald-600"><Cloud className="h-4 w-4" /> salva na nuvem</span>}
            {r.origem === 'foto' && <span className="flex items-center gap-1 text-tinta-600"><Camera className="h-4 w-4" /> transcrita de foto</span>}
          </p>
          <h1 className="mt-1 text-lg font-bold leading-snug tracking-tight text-slate-900 sm:text-3xl sm:leading-tight">{r.tema?.titulo || 'Redação sem tema definido'}</h1>
        </div>
        <div className="grid w-full grid-cols-3 gap-2 sm:flex sm:w-auto print:hidden">
          <Botao variante="secundario" tamanho="sm" icone={RotateCcw} onClick={reescrever} className="px-2">Reescrever</Botao>
          <Botao variante="secundario" tamanho="sm" icone={Printer} onClick={() => window.print()} className="px-2"><span className="sm:hidden">PDF</span><span className="hidden sm:inline">Imprimir / PDF</span></Botao>
          <Botao tamanho="sm" icone={PenLine} className="px-2" to="/escrever" onClick={() => salvarRascunho({ texto: '', temaId: null })}>Nova<span className="hidden sm:inline">&nbsp;redação</span></Botao>
        </div>
      </div>

      {r.anulacao && (
        <div className="mb-6 flex gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-600"><Ban className="h-5 w-5" /></div>
          <div>
            <h2 className="font-bold text-rose-800">Redação anulada: {r.anulacao.motivo}</h2>
            <p className="mt-1 text-sm text-rose-700">{r.anulacao.detalhe}</p>
            <p className="mt-2 text-xs text-rose-600">As análises abaixo continuam disponíveis para você entender o que melhorar.</p>
          </div>
        </div>
      )}

      {/* RESUMO */}
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <Cartao className="flex flex-col items-center justify-center p-4 text-center sm:p-6">
          <NotaGauge total={r.total} tamanho={170} />
          <div className="mt-2 grid w-full grid-cols-3 gap-2 text-center">
            {[['Palavras', r.analise.estatisticas.palavras], ['Linhas', `≈${r.analise.estatisticas.linhas}`], ['Desvios', desvios.length]].map(([a, b]) => (
              <div key={a} className="rounded-xl bg-slate-50 py-2"><p className="font-bold tabular-nums text-slate-900">{b}</p><p className="text-[11px] text-slate-500">{a}</p></div>
            ))}
          </div>
        </Cartao>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {CHAVES.map((k) => {
            const c = r.competencias[k]
            const ativo = aba === k
            return (
              <button key={k} onClick={() => setAba(k)}
                className={cx('group flex flex-col rounded-2xl border bg-white p-4 text-left shadow-suave transition hover:-translate-y-0.5', ativo ? `${COMP[k].borda} ring-2 ${COMP[k].anel}` : 'border-slate-200/80')}>
                <div className="flex items-center justify-between">
                  <span className={cx('text-xs font-black', COMP[k].texto)}>{COMP[k].curto}</span>
                  <span className="text-xs text-slate-400">nível {c.nivel}/5</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-800">{COMP[k].titulo}</p>
                <p className="mt-2 text-2xl font-extrabold tabular-nums text-slate-900 sm:mt-3">{c.nota}<span className="text-sm font-medium text-slate-400">/200</span></p>
                <BarraNota nota={c.nota} cor={COMP[k].cor} className="mt-2" />
                <p className="mt-3 line-clamp-3 hidden text-xs leading-relaxed text-slate-500 sm:block">{c.resumo}</p>
              </button>
            )
          })}
        </div>
      </div>

      {r.avisos?.length > 0 && (
        <div className="mt-6 space-y-2">
          {r.avisos.map((a) => <p key={a} className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {a}</p>)}
        </div>
      )}

      {/* TEXTO + COMENTÁRIOS */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="min-w-0 space-y-4">
          <Cartao className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3 print:hidden">
              <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Mostrar</span>
              {CHAVES.map((k) => {
                const n = COMP[k].n
                const rot = { 1: 'Erros', 2: 'Repertório', 3: 'Tese', 4: 'Coesão', 5: 'Proposta' }[n]
                return (
                  <button key={k} onClick={() => setCamadas((c) => ({ ...c, [n]: !c[n] }))} aria-pressed={camadas[n]}
                    className={cx('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition', camadas[n] ? `${COMP[k].bg} ${COMP[k].texto} ${COMP[k].borda.replace('border', 'ring')}` : 'bg-white text-slate-400 ring-slate-200')}>
                    <span className="h-2 w-2 rounded-full" style={{ background: camadas[n] ? COMP[k].cor : '#cbd5e1' }} /> {COMP[k].curto} · {rot}
                  </button>
                )
              })}
            </div>
            {marcaSel && (
              <div className={cx('flex items-start gap-3 border-b px-5 py-4 print:hidden', COMP[`c${marcaSel.competencia}`].bg, COMP[`c${marcaSel.competencia}`].borda)}>
                <div className="min-w-0 flex-1">
                  <p className={cx('text-xs font-bold uppercase tracking-wider', COMP[`c${marcaSel.competencia}`].texto)}>
                    C{marcaSel.competencia} · {marcaSel.tipo}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{marcaSel.msg}</p>
                  {marcaSel.sugestoes?.length > 0 && (
                    <p className="mt-2 flex flex-wrap items-center gap-1.5 text-sm">
                      <span className="rounded bg-white px-1.5 py-0.5 text-slate-500 line-through">{marcaSel.trecho}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      {marcaSel.sugestoes.map((s) => <span key={s} className="rounded bg-emerald-100 px-1.5 py-0.5 font-semibold text-emerald-800">{s}</span>)}
                    </p>
                  )}
                </div>
                <button onClick={() => setSel(null)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-white/70" aria-label="Fechar detalhe"><X className="h-4 w-4" /></button>
              </div>
            )}
            <div className="bg-papel px-5 py-6 sm:px-8">
              <TextoMarcado texto={r.texto} marcas={marcasVisiveis} selecionada={sel} onSelecionar={selecionar} />
            </div>
            <p className="flex items-center gap-1.5 border-t border-slate-100 px-5 py-2.5 text-xs text-slate-500 print:hidden">
              <Info className="h-3.5 w-3.5" /> Clique em um trecho destacado para ver a explicação. Sublinhado ondulado = desvio; contínuo = acerto.
            </p>
          </Cartao>

          {/* LISTA DE DESVIOS */}
          <Cartao className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900"><ListChecks className="h-5 w-5 text-rose-500" /> Desvios encontrados</h2>
              <Selo cor={desvios.length ? 'rosa' : 'verde'}>{desvios.length}</Selo>
            </div>
            {desvios.length ? (
              <ul className="divide-y divide-slate-100">
                {desvios.map((m) => (
                  <li key={m.id}>
                    <button onClick={() => irParaMarca(m.id)} className={cx('flex w-full gap-3 px-5 py-3 text-left transition hover:bg-slate-50', sel === m.id && 'bg-slate-50')}>
                      <span className={cx('mt-0.5 shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase', COMP[`c${m.competencia}`].bg, COMP[`c${m.competencia}`].texto)}>C{m.competencia}</span>
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-1.5 text-sm">
                          <span className="font-medium text-rose-700 line-through decoration-rose-300">{m.trecho}</span>
                          {m.sugestoes?.[0] && <><ArrowRight className="h-3 w-3 text-slate-400" /><span className="font-semibold text-emerald-700">{m.sugestoes[0]}</span></>}
                          <span className="text-xs text-slate-400">· {m.tipo}</span>
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">{m.msg}</p>
                      </div>
                      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-6 text-sm text-slate-500">Nenhum desvio encontrado. Excelente!</p>
            )}
          </Cartao>
          <SegundaOpiniao correcao={r} onAtualizar={setR} />
        </div>

        {/* COMENTÁRIOS POR COMPETÊNCIA */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Cartao className="overflow-hidden">
            <div className="flex overflow-x-auto border-b border-slate-100 print:hidden" role="tablist">
              {CHAVES.map((k) => (
                <button key={k} role="tab" aria-selected={aba === k} onClick={() => setAba(k)}
                  className={cx('flex-1 border-b-2 px-3 py-3 text-sm font-bold transition', aba === k ? `${COMP[k].texto}` : 'border-transparent text-slate-400 hover:text-slate-600')}
                  style={aba === k ? { borderColor: COMP[k].cor } : undefined}>
                  {COMP[k].curto}
                </button>
              ))}
            </div>
            <div className="space-y-5 p-5" role="tabpanel">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={cx('text-xs font-bold uppercase tracking-wider', COMP[aba].texto)}>Competência {COMP[aba].n}</p>
                    <h3 className="mt-0.5 font-semibold leading-snug text-slate-900">{DESCRITORES[aba].nome}</h3>
                  </div>
                  <p className="shrink-0 text-2xl font-extrabold tabular-nums text-slate-900">{comp.nota}</p>
                </div>
                <div className={cx('mt-3 rounded-xl border p-3 text-sm', COMP[aba].bg, COMP[aba].borda)}>
                  <p className={cx('text-xs font-bold', COMP[aba].texto)}>Nível {comp.nivel} · {comp.nota} pontos</p>
                  <p className="mt-1 text-slate-700">{DESCRITORES[aba].niveis[comp.nota]}</p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{comp.resumo}</p>
              </div>
              <Extras k={aba} r={r} />
              {comp.pontosFortes?.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Pontos fortes</h4>
                  <Lista itens={comp.pontosFortes} tipo="bom" />
                </div>
              )}
              {comp.melhorias?.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">O que melhorar</h4>
                  <Lista itens={comp.melhorias} tipo="melhorar" />
                </div>
              )}
              {comp.proximoNivel && (
                <p className="flex gap-2 rounded-xl bg-tinta-50 p-3 text-sm text-tinta-800"><Link2 className="mt-0.5 h-4 w-4 shrink-0" /> {comp.proximoNivel}</p>
              )}
            </div>
          </Cartao>
          <Cartao className="p-5 print:hidden">
            <h3 className="font-semibold text-slate-900">Continue evoluindo</h3>
            <div className="mt-3 grid gap-2">
              <Link to={`/aprenda/${{ c1: 'norma-padrao', c2: 'repertorio', c3: 'argumentacao', c4: 'conectivos', c5: 'proposta-de-intervencao' }[aba]}`}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Aula sobre a {COMP[aba].curto}: {COMP[aba].titulo} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/desempenho" className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Ver meu desempenho <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Cartao>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-slate-400">
        Nota estimada automaticamente com base na matriz de referência do ENEM{r.fonte?.includes('languagetool') ? ' · ortografia verificada com LanguageTool' : ''}.
      </p>
    </Container>
  )
}
