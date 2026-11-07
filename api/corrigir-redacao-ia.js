// POST /api/corrigir-redacao-ia — "segunda opinião": correção com o Claude seguindo a matriz do ENEM.
import {
  anthropic, MODELO, SISTEMA_CORRECAO, ESQUEMA_CORRECAO, NIVEIS, responder, autenticar, dentroDoLimite, registrarUso,
  erroIA, textoDaResposta, lerCorpo,
} from '../server/ia.js'

const LIMITE = Number(process.env.CORRECOES_IA_POR_DIA || 10)

export default async function handler(req, res) {
  if (req.method !== 'POST') return responder(res, 405, { erro: 'Método não permitido.' })
  if (!anthropic) return responder(res, 503, { erro: 'A correção com IA ainda não foi ativada neste site.' })

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
    const resposta = await anthropic.beta.messages.create({
      model: MODELO,
      max_tokens: 16000,
      system: SISTEMA_CORRECAO,
      output_config: { effort: 'medium', format: { type: 'json_schema', schema: ESQUEMA_CORRECAO } },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      messages: [{
        role: 'user',
        content: `Tema proposto: ${tema || '(não informado — avalie estrutura e argumentação sem julgar aderência ao tema)'}\n\nRedação do estudante:\n<redacao>\n${texto}\n</redacao>`,
      }],
    })
    if (resposta.stop_reason === 'refusal') return responder(res, 422, { erro: 'Não foi possível corrigir este texto com IA.' })
    if (resposta.stop_reason === 'max_tokens') return responder(res, 502, { erro: 'A resposta da IA ficou incompleta. Tente novamente.' })

    const resultado = JSON.parse(textoDaResposta(resposta))
    for (const k of ['c1', 'c2', 'c3', 'c4', 'c5']) {
      if (!NIVEIS.includes(resultado?.notas?.[k])) return responder(res, 502, { erro: 'Resposta da IA fora do formato esperado.' })
    }
    if (resultado.anulacao) for (const k of Object.keys(resultado.notas)) resultado.notas[k] = 0
    resultado.total = Object.values(resultado.notas).reduce((a, b) => a + b, 0)

    await registrarUso(sessao.supabase, sessao.user, 'correcao')
    return responder(res, 200, resultado)
  } catch (error) {
    return erroIA(res, error)
  }
}
