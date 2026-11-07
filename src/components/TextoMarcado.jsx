import { useMemo } from 'react'
import { paragrafos } from '../engine/texto.js'
import { COMP } from '../lib/competencias.js'
import { cx } from './ui.jsx'

const PRIORIDADE = { erro: 0, info: 1, acerto: 2 }
const ROTULOS_C5 = { agente: 'agente', acao: 'ação', meio: 'meio', finalidade: 'finalidade', detalhamento: 'detalhe' }

/** Resolve sobreposições: erros têm prioridade sobre destaques positivos. */
function resolver(marcas) {
  const ordenadas = [...marcas].sort((a, b) => PRIORIDADE[a.natureza] - PRIORIDADE[b.natureza] || a.inicio - b.inicio)
  const aceitas = []
  for (const m of ordenadas) {
    if (!aceitas.some((o) => m.inicio < o.fim && o.inicio < m.fim)) aceitas.push(m)
  }
  return aceitas.sort((a, b) => a.inicio - b.inicio)
}

function classeMarca(m, selecionada) {
  const c = COMP[`c${m.competencia}`]
  const base = 'rounded-[3px] px-[1px] cursor-pointer transition-shadow underline underline-offset-[5px] decoration-2'
  const estilo = m.natureza === 'erro' ? 'decoration-wavy' : m.natureza === 'info' ? 'decoration-dotted' : ''
  return cx(base, estilo, c.marca, selecionada && `ring-2 ${c.anel} ring-offset-1 shadow-sm`)
}

export default function TextoMarcado({ texto, marcas, selecionada, onSelecionar }) {
  const aceitas = useMemo(() => resolver(marcas), [marcas])
  const pars = useMemo(() => paragrafos(texto), [texto])

  return (
    <div className="font-serif text-[17px] leading-[2.05rem] text-slate-800">
      {pars.map((p, i) => {
        const dentro = aceitas.filter((m) => m.inicio < p.fim && m.fim > p.inicio)
        const partes = []
        let cursor = p.inicio
        for (const m of dentro) {
          const ini = Math.max(m.inicio, p.inicio)
          const fim = Math.min(m.fim, p.fim)
          if (ini > cursor) partes.push(texto.slice(cursor, ini))
          if (ini < cursor) continue
          partes.push(
            <mark key={m.id} className={classeMarca(m, selecionada === m.id)} onClick={() => onSelecionar?.(m.id)}
              title={m.msg} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelecionar?.(m.id)}
              data-marca={m.id}>
              {texto.slice(ini, fim)}
              {m.competencia === 5 && ROTULOS_C5[m.tipo] && (
                <sup className="ml-0.5 select-none font-sans text-[9px] font-bold uppercase tracking-wide text-emerald-700">{ROTULOS_C5[m.tipo]}</sup>
              )}
            </mark>,
          )
          cursor = fim
        }
        if (cursor < p.fim) partes.push(texto.slice(cursor, p.fim))
        return <p key={i} className="mb-4 indent-10 last:mb-0">{partes}</p>
      })}
    </div>
  )
}
