import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, PenLine, Compass, Camera, Lightbulb, BookMarked, ExternalLink, Tags } from 'lucide-react'
import { Botao, Selo, cx } from './ui.jsx'
import { eixoDe } from '../lib/eixos.js'
import { NIVEIS_APOSTA } from '../data/apostas.js'
import { lerRascunho, salvarRascunho } from '../lib/armazenamento.js'
import { normalizar } from '../engine/texto.js'

/** Rótulo legível de um grupo do recorte: usa as palavras completas do título que correspondem aos termos. */
function rotuloGrupo(titulo, grupo) {
  const termos = grupo.split('|').map((t) => t.trim())
  const palavras = titulo.split(/s+/).map((w) => w.replace(/[^p{L}-]/gu, '')).filter(Boolean)
  const tituloNorm = normalizar(titulo)
  const achadas = []
  for (const t of termos) {
    const tn = normalizar(t)
    if (tn.includes(' ')) { if (tituloNorm.includes(tn) && !achadas.includes(t)) achadas.push(t); continue }
    for (const w of palavras) {
      const wl = w.toLowerCase()
      if (normalizar(w).startsWith(tn) && w.length > 3 && !achadas.some((x) => x.includes(wl))) achadas.push(wl)
    }
  }
  if (achadas.length) return achadas.slice(0, 3).join(' / ')
  const inteiras = termos.filter((t) => t.includes(' ') || /[aeiouãõrsmlz]$/i.test(t))
  return (inteiras.length ? inteiras : termos).slice(0, 2).join(' / ')
}

/** Folha de detalhes do tema (sobe de baixo no celular, modal no desktop). */
export default function TemaSheet({ tema, onFechar }) {
  const navigate = useNavigate()
  useEffect(() => {
    if (!tema) return undefined
    document.body.style.overflow = 'hidden'
    const esc = (e) => e.key === 'Escape' && onFechar()
    window.addEventListener('keydown', esc)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', esc)
    }
  }, [tema, onFechar])
  if (!tema) return null

  const ex = eixoDe(tema.eixo)
  const Icone = ex.icone
  const ir = (destino) => {
    const atual = lerRascunho() || {}
    salvarRascunho({ ...atual, texto: atual.texto || '', temaId: tema.id || null, temaLivre: tema.id ? null : tema.titulo })
    navigate(destino)
  }
  const rotaEscrever = tema.id ? `/escrever/${tema.id}` : '/escrever'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={tema.titulo}
      onMouseDown={(e) => e.target === e.currentTarget && onFechar()}>
      <div className="flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl animate-subir">
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />
        <div className="flex items-start gap-3 px-5 pb-3 pt-4">
          <div className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-xl', ex.cor)}><Icone className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {tema.aposta && <Selo cor={NIVEIS_APOSTA[tema.nivel].cor}>Aposta {tema.nivel.toLowerCase()}</Selo>}
              {tema.origem === 'ENEM' && <Selo cor="tinta">ENEM {tema.ano}</Selo>}
              {tema.origem === 'Inédito' && <Selo>Inédito</Selo>}
              {tema.livre && <Selo>Tema livre</Selo>}
              <span className="text-xs text-slate-500">{tema.eixo}</span>
            </div>
            <h2 className="mt-1.5 text-lg font-bold leading-snug text-slate-900">{tema.titulo}</h2>
          </div>
          <button onClick={onFechar} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Fechar"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 pb-4">
          {tema.grupos?.length > 0 && (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400"><Tags className="h-3.5 w-3.5" /> Recorte do tema</p>
              <p className="mb-2 text-xs text-slate-500">Para não tangenciar, discuta todos estes eixos:</p>
              <div className="flex flex-wrap gap-1.5">
                {tema.grupos.map((g, i) => (
                  <span key={g} className={cx('rounded-lg px-2.5 py-1 text-xs font-semibold', i === 0 ? 'bg-tinta-600 text-white' : 'bg-tinta-50 text-tinta-700')}>
                    {rotuloGrupo(tema.titulo, g)}
                  </span>
                ))}
              </div>
            </div>
          )}
          {tema.porque && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400"><Lightbulb className="h-3.5 w-3.5" /> Por que pode cair</p>
              <ul className="space-y-2">
                {tema.porque.map((p) => <li key={p} className="rounded-xl bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-700">{p}</li>)}
              </ul>
            </div>
          )}
          {tema.repertorios && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400"><BookMarked className="h-3.5 w-3.5" /> Repertórios que combinam</p>
              <div className="flex flex-wrap gap-1.5">
                {tema.repertorios.map((r) => <span key={r} className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">{r}</span>)}
              </div>
            </div>
          )}
          {tema.fontes && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Fontes</p>
              <ul className="space-y-1">
                {tema.fontes.map((f) => (
                  <li key={f.url}><a href={f.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1 text-xs text-tinta-700 hover:underline"><ExternalLink className="mt-0.5 h-3 w-3 shrink-0" /> {f.nome}</a></li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-slate-100 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Botao className="col-span-3" icone={PenLine} onClick={() => ir(rotaEscrever)}>Escrever sobre este tema</Botao>
          <Botao variante="secundario" tamanho="sm" className="col-span-1" icone={Camera} onClick={() => ir(`${rotaEscrever}?foto=1`)}>Foto</Botao>
          <Botao variante="secundario" tamanho="sm" className="col-span-2" icone={Compass} onClick={() => ir(tema.id ? `/guiada?tema=${tema.id}` : '/guiada')}>Redação guiada</Botao>
        </div>
      </div>
    </div>
  )
}
