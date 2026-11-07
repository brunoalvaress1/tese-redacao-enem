import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X, Shuffle, PenLine } from 'lucide-react'
import { TODOS_TEMAS, EIXOS, temaAleatorio } from '../data/temas.js'
import { normalizar } from '../engine/texto.js'
import { Botao, Selo, cx } from './ui.jsx'

/** Modal para escolher um tema do banco ou digitar um tema livre. */
export default function SeletorTema({ aberto, onFechar, onEscolher }) {
  const [busca, setBusca] = useState('')
  const [eixo, setEixo] = useState('')
  const [livre, setLivre] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!aberto) return undefined
    // no celular, não abre o teclado sozinho (ele cobriria metade do modal)
    const t = setTimeout(() => { if (!window.matchMedia('(pointer: coarse)').matches) inputRef.current?.focus() }, 50)
    const esc = (e) => e.key === 'Escape' && onFechar()
    window.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', esc)
      document.body.style.overflow = ''
    }
  }, [aberto, onFechar])

  const lista = useMemo(() => {
    const q = normalizar(busca.trim())
    return TODOS_TEMAS.filter((t) => (!eixo || t.eixo === eixo) && (!q || normalizar(`${t.titulo} ${t.ano || ''} ${t.eixo} ${t.aposta ? 'aposta 2026' : ''}`).includes(q)))
  }, [busca, eixo])

  if (!aberto) return null
  const escolher = (t) => {
    onEscolher(t)
    onFechar()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onFechar()} role="dialog" aria-modal="true" aria-label="Escolher tema">
      <div className="flex max-h-tela-90 w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl animate-surgir">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-4">
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">Escolha um tema</h2>
          <span className="flex-1" />
          <Botao tamanho="sm" variante="fantasma" icone={Shuffle} onClick={() => escolher(temaAleatorio())} className="px-2.5">Sortear</Botao>
          <button onClick={onFechar} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Fechar"><X className="h-5 w-5" /></button>
        </div>
        <div className="shrink-0 space-y-2.5 border-b border-slate-100 px-4 py-3 sm:space-y-3 sm:px-5 sm:py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input ref={inputRef} value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar tema ou ano (ex.: 2023, internet)…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-tinta-400 focus:bg-white focus:ring-4 focus:ring-tinta-100" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {['', ...EIXOS].map((e) => (
              <button key={e || 'todos'} onClick={() => setEixo(e)}
                className={cx('shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition', eixo === e ? 'bg-tinta-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                {e || 'Todos'}
              </button>
            ))}
          </div>
        </div>
        <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto">
          {lista.map((t) => (
            <li key={t.id}>
              <button onClick={() => escolher(t)} className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-tinta-50/60 active:bg-tinta-50 sm:px-5 sm:py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{t.titulo}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{t.eixo}</p>
                </div>
                {t.origem === 'ENEM' ? <Selo cor="tinta">ENEM {t.ano}</Selo> : t.aposta ? <Selo cor="ambar">Aposta 2026</Selo> : <Selo>Inédito</Selo>}
              </button>
            </li>
          ))}
          {!lista.length && <li className="px-5 py-10 text-center text-sm text-slate-500">Nenhum tema encontrado. Use um tema livre abaixo.</li>}
        </ul>
        <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 sm:py-4">
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (livre.trim().length > 5) escolher({ id: null, titulo: livre.trim(), livre: true }) }}>
            <input value={livre} onChange={(e) => setLivre(e.target.value)} placeholder="Ou digite seu próprio tema…"
              className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-tinta-400 focus:ring-4 focus:ring-tinta-100" />
            <Botao type="submit" tamanho="sm" variante="secundario" icone={PenLine} disabled={livre.trim().length <= 5} className="h-10 shrink-0">Usar</Botao>
          </form>
        </div>
      </div>
    </div>
  )
}
