// POST /api/transcrever-redacao — lê a foto de uma redação manuscrita com IA (Gemini grátis ou Claude).
import {
  iaConfigurada, transcreverImagens, responder, autenticar, dentroDoLimite, registrarUso, erroIA, lerCorpo,
} from '../server/ia.js'

const TIPOS = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_IMAGENS = 3
const MAX_BASE64 = 2_500_000 // o site já envia JPEG reduzido (~0,3–0,8 MB)
const LIMITE = Number(process.env.TRANSCRICOES_POR_DIA || 20)

export default async function handler(req, res) {
  if (req.method !== 'POST') return responder(res, 405, { erro: 'Método não permitido.' })
  if (!iaConfigurada()) return responder(res, 503, { erro: 'A leitura com IA ainda não foi ativada neste site.' })

  const sessao = await autenticar(req)
  if (sessao.erro) return responder(res, sessao.erro[0], { erro: sessao.erro[1] })
  if (!(await dentroDoLimite(sessao.supabase, 'foto', LIMITE))) {
    return responder(res, 429, { erro: `Você atingiu o limite de ${LIMITE} leituras com IA hoje. Amanhã libera de novo.` })
  }

  let corpo
  try {
    corpo = await lerCorpo(req)
  } catch {
    return responder(res, 400, { erro: 'Requisição inválida.' })
  }
  const imagens = Array.isArray(corpo?.imagens) ? corpo.imagens : []
  if (!imagens.length || imagens.length > MAX_IMAGENS) return responder(res, 400, { erro: `Envie de 1 a ${MAX_IMAGENS} fotos.` })
  for (const img of imagens) {
    if (!TIPOS.has(img?.media_type) || typeof img?.data !== 'string' || img.data.length > MAX_BASE64) {
      return responder(res, 400, { erro: 'Foto inválida ou grande demais.' })
    }
  }

  try {
    const { texto, provedor } = await transcreverImagens(imagens)
    if (!texto) return responder(res, 422, { erro: 'Nenhum texto foi encontrado na foto.' })
    await registrarUso(sessao.supabase, sessao.user, 'foto')
    return responder(res, 200, { texto, provedor })
  } catch (error) {
    return erroIA(res, error)
  }
}
