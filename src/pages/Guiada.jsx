import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Compass, Library, ArrowLeft, ArrowRight, CircleCheck, Circle, Sparkles, PenLine, Lightbulb, Plus, RotateCcw, Shuffle,
} from 'lucide-react'
import { Botao, Cartao, Container, Selo, cx } from '../components/ui.jsx'
import SeletorTema from '../components/SeletorTema.jsx'
import { buscarTema, temaAleatorio } from '../data/temas.js'
import { ETAPAS_GUIADA, checarEtapa, montarTexto } from '../engine/guia.js'
import { contarPalavras } from '../engine/texto.js'
import { corrigirRedacao } from '../engine/corretor.js'
import { salvarCorrecao, salvarRascunho } from '../lib/armazenamento.js'

const CHAVE = 'tese:guiada:v1'
function ler() {
  try { return JSON.parse(localStorage.getItem(CHAVE) || 'null') || {} } catch { return {} }
}

export default function Guiada() {
  const [busca] = useSearchParams()
  const navigate = useNavigate()
  const salvo = useMemo(() => ler(), [])
  const [tema, setTema] = useState(() => buscarTema(busca.get('tema')) || (salvo.temaId ? buscarTema(salvo.temaId) : null) || (salvo.temaLivre ? { id: null, titulo: salvo.temaLivre, livre: true } : null))
  const [partes, setPartes] = useState(salvo.partes || {})
  const [passo, setPasso] = useState(salvo.passo || 0)
  const [seletor, setSeletor] = useState(false)
  const [corrigindo, setCorrigindo] = useState(false)
  const areaRef = useRef(null)

  useEffect(() => {
    const t = buscarTema(busca.get('tema'))
    if (t) setTema(t)
  }, [busca])

  useEffect(() => {
    try { localStorage.setItem(CHAVE, JSON.stringify({ partes, passo, temaId: tema?.id || null, temaLivre: tema?.livre ? tema.titulo : null })) } catch { /* sem armazenamento */ }
  }, [partes, passo, tema])

  const revisao = passo === ETAPAS_GUIADA.length
  const etapa = ETAPAS_GUIADA[passo]
  const texto = etapa ? partes[etapa.id] || '' : ''
  const checklist = useMemo(() => (etapa ? checarEtapa(etapa.id, texto, tema) : []), [etapa, texto, tema])
  const feitos = checklist.filter((c) => c.ok).length
  const textoFinal = montarTexto(partes)

  const atualizar = (v) => setPartes((p) => ({ ...p, [etapa.id]: v }))
  const inserir = (modelo) => {
    const atual = texto
    const sep = atual && !/\s$/.test(atual) ? ' ' : ''
    atualizar(atual + sep + modelo)
    setTimeout(() => areaRef.current?.focus(), 0)
  }
  const recomecar = () => {
    if (!confirm('Apagar todos os parágrafos e recomeçar?')) return
    setPartes({})
    setPasso(0)
  }
  const irParaEditor = () => {
    salvarRascunho({ texto: textoFinal, temaId: tema?.id || null, temaLivre: tema?.livre ? tema.titulo : null })
    navigate(tema?.id ? `/escrever/${tema.id}` : '/escrever')
  }
  const corrigir = async () => {
    setCorrigindo(true)
    try {
      const r = await corrigirRedacao({ texto: textoFinal, tema })
      await salvarCorrecao(r)
      navigate(`/correcao/${r.id}`)
    } catch (e) {
      console.error(e)
      setCorrigindo(false)
    }
  }

  return (
    <Container className="py-4 sm:py-10">
      <div className="mb-4 flex items-end justify-between gap-2 sm:mb-6 sm:gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-tinta-600 sm:text-sm"><Compass className="h-4 w-4" /> Redação guiada</p>
          <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900 sm:mt-1 sm:text-3xl">Parágrafo por parágrafo</h1>
        </div>
        <Botao variante="fantasma" tamanho="sm" icone={RotateCcw} onClick={recomecar}>Recomeçar</Botao>
      </div>

      <Cartao className="mb-4 flex flex-col gap-3 p-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tema</p>
          <p className={cx('mt-1 font-semibold', tema ? 'text-slate-900' : 'text-slate-500')}>{tema?.titulo || 'Escolha um tema para começar'}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Botao variante="secundario" tamanho="sm" icone={Library} onClick={() => setSeletor(true)}>{tema ? 'Trocar' : 'Escolher tema'}</Botao>
          <Botao variante="fantasma" tamanho="sm" icone={Shuffle} onClick={() => setTema(temaAleatorio())}>Sortear</Botao>
        </div>
      </Cartao>

      {/* STEPPER */}
      <ol className="mb-4 grid grid-cols-5 gap-1.5 sm:mb-6 sm:gap-2">
        {[...ETAPAS_GUIADA.map((e) => e.titulo), 'Revisão'].map((t, i) => {
          const completo = i < ETAPAS_GUIADA.length && contarPalavras(partes[ETAPAS_GUIADA[i].id] || '') >= ETAPAS_GUIADA[i].meta[0]
          return (
            <li key={t}>
              <button onClick={() => setPasso(i)} className={cx('w-full rounded-xl border px-2 py-2.5 text-left transition sm:px-3', i === passo ? 'border-tinta-300 bg-tinta-50 ring-2 ring-tinta-100' : 'border-slate-200 bg-white hover:bg-slate-50')}>
                <span className="flex items-center gap-1.5">
                  {completo ? <CircleCheck className="h-4 w-4 shrink-0 text-emerald-500" /> : <span className={cx('grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] font-bold', i === passo ? 'bg-tinta-600 text-white' : 'bg-slate-200 text-slate-600')}>{i + 1}</span>}
                  <span className={cx('hidden truncate text-xs font-semibold sm:block', i === passo ? 'text-tinta-800' : 'text-slate-600')}>{t}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      {!revisao ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            <Cartao className="overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-lg font-bold text-slate-900">{etapa.titulo}</h2>
                <p className="mt-1 text-sm text-slate-600">{etapa.objetivo}</p>
              </div>
              <textarea ref={areaRef} value={texto} onChange={(e) => atualizar(e.target.value)} aria-label={`Texto: ${etapa.titulo}`}
                placeholder={`Escreva aqui o parágrafo de ${etapa.titulo.toLowerCase()}…`}
                className="block min-h-[300px] w-full resize-y bg-papel px-6 py-5 font-serif text-[17px] leading-8 text-slate-800 outline-none placeholder:text-slate-400" />
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
                <span className="tabular-nums">{contarPalavras(texto)} palavras · ideal {etapa.meta[0]}–{etapa.meta[1]}</span>
                <span>{feitos}/{checklist.length} critérios atendidos</span>
              </div>
            </Cartao>
            <div className="mt-4 flex justify-between gap-3">
              <Botao variante="secundario" icone={ArrowLeft} onClick={() => setPasso((p) => Math.max(0, p - 1))} disabled={passo === 0}>Anterior</Botao>
              <Botao iconeDireita={ArrowRight} onClick={() => setPasso((p) => p + 1)}>{passo === ETAPAS_GUIADA.length - 1 ? 'Revisar redação' : 'Próximo parágrafo'}</Botao>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <Cartao className="p-5">
              <h3 className="text-sm font-semibold text-slate-900">Checklist em tempo real</h3>
              <ul className="mt-3 space-y-2">
                {checklist.map((c) => (
                  <li key={c.rotulo} className={cx('flex items-start gap-2 text-sm', c.ok ? 'text-slate-800' : 'text-slate-500')}>
                    {c.ok ? <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />}
                    <span>{c.rotulo}{c.trecho && <span className="ml-1 text-xs text-emerald-700">“{c.trecho}”</span>}</span>
                  </li>
                ))}
              </ul>
            </Cartao>
            <Cartao className="p-5">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900"><Lightbulb className="h-4 w-4 text-amber-500" /> Estrutura sugerida</h3>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-slate-600">
                {etapa.estrutura.map((s) => <li key={s}>{s}</li>)}
              </ol>
            </Cartao>
            <Cartao className="p-5">
              <h3 className="text-sm font-semibold text-slate-900">Frases para começar</h3>
              <p className="mt-0.5 text-xs text-slate-500">Clique para inserir e complete os espaços (___).</p>
              <div className="mt-3 space-y-2">
                {etapa.modelos.map((m) => (
                  <button key={m} onClick={() => inserir(m)} className="flex w-full items-start gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-left text-sm text-slate-700 transition hover:border-tinta-300 hover:bg-tinta-50">
                    <Plus className="mt-0.5 h-4 w-4 shrink-0 text-tinta-600" /> {m}
                  </button>
                ))}
              </div>
            </Cartao>
          </aside>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Cartao className="overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-900">Sua redação completa</h2>
              <p className="mt-1 text-sm text-slate-600">Leia o texto inteiro, ajuste o que precisar e envie para correção.</p>
            </div>
            <div className="bg-papel px-6 py-6 font-serif text-[17px] leading-8 text-slate-800">
              {textoFinal ? textoFinal.split('\n').map((p, i) => <p key={i} className="mb-4 indent-10">{p}</p>) : <p className="text-slate-400">Nenhum parágrafo escrito ainda.</p>}
            </div>
          </Cartao>
          <aside className="space-y-4">
            <Cartao className="p-5">
              <h3 className="text-sm font-semibold text-slate-900">Resumo</h3>
              <ul className="mt-3 space-y-2">
                {ETAPAS_GUIADA.map((e, i) => {
                  const n = contarPalavras(partes[e.id] || '')
                  return (
                    <li key={e.id}>
                      <button onClick={() => setPasso(i)} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                        <span className="flex items-center gap-2">{n >= e.meta[0] ? <CircleCheck className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-slate-300" />} {e.titulo}</span>
                        <Selo cor={n >= e.meta[0] ? 'verde' : 'slate'}>{n} pal.</Selo>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </Cartao>
            <Botao tamanho="lg" className="w-full" icone={Sparkles} onClick={corrigir} carregando={corrigindo} disabled={!textoFinal}>Corrigir agora</Botao>
            <Botao variante="secundario" className="w-full" icone={PenLine} onClick={irParaEditor} disabled={!textoFinal}>Abrir no editor</Botao>
            <Botao variante="fantasma" className="w-full" icone={ArrowLeft} onClick={() => setPasso(ETAPAS_GUIADA.length - 1)}>Voltar à conclusão</Botao>
          </aside>
        </div>
      )}

      <SeletorTema aberto={seletor} onFechar={() => setSeletor(false)} onEscolher={setTema} />
    </Container>
  )
}
