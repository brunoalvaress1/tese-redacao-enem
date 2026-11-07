// POST /api/corrigir-redacao-ia — "segunda opinião": correção com IA (Gemini grátis ou Claude) seguindo a matriz do ENEM.
import { iaConfigurada, corrigirTexto, responder, autenticar, dentroDoLimite, registrarUso, erroIA, lerCorpo } from '../server/ia.js'

const LIMITE = Number(process.env.CORRECOES_IA_POR_DIA || 10)

export default async function handler(req, res) {
  if (req.method !== 'POST') return responder(res, 405, { erro: 'Método não permitido.' })
  if (!iaConfigurada()) return responder(res, 503, { erro: 'A correção com IA ainda não foi ativada neste site.' })

  const sessao = await autenticar(req)
  if (sessao.erro) return responder(res, sessao.erro[0], { erro: sessao.erro[1] })
  if (!(await dentroDoLimite(sessao.supabase, 'correcao', LIMITE))) {
    return responder(res, 429, { erro: `Você atingiu o limite de ${LIMITE} correções com IA hoje. A correção automática continua liberada.` })
  }

  let corpo
  try {
    corpo = await lerCorpo(req)
  } catch {
    return responder(res, 400, { erro: 'Requisição inválida.' })
  }
  const texto = String(corpo?.texto || '').trim()
  const tema = String(corpo?.tema || '').trim().slice(0, 300)
  if (texto.length < 30 || texto.length > 12000) return responder(res, 400, { erro: 'Envie uma redação entre 30 e 12.000 caracteres.' })

  try {
    const resultado = await corrigirTexto(texto, tema)
    await registrarUso(sessao.supabase, sessao.user, 'correcao')
    return responder(res, 200, resultado)
  } catch (error) {
    return erroIA(res, error)
  }
}
