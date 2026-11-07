// "Segunda opinião": correção da redação com IA (Edge Function corrigir-redacao-ia no Supabase).
import { supabase } from './supabase.js'

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
  if (!supabase) throw new Error('A correção com IA precisa do Supabase configurado.')
  const { data: sessao } = await supabase.auth.getSession()
  if (!sessao.session) throw new Error('Entre na sua conta para usar a correção com IA.')
  const { data, error } = await supabase.functions.invoke('corrigir-redacao-ia', { body: { texto, tema: tema?.titulo || '' } })
  if (error) {
    let msg = 'A correção com IA não está disponível agora.'
    try {
      const corpo = await error.context?.json?.()
      if (corpo?.erro) msg = corpo.erro
    } catch { /* resposta sem corpo JSON */ }
    if (error.name === 'FunctionsFetchError' || /Failed to send/i.test(error.message)) msg = 'A função de correção com IA ainda não foi publicada no Supabase.'
    throw new Error(msg)
  }
  return { ...data, marcas: marcasDaIA(texto, data.desvios), criadoEm: new Date().toISOString() }
}
