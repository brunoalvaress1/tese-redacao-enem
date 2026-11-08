import { useState } from 'react'
import { Target, MapPin, Lightbulb, ArrowRight, ChevronDown, CircleCheck, Ban, ListChecks, Sparkles, Globe } from 'lucide-react'
import { Cartao, Selo, cx } from './ui.jsx'
import { COMP } from '../lib/competencias.js'

function SeloComp({ c }) {
  if (!c) return null
  const k = `c${c}`
  return <span className={cx('rounded-md px-1.5 py-0.5 text-[10px] font-bold', COMP[k].bg, COMP[k].texto)}>C{c}</span>
}

function Exemplo({ texto }) {
  if (!texto) return null
  return <p className="mt-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs leading-relaxed text-emerald-900"><b className="font-semibold">Exemplo:</b> {texto}</p>
}

/** Cartão "Como subir sua nota": as ações que mais rendem pontos. */
export function Prioridades({ diag, total }) {
  if (!diag) return null
  const { prioridades, ganhoPossivel } = diag
  return (
    <Cartao className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-tinta-50 to-white px-4 py-3 sm:px-5 sm:py-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-tinta-600 text-white"><Target className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-slate-900">Como subir sua nota</h2>
          <p className="text-xs text-slate-500">{prioridades.length ? 'As mudanças que mais rendem pontos, em ordem' : 'Nenhum ponto de melhoria nos critérios avaliados'}</p>
        </div>
        {ganhoPossivel > 0 && <Selo cor="verde" className="shrink-0">até +{ganhoPossivel}</Selo>}
      </div>
      {prioridades.length ? (
        <ol className="divide-y divide-slate-100">
          {prioridades.map((p, i) => (
            <li key={i} className="flex gap-3 px-4 py-3.5 sm:px-5">
              <span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold', p.competencia ? 'bg-slate-900 text-white' : 'bg-rose-100 text-rose-700')}>
                {p.competencia ? i + 1 : <Ban className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <SeloComp c={p.competencia} />
                  {p.ganho && <span className="text-[11px] font-bold text-emerald-700">até +{p.ganho} pontos</span>}
                  {p.onde && <span className="flex items-center gap-0.5 text-[11px] text-slate-500"><MapPin className="h-3 w-3" /> {p.onde}</span>}
                </div>
                <p className="mt-1 text-sm font-semibold leading-snug text-slate-900">{p.titulo}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{p.detalhe}</p>
                <Exemplo texto={p.exemplo} />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="flex items-center gap-2 px-5 py-4 text-sm text-emerald-700"><CircleCheck className="h-4 w-4" /> {total >= 1000 ? 'Parabéns! Sua redação atingiu a nota máxima.' : 'Continue praticando para consolidar o resultado.'}</p>
      )}
    </Cartao>
  )
}

function ItemErro({ e, onIrParaMarca }) {
  return (
    <li>
      <button onClick={() => e.marcaId && onIrParaMarca?.(e.marcaId)} className="flex w-full gap-2.5 rounded-xl px-2 py-2 text-left transition hover:bg-rose-50/60 active:bg-rose-50">
        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-rose-100 text-[11px] font-bold text-rose-600">✗</span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5 text-sm">
            <SeloComp c={e.competencia} />
            <span className="text-xs font-semibold text-slate-500">{e.titulo}</span>
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5 text-sm">
            <span className="font-medium text-rose-700 line-through decoration-rose-300">{e.trecho}</span>
            {e.correcao && <><ArrowRight className="h-3 w-3 text-slate-400" /><span className="font-semibold text-emerald-700">{e.correcao}</span></>}
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{e.detalhe}</span>
        </span>
      </button>
    </li>
  )
}

function ItemMelhoria({ m }) {
  return (
    <li className="flex gap-2.5 px-2 py-2">
      <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5"><SeloComp c={m.competencia} /><p className="text-sm font-semibold text-slate-800">{m.titulo}</p></div>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{m.detalhe}</p>
        <Exemplo texto={m.exemplo} />
      </div>
    </li>
  )
}

/** Erros e melhorias organizados por parágrafo (sanfona) + itens do texto todo. */
export function ErrosPorParagrafo({ diag, onIrParaMarca }) {
  const primeiroComItens = diag?.porParagrafo.find((p) => p.erros.length || p.melhorias.length)?.indice
  const [abertos, setAbertos] = useState(() => new Set(primeiroComItens != null ? [primeiroComItens] : []))
  if (!diag) return null
  const totalErros = diag.porParagrafo.reduce((s, p) => s + p.erros.length, 0) + diag.gerais.filter((g) => g.tipo === 'erro').length
  const totalMelhorias = diag.porParagrafo.reduce((s, p) => s + p.melhorias.length, 0) + diag.gerais.filter((g) => g.tipo === 'melhoria').length
  const alternar = (i) => setAbertos((a) => {
    const n = new Set(a)
    if (n.has(i)) n.delete(i)
    else n.add(i)
    return n
  })

  return (
    <Cartao className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-4">
        <ListChecks className="h-5 w-5 text-tinta-600" />
        <h2 className="flex-1 font-semibold text-slate-900">Erros e melhorias por parágrafo</h2>
        <Selo cor={totalErros ? 'rosa' : 'verde'}>{totalErros} erro{totalErros === 1 ? '' : 's'}</Selo>
        <Selo cor={totalMelhorias ? 'ambar' : 'verde'}>{totalMelhorias} melhoria{totalMelhorias === 1 ? '' : 's'}</Selo>
      </div>
      <ul className="divide-y divide-slate-100">
        {diag.porParagrafo.map((p) => {
          const aberto = abertos.has(p.indice)
          const vazio = !p.erros.length && !p.melhorias.length
          return (
            <li key={p.indice}>
              <button onClick={() => !vazio && alternar(p.indice)} aria-expanded={aberto} className={cx('flex w-full items-start gap-3 px-4 py-3 text-left sm:px-5', !vazio && 'hover:bg-slate-50')}>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900">{p.rotulo}</span>
                  <span className="mt-0.5 block truncate text-xs text-slate-500">“{p.inicio}…”</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5 pt-0.5">
                  {vazio ? <span className="flex items-center gap-1 text-xs font-medium text-emerald-600"><CircleCheck className="h-4 w-4" /> Tudo certo</span> : (
                    <>
                      {p.erros.length > 0 && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">{p.erros.length} ✗</span>}
                      {p.melhorias.length > 0 && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">{p.melhorias.length} 💡</span>}
                      <ChevronDown className={cx('h-4 w-4 text-slate-400 transition', aberto && 'rotate-180')} />
                    </>
                  )}
                </span>
              </button>
              {aberto && !vazio && (
                <div className="space-y-1 px-2 pb-3 sm:px-3 animate-surgir">
                  {p.erros.length > 0 && <ul>{p.erros.map((e, j) => <ItemErro key={`e${j}`} e={e} onIrParaMarca={onIrParaMarca} />)}</ul>}
                  {p.melhorias.length > 0 && <ul>{p.melhorias.map((m, j) => <ItemMelhoria key={`m${j}`} m={m} />)}</ul>}
                </div>
              )}
            </li>
          )
        })}
      </ul>
      {diag.gerais.length > 0 && (
        <div className="border-t border-slate-100 px-2 pb-3 pt-3 sm:px-3">
          <p className="mb-1 flex items-center gap-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400"><Globe className="h-3.5 w-3.5" /> No texto todo</p>
          <ul>{diag.gerais.map((g, j) => (g.tipo === 'erro' ? <ItemErro key={j} e={g} onIrParaMarca={onIrParaMarca} /> : <ItemMelhoria key={j} m={g} />))}</ul>
        </div>
      )}
      {totalErros + totalMelhorias === 0 && (
        <p className="flex items-center gap-2 px-5 py-4 text-sm text-emerald-700"><Sparkles className="h-4 w-4" /> Nenhum erro ou ponto de melhoria encontrado nos critérios avaliados.</p>
      )}
    </Cartao>
  )
}
