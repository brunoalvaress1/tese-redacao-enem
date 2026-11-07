// "Segunda opinião": correção da redação com IA (Edge Function corrigir-redacao-ia no Supabase).
import { supabase } from './supabase.js'
import { chamarIA, iaAtivaNoSite } from './ocr.js'

/** Converte os desvios apontados pela IA em marcações no texto (localiza o trecho exato). */
export function marcasDaIA(texto, desvios = []) {
  const marcas = []
  const usados = []
  for (const [i, d] of desvios.entries()) {
    const trecho = (d.trecho || '').trim()
    if (trecho.length < 2) continue
    let pos = texto.indexOf(trecho)
    while (pos !== -1 && usados.some(([a, b]) => pos < b && a < pos + trecho.length)) pos = texto.indexOf(trecho, pos + 1)
    if (pos === -1) continue
    usados.push([pos, pos + trecho.length])
    marcas.push({
      id: `ia-${i}-${pos}`, inicio: pos, fim: pos + trecho.length, trecho, competencia: d.competencia || 1,
      natureza: 'erro', tipo: 'apontado pela IA', msg: d.explicacao, sugestoes: d.correcao ? [d.correcao] : [], fonte: 'ia',
    })
  }
  return marcas
}

export async function corrigirComIA({ texto, tema }) {
  if (!supabase) throw new Error('A correção com IA precisa das contas (Supabase) configuradas.')
  if (!(await iaAtivaNoSite())) throw new Error('A correção com IA ainda não foi ativada neste site.')
  const data = await chamarIA('corrigir-redacao-ia', { texto, tema: tema?.titulo || '' })
  return { ...data, marcas: marcasDaIA(texto, data.desvios), criadoEm: new Date().toISOString() }
}
