import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Dices, ChevronRight, X, Sparkles, Telescope, CalendarClock, Library, ChevronDown, Info } from 'lucide-react'
import { Botao, Cartao, Container, Selo, cx } from '../components/ui.jsx'
import TemaSheet from '../components/TemaSheet.jsx'
import { TEMAS, EIXOS, TODOS_TEMAS, temasPorPalavra, gerarTemaLivre } from '../data/temas.js'
import { APOSTAS, ANALISE, NIVEIS_APOSTA, diasParaProva } from '../data/apostas.js'
import { eixoDe } from '../lib/eixos.js'
import { normalizar } from '../engine/texto.js'

// ---------------------------------------------------------------- linha de tema
function Linha({ tema, onAbrir, destaque }) {
  const ex = eixoDe(tema.eixo)
  const Icone = ex.icone
  return (
    <button onClick={() => onAbrir(tema)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50 active:bg-slate-100">
      {destaque ?? <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-xl', ex.cor)}><Icone className="h-5 w-5" /></span>}
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-[15px] font-medium leading-snug text-slate-900">{tema.titulo}</span>
        <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
          {tema.aposta && <Selo cor={NIVEIS_APOSTA[tema.nivel].cor} className="!px-2 !py-0 text-[10px]">{tema.nivel}</Selo>}
          {tema.origem === 'ENEM' && !destaque && <Selo cor="tinta" className="!px-2 !py-0 text-[10px]">ENEM {tema.ano}</Selo>}
          <span>{tema.eixo}</span>
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
    </button>
  )
}

// ---------------------------------------------------------------- sorteador animado
const MODOS = [
  { id: 'apostas', rotulo: 'Apostas 2026', icone: Telescope },
  { id: 'todos', rotulo: 'Qualquer tema', icone: Library },
  { id: 'chave', rotulo: 'Palavra-chave', icone: Search },
]

function Sorteador({ onAbrir }) {
  const [modo, setModo] = useState('apostas')
  const [chave, setChave] = useState('')
  const [rolando, setRolando] = useState(false)
  const [visor, setVisor] = useState(null)
  const [final, setFinal] = useState(null)
  const [aviso, setAviso] = useState('')
  const timers = useRef([])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const sortear = () => {
    setAviso('')
    let pool = modo === 'apostas' ? APOSTAS : TODOS_TEMAS
    let resultado
    if (modo === 'chave') {
      if (chave.trim().length < 3) return setAviso('Digite uma palavra-chave com pelo menos 3 letras (ex.: internet, saúde, racismo).')
      pool = temasPorPalavra(chave)
      if (!pool.length) {
        resultado = gerarTemaLivre(chave)
        pool = [resultado]
        setAviso(`Nenhum tema do banco fala de “${chave.trim()}” — criamos um tema livre no formato do ENEM.`)
      }
    }
    resultado = resultado || pool[Math.floor(Math.random() * pool.length)]
    const giro = pool.length > 1 ? pool : TODOS_TEMAS
    setFinal(null)
    setRolando(true)
    timers.current.forEach(clearTimeout)
    const atrasos = [40, 45, 50, 55, 60, 70, 80, 95, 110, 130, 160, 200, 250]
    let t = 0
    timers.current = atrasos.map((d) => {
      t += d
      return setTimeout(() => setVisor(giro[Math.floor(Math.random() * giro.length)]), t)
    })
    timers.current.push(setTimeout(() => {
      setVisor(resultado)
      setFinal(resultado)
      setRolando(false)
    }, t + 260))
  }

  return (
    <Cartao className="overflow-hidden">
      <div className="bg-gradient-to-br from-tinta-600 to-tinta-800 p-5 text-white">
        <div className="flex items-center gap-2">
          <Dices className={cx('h-5 w-5', rolando && 'animate-spin')} />
          <h2 className="font-bold">Sortear um tema</h2>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-white/10 p-1">
          {MODOS.map((m) => (
            <button key={m.id} onClick={() => { setModo(m.id); setAviso('') }}
              className={cx('flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-semibold transition sm:flex-row sm:justify-center sm:text-xs', modo === m.id ? 'bg-white text-tinta-700 shadow' : 'text-white/80 hover:bg-white/10')}>
              <m.icone className="h-4 w-4" /> {m.rotulo}
            </button>
          ))}
        </div>
        {modo === 'chave' && (
          <form className="mt-3" onSubmit={(e) => { e.preventDefault(); sortear() }}>
            <input value={chave} onChange={(e) => setChave(e.target.value)} placeholder="Ex.: internet, idosos, meio ambiente…" aria-label="Palavra-chave"
              className="h-11 w-full rounded-xl border-0 bg-white/95 px-4 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:ring-4 focus:ring-white/30" />
          </form>
        )}
        <div className={cx('mt-4 flex min-h-[76px] items-center rounded-2xl px-4 py-3 transition-all duration-300', final ? 'bg-white ring-4 ring-amber-300/70 scale-[1.02]' : 'bg-white/10')} aria-live="polite">
          {visor ? (
            <p key={visor.titulo + (final ? 'f' : '')} className={cx('font-semibold leading-snug', final ? 'text-[15px] text-slate-900 animate-surgir' : 'text-sm text-white/90')}>{visor.titulo}</p>
          ) : (
            <p className="text-sm text-white/70">{modo === 'apostas' ? 'Sorteie entre os temas com mais chance de cair em 2026.' : modo === 'chave' ? 'Digite um assunto e sorteie um tema sobre ele.' : 'Sorteie entre todos os temas do banco.'}</p>
          )}
        </div>
        {aviso && <p className="mt-2 text-xs text-amber-100">{aviso}</p>}
        <div className="mt-4 flex gap-2">
          <Botao variante="claro" className="flex-1" icone={Dices} onClick={sortear} disabled={rolando}>{final ? 'Sortear de novo' : 'Sortear'}</Botao>
          {final && <Botao className="flex-1 bg-amber-400 text-slate-900 hover:bg-amber-300 shadow-none" iconeDireita={ChevronRight} onClick={() => onAbrir(final)}>Usar tema</Botao>}
        </div>
      </div>
    </Cartao>
  )
}

// ---------------------------------------------------------------- abas
function AbaApostas({ onAbrir }) {
  const [metodo, setMetodo] = useState(false)
  const dias = diasParaProva()
  return (
    <div className="space-y-4">
      {dias !== null && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <CalendarClock className="h-6 w-6 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-900">
            {dias === 0 ? <><b>A redação do ENEM 2026 é hoje!</b> Boa prova!</> : dias === 1 ? <><b>A redação do ENEM 2026 é amanhã (8/11).</b> Revise as apostas e treine uma redação hoje.</> : <><b>Faltam {dias} dias</b> para a redação do ENEM 2026 (8/11).</>}
          </p>
        </div>
      )}
      <div className="rounded-2xl border border-slate-200 bg-white">
        <button onClick={() => setMetodo((m) => !m)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left" aria-expanded={metodo}>
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Info className="h-4 w-4 text-tinta-600" /> Como chegamos a estas apostas</span>
          <ChevronDown className={cx('h-4 w-4 text-slate-400 transition', metodo && 'rotate-180')} />
        </button>
        {metodo && (
          <div className="space-y-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600 animate-surgir">
            <p>{ANALISE.metodo}</p>
            <ul className="list-disc space-y-1.5 pl-5">{ANALISE.padroes.map((p) => <li key={p}>{p}</li>)}</ul>
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(NIVEIS_APOSTA).map(([n, v]) => <span key={n} className="flex items-center gap-1.5"><Selo cor={v.cor}>{n}</Selo> {v.descricao}</span>)}
            </div>
            <p className="text-xs text-slate-400">Atualizado em {ANALISE.atualizadoEm}. O tema real é sigiloso até a prova; use as apostas para treinar, não para decorar textos prontos.</p>
          </div>
        )}
      </div>
      {['Forte', 'Boa', 'Possível'].map((nivel) => (
        <section key={nivel}>
          <h3 className="mb-2 flex items-center gap-2 px-1 text-sm font-bold text-slate-700">
            <Selo cor={NIVEIS_APOSTA[nivel].cor}>{nivel}</Selo> {nivel === 'Forte' ? 'Mais prováveis' : nivel === 'Boa' ? 'Boas apostas' : 'Também podem cair'}
          </h3>
          <Cartao className="divide-y divide-slate-100 overflow-hidden">
            {APOSTAS.filter((t) => t.nivel === nivel).map((t) => <Linha key={t.id} tema={t} onAbrir={onAbrir} />)}
          </Cartao>
        </section>
      ))}
    </div>
  )
}

function AbaEnem({ onAbrir }) {
  const lista = TEMAS.filter((t) => t.origem === 'ENEM').sort((a, b) => b.ano - a.ano)
  return (
    <Cartao className="divide-y divide-slate-100 overflow-hidden">
      {lista.map((t) => (
        <Linha key={t.id} tema={t} onAbrir={onAbrir}
          destaque={<span className="grid h-10 w-12 shrink-0 place-items-center rounded-xl bg-tinta-50 text-sm font-black tabular-nums text-tinta-700">{t.ano}</span>} />
      ))}
    </Cartao>
  )
}

function AbaAssuntos({ onAbrir }) {
  const [abertos, setAbertos] = useState({ [EIXOS[0]]: true })
  return (
    <div className="space-y-3">
      {EIXOS.map((eixo) => {
        const lista = TEMAS.filter((t) => t.eixo === eixo && t.origem !== 'ENEM')
        const ex = eixoDe(eixo)
        const aberto = !!abertos[eixo]
        return (
          <Cartao key={eixo} className="overflow-hidden">
            <button onClick={() => setAbertos((a) => ({ ...a, [eixo]: !a[eixo] }))} className="flex w-full items-center gap-3 px-4 py-3.5 text-left" aria-expanded={aberto}>
              <span className={cx('grid h-10 w-10 place-items-center rounded-xl', ex.cor)}><ex.icone className="h-5 w-5" /></span>
              <span className="flex-1">
                <span className="block font-semibold text-slate-900">{eixo}</span>
                <span className="text-xs text-slate-500">{lista.length} temas inéditos</span>
              </span>
              <ChevronDown className={cx('h-5 w-5 text-slate-400 transition', aberto && 'rotate-180')} />
            </button>
            {aberto && (
              <div className="divide-y divide-slate-100 border-t border-slate-100 animate-surgir">
                {lista.map((t) => <Linha key={t.id} tema={t} onAbrir={onAbrir} destaque={<span className="h-2 w-2 shrink-0 rounded-full bg-slate-300" />} />)}
              </div>
            )}
          </Cartao>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------- página
const ABAS = [
  { id: 'apostas', rotulo: 'Apostas 2026', icone: Sparkles },
  { id: 'enem', rotulo: 'ENEM oficiais', icone: CalendarClock },
  { id: 'assuntos', rotulo: 'Por assunto', icone: Library },
]

export default function Temas() {
  const [params, setParams] = useSearchParams()
  const aba = ABAS.some((a) => a.id === params.get('aba')) ? params.get('aba') : 'apostas'
  const [busca, setBusca] = useState('')
  const [temaAberto, setTemaAberto] = useState(null)

  const resultados = useMemo(() => {
    const q = normalizar(busca.trim())
    if (q.length < 2) return null
    return TODOS_TEMAS.filter((t) => normalizar(`${t.titulo} ${t.ano || ''} ${t.eixo}`).includes(q))
  }, [busca])

  return (
    <Container className="max-w-3xl py-6 sm:py-10">
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Temas de redação</h1>
        <p className="mt-1 text-sm text-slate-600">{TODOS_TEMAS.length} temas: apostas para 2026, todas as provas do ENEM e inéditos por assunto.</p>
      </div>

      <Sorteador onAbrir={setTemaAberto} />

      <div className="sticky top-16 z-20 -mx-4 mt-6 bg-slate-50/95 px-4 pb-3 pt-2 backdrop-blur sm:mx-0 sm:px-0">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar tema ou ano…" aria-label="Buscar tema"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm shadow-sm outline-none transition focus:border-tinta-400 focus:ring-4 focus:ring-tinta-100" />
          {busca && <button onClick={() => setBusca('')} className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100" aria-label="Limpar busca"><X className="h-4 w-4" /></button>}
        </div>
        {!resultados && (
          <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm" role="tablist">
            {ABAS.map((a) => (
              <button key={a.id} role="tab" aria-selected={aba === a.id} onClick={() => setParams({ aba: a.id }, { replace: true })}
                className={cx('flex items-center justify-center gap-1.5 rounded-lg px-1 py-2 text-xs font-semibold transition sm:text-sm', aba === a.id ? 'bg-tinta-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100')}>
                <a.icone className="hidden h-4 w-4 sm:block" /> {a.rotulo}
              </button>
            ))}
          </div>
        )}
      </div>

      <div key={resultados ? 'busca' : aba} className="animate-surgir">
        {resultados ? (
          resultados.length ? (
            <Cartao className="divide-y divide-slate-100 overflow-hidden">
              {resultados.map((t) => <Linha key={t.id} tema={t} onAbrir={setTemaAberto} />)}
            </Cartao>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
              <p className="font-semibold text-slate-800">Nenhum tema encontrado</p>
              <p className="mt-1 text-sm text-slate-500">Que tal criar um tema sobre “{busca}”?</p>
              <Botao className="mt-4" tamanho="sm" icone={Sparkles} onClick={() => setTemaAberto(gerarTemaLivre(busca))}>Criar tema com “{busca.trim()}”</Botao>
            </div>
          )
        ) : aba === 'apostas' ? <AbaApostas onAbrir={setTemaAberto} /> : aba === 'enem' ? <AbaEnem onAbrir={setTemaAberto} /> : <AbaAssuntos onAbrir={setTemaAberto} />}
      </div>

      <TemaSheet tema={temaAberto} onFechar={() => setTemaAberto(null)} />
    </Container>
  )
}
