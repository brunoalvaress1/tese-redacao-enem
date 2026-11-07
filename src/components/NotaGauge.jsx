import { useEffect, useState } from 'react'
import { corNota } from '../lib/competencias.js'

/** Medidor circular da nota total (0–1000) com animação de contagem. */
export default function NotaGauge({ total, tamanho = 180, animar = true, rotulo = true }) {
  const [valor, setValor] = useState(animar ? 0 : total)
  useEffect(() => {
    if (!animar) {
      setValor(total)
      return undefined
    }
    let raf
    const inicio = performance.now()
    const dur = 900
    const passo = (t) => {
      const p = Math.min(1, (t - inicio) / dur)
      setValor(Math.round(total * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(passo)
    }
    raf = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(raf)
  }, [total, animar])

  const cor = corNota(total)
  const r = 42
  const c = 2 * Math.PI * r
  const arco = c * 0.75
  const preenchido = arco * (valor / 1000)
  return (
    <div className="relative" style={{ width: tamanho, height: tamanho }} role="img" aria-label={`Nota ${total} de 1000`}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-[225deg]">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${arco} ${c}`} />
        <circle cx="50" cy="50" r={r} fill="none" stroke={cor.hex} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${preenchido} ${c}`} style={{ transition: 'stroke .3s' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold tabular-nums tracking-tight text-slate-900" style={{ fontSize: tamanho * 0.22 }}>{valor}</span>
        <span className="text-xs font-medium text-slate-400">de 1000</span>
        {rotulo && <span className={`mt-1 text-xs font-bold ${cor.texto}`}>{cor.rotulo}</span>}
      </div>
    </div>
  )
}
