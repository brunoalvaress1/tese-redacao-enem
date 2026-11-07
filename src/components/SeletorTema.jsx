import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, X, Shuffle, PenLine } from 'lucide-react'
import { TEMAS, EIXOS, temaAleatorio } from '../data/temas.js'
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
    const t = setTimeout(() => inputRef.current?.focus(), 50)
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
    return TEMAS.filter((t) => (!eixo || t.eixo === eixo) && (!q || normalizar(`${t.titulo} ${t.ano || ''} ${t.eixo}`).includes(q)))
  }, [busca, eixo])

  if (!aberto) return null
  const escolher = (t) => {
    onEscolher(t)
    onFechar()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onFechar()} role="dialog" aria-modal="true" aria-label="Escolher tema">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl animate-surgir">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">Escolha um tema</h2>
          <button onClick={onFechar} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Fechar"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3 border-b border-slate-100 px-5 py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input ref={inputRef} value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por palavra-chave ou ano (ex.: 2023, internet, saúde)…"
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-tinta-400 focus:bg-white focus:ring-4 focus:ring-tinta-100" />
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
              <button onClick={() => escolher(t)} className="flex w-full items-start gap-3 px-5 py-3.5 text-left transition hover:bg-tinta-50/60">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{t.titulo}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{t.eixo}</p>
                </div>
                {t.origem === 'ENEM' ? <Selo cor="tinta">ENEM {t.ano}</Selo> : <Selo>Inédito</Selo>}
              </button>
            </li>
          ))}
          {!lista.length && <li className="px-5 py-10 text-center text-sm text-slate-500">Nenhum tema encontrado. Use um tema livre abaixo.</li>}
        </ul>
        <div className="space-y-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
          <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); if (livre.trim().length > 5) escolher({ id: null, titulo: livre.trim(), livre: true }) }}>
            <input value={livre} onChange={(e) => setLivre(e.target.value)} placeholder="Ou digite um tema livre…"
              className="h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-tinta-400 focus:ring-4 focus:ring-tinta-100" />
            <Botao type="submit" tamanho="sm" variante="secundario" icone={PenLine} disabled={livre.trim().length <= 5}>Usar tema livre</Botao>
          </form>
          <Botao tamanho="sm" variante="fantasma" icone={Shuffle} onClick={() => escolher(temaAleatorio())}>Sortear um tema</Botao>
        </div>
      </div>
    </div>
  )
}
