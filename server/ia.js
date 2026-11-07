// Código compartilhado pelas funções da Vercel (pasta /api): autenticação, limite diário e chamadas à IA.
//
// Provedores de IA (configure UM deles em Vercel → Settings → Environment Variables):
//   GEMINI_API_KEY     → Google Gemini, plano GRATUITO (chave em https://aistudio.google.com/apikey)
//   ANTHROPIC_API_KEY  → Claude (pago por uso)
// Opcionais: IA_PROVEDOR=gemini|claude · GEMINI_MODELO · TRANSCRICOES_POR_DIA (20) · CORRECOES_IA_POR_DIA (10)
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

export { Anthropic }

/** Erro com status HTTP e mensagem amigável para o aluno. */
export class ErroIA extends Error {
  constructor(status, mensagem) {
    super(mensagem)
    this.status = status
  }
}

export function provedorIA() {
  const escolhido = (process.env.IA_PROVEDOR || '').toLowerCase()
  if (escolhido === 'gemini' && process.env.GEMINI_API_KEY) return 'gemini'
  if (escolhido === 'claude' && process.env.ANTHROPIC_API_KEY) return 'claude'
  if (process.env.ANTHROPIC_API_KEY) return 'claude'
  if (process.env.GEMINI_API_KEY) return 'gemini'
  return null
}
export const iaConfigurada = () => !!provedorIA()

export function responder(res, status, corpo) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(corpo))
}

/** Valida o token do Supabase enviado pelo site. */
export async function autenticar(req) {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const chave = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  const auth = req.headers.authorization || ''
  if (!url || !chave) return { erro: [503, 'Contas não configuradas neste site.'] }
  if (!auth.startsWith('Bearer ')) return { erro: [401, 'Entre na sua conta (grátis) para usar os recursos com IA.'] }
  const supabase = createClient(url, chave, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await supabase.auth.getUser(auth.slice(7))
  if (error || !data?.user) return { erro: [401, 'Sua sessão expirou. Entre novamente.'] }
  return { supabase, user: data.user }
}

/** Limite diário por aluno (tabela public.transcricoes). Se a tabela ainda não existir, não bloqueia. */
export async function dentroDoLimite(supabase, tipo, limite) {
  const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count, error } = await supabase.from('transcricoes').select('id', { count: 'exact', head: true })
    .eq('tipo', tipo).gte('criado_em', desde)
  if (error) {
    console.warn('[limite] tabela transcricoes indisponível:', error.message)
    return true
  }
  return (count ?? 0) < limite
}

export async function registrarUso(supabase, user, tipo) {
  const { error } = await supabase.from('transcricoes').insert({ user_id: user.id, tipo })
  if (error) console.warn('[limite] não registrou uso:', error.message)
}

/** Traduz erros em respostas amigáveis. */
export function erroIA(res, error) {
  if (error instanceof ErroIA) return responder(res, error.status, { erro: error.message })
  if (error instanceof Anthropic.RateLimitError) return responder(res, 429, { erro: 'Muitos pedidos ao mesmo tempo. Tente em instantes.' })
  if (error instanceof Anthropic.AuthenticationError) return responder(res, 503, { erro: 'A chave da IA configurada no site é inválida.' })
  if (error instanceof Anthropic.BadRequestError) return responder(res, 400, { erro: 'A IA não conseguiu processar este conteúdo.' })
  if (error instanceof Anthropic.APIError) return responder(res, 502, { erro: `Serviço de IA indisponível (${error.status}). Tente novamente.` })
  if (error instanceof SyntaxError) return responder(res, 502, { erro: 'Resposta da IA fora do formato esperado. Tente novamente.' })
  console.error('[ia] falha inesperada:', error)
  return responder(res, 500, { erro: 'Falha inesperada. Tente novamente.' })
}

/** Lê o corpo JSON (a Vercel já entrega parseado; este fallback cobre outros ambientes). */
export async function lerCorpo(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') return JSON.parse(req.body)
  let bruto = ''
  for await (const parte of req) bruto += parte
  return bruto ? JSON.parse(bruto) : {}
}

// ================================================================== instruções
export const INSTRUCOES_TRANSCRICAO = `Você vai transcrever uma redação do ENEM escrita à mão. As imagens são as páginas, na ordem.

Regras:
- Transcreva exatamente o que o estudante escreveu. Não corrija ortografia, acentuação, gramática nem pontuação: os erros fazem parte da avaliação e precisam aparecer como estão.
- Transcreva apenas o texto da redação (as linhas numeradas). Ignore números de linha, cabeçalhos impressos da folha, campos de tema, nome e data, o título (se houver), a área "reservado ao corretor", notas escritas por corretores e palavras riscadas.
- Quando uma palavra for dividida no fim da linha com hífen, junte as duas partes numa palavra só.
- Separe cada parágrafo com uma linha em branco. Junte as linhas de um mesmo parágrafo em uma só.
- Se uma palavra estiver ilegível, escreva [ilegível] no lugar dela.
- Responda somente com o texto transcrito, sem comentários antes ou depois.`

export const NIVEIS = [0, 40, 80, 120, 160, 200]

export const SISTEMA_CORRECAO = `Você é um corretor experiente da redação do ENEM e avalia textos dissertativo-argumentativos pela matriz de referência oficial do INEP.

Cada competência vale 0, 40, 80, 120, 160 ou 200 pontos:
- C1 (norma-padrão): 200 = no máximo desvios excepcionais e sem reincidência, com boa estrutura sintática; 160 = poucos desvios; 120 = alguns desvios; 80 = muitos desvios; 40 = desvios sistemáticos.
- C2 (proposta, tipo textual e repertório): 200 = tema completo, repertório legitimado, pertinente e produtivo e excelente domínio do tipo dissertativo-argumentativo; 160 = repertório pertinente e bom domínio; 120 = argumentação previsível ou repertório pouco produtivo; 80 = estrutura incompleta ou cópia dos textos motivadores; 40 = tangencia o tema.
- C3 (argumentação): 200 = projeto de texto estratégico e argumentos consistentes, com autoria; 160 = organizado, com indícios de autoria; 120 = limitado ou previsível; 80 = desorganizado; 40 = pouco relacionado ao tema.
- C4 (coesão): 200 = conectivos variados entre e dentro dos parágrafos, sem repetições ou inadequações; 160 = poucas inadequações; 120 = regular; 80 = pontual; 40 = rara.
- C5 (proposta de intervenção): conte os elementos válidos (agente, ação, meio/modo, finalidade, detalhamento); 5 = 200, 4 = 160, 3 = 120, 2 = 80, 1 ou proposta vaga = 40; ausência = 0. Proposta que desrespeita os direitos humanos recebe 0.

Nota zero total quando houver fuga completa ao tema, texto que não é dissertativo-argumentativo, até 7 linhas, impropérios ou língua estrangeira.

Seja calibrado como os corretores oficiais: não infle notas e não seja punitivo sem motivo. Escreva os comentários em português, falando diretamente com o estudante, de forma concreta e construtiva.
Em "desvios", liste no máximo 15 problemas reais, copiando o "trecho" exatamente como aparece no texto do estudante (mesmas letras, acentos e pontuação), para que ele possa ser destacado.`

const FORMATO_JSON = `Responda somente com um objeto JSON neste formato exato:
{
  "notas": { "c1": 0, "c2": 0, "c3": 0, "c4": 0, "c5": 0 },
  "anulacao": "",
  "resumo": "avaliação geral em 2 a 3 frases",
  "comentarios": { "c1": "", "c2": "", "c3": "", "c4": "", "c5": "" },
  "melhorias": ["ação 1", "ação 2", "ação 3"],
  "desvios": [{ "trecho": "", "correcao": "", "explicacao": "", "competencia": 1 }]
}
As notas devem ser 0, 40, 80, 120, 160 ou 200. "anulacao" é o motivo da nota zero total, ou "" se não houver.`

const comp = (tipo) => Object.fromEntries(['c1', 'c2', 'c3', 'c4', 'c5'].map((k) => [k, tipo]))
export const ESQUEMA_CORRECAO = {
  type: 'object',
  additionalProperties: false,
  required: ['notas', 'anulacao', 'resumo', 'comentarios', 'melhorias', 'desvios'],
  properties: {
    notas: { type: 'object', additionalProperties: false, required: ['c1', 'c2', 'c3', 'c4', 'c5'], properties: comp({ type: 'integer', enum: NIVEIS }) },
    anulacao: { type: 'string' },
    resumo: { type: 'string' },
    comentarios: { type: 'object', additionalProperties: false, required: ['c1', 'c2', 'c3', 'c4', 'c5'], properties: comp({ type: 'string' }) },
    melhorias: { type: 'array', items: { type: 'string' } },
    desvios: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['trecho', 'correcao', 'explicacao', 'competencia'],
        properties: { trecho: { type: 'string' }, correcao: { type: 'string' }, explicacao: { type: 'string' }, competencia: { type: 'integer', enum: [1, 2, 3, 4, 5] } },
      },
    },
  },
}

/** Garante o formato esperado pelo site, mesmo que a IA erre algum detalhe. */
export function normalizarCorrecao(bruto) {
  const texto = typeof bruto === 'string' ? bruto.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, '') : null
  const r = texto !== null ? JSON.parse(texto.slice(texto.indexOf('{'), texto.lastIndexOf('}') + 1)) : bruto
  const nivel = (v) => Math.max(0, Math.min(200, Math.round(Number(v) / 40) * 40 || 0))
  const notas = Object.fromEntries(['c1', 'c2', 'c3', 'c4', 'c5'].map((k) => [k, nivel(r?.notas?.[k])]))
  if (!r?.notas || ['c1', 'c2', 'c3', 'c4', 'c5'].some((k) => r.notas[k] === undefined)) throw new SyntaxError('notas ausentes')
  const anulacao = typeof r.anulacao === 'string' ? r.anulacao.trim() : ''
  if (anulacao) for (const k of Object.keys(notas)) notas[k] = 0
  return {
    notas,
    anulacao,
    resumo: String(r.resumo || ''),
    comentarios: Object.fromEntries(['c1', 'c2', 'c3', 'c4', 'c5'].map((k) => [k, String(r.comentarios?.[k] || '')])),
    melhorias: Array.isArray(r.melhorias) ? r.melhorias.map(String).slice(0, 6) : [],
    desvios: (Array.isArray(r.desvios) ? r.desvios : []).slice(0, 15).map((d) => ({
      trecho: String(d?.trecho || ''), correcao: String(d?.correcao || ''), explicacao: String(d?.explicacao || ''),
      competencia: [1, 2, 3, 4, 5].includes(Number(d?.competencia)) ? Number(d.competencia) : 1,
    })).filter((d) => d.trecho),
    total: Object.values(notas).reduce((a, b) => a + b, 0),
  }
}

// ================================================================== Gemini (grátis)
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

export function modelosGemini() {
  const lista = [process.env.GEMINI_MODELO, 'gemini-flash-latest', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash-lite']
  return [...new Set(lista.filter(Boolean))]
}

/**
 * Chama o Gemini tentando vários modelos: cada modelo tem a própria cota gratuita,
 * então, se um esgotar (429) ou não existir (404), o próximo é usado.
 */
export async function chamarGemini({ partes, sistema, json = false }) {
  const chave = process.env.GEMINI_API_KEY
  let ultimo = null
  for (const modelo of modelosGemini()) {
    for (const comJson of json ? [true, false] : [false]) {
      const corpo = {
        contents: [{ role: 'user', parts: partes }],
        generationConfig: { maxOutputTokens: 16384, ...(comJson ? { responseMimeType: 'application/json' } : {}) },
      }
      if (sistema) corpo.systemInstruction = { parts: [{ text: sistema }] }
      let r
      try {
        r = await fetch(`${GEMINI_URL}/${modelo}:generateContent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': chave },
          body: JSON.stringify(corpo),
          signal: AbortSignal.timeout(50000),
        })
      } catch (e) {
        ultimo = new ErroIA(504, 'A IA demorou demais para responder. Tente novamente.')
        break
      }
      if (r.ok) {
        const dados = await r.json()
        const candidato = dados.candidates?.[0]
        if (!candidato) {
          if (dados.promptFeedback?.blockReason) throw new ErroIA(422, 'A IA não pôde processar este conteúdo.')
          ultimo = new ErroIA(502, 'A IA não retornou resposta.')
          break
        }
        const texto = (candidato.content?.parts || []).filter((p) => p.text && !p.thought).map((p) => p.text).join('').trim()
        if (texto) return { texto, modelo }
        ultimo = new ErroIA(502, 'A IA retornou uma resposta vazia.')
        break
      }
      const detalhe = await r.text().catch(() => '')
      if (r.status === 401 || r.status === 403) throw new ErroIA(503, 'A chave do Gemini configurada no site é inválida.')
      if (r.status === 400 && comJson && /mime|json/i.test(detalhe)) continue // tenta o mesmo modelo sem o modo JSON
      if (r.status === 400) throw new ErroIA(400, 'A IA não conseguiu processar este conteúdo.')
      console.warn(`[gemini] ${modelo} respondeu ${r.status}; tentando o próximo modelo`)
      ultimo = r.status === 429
        ? new ErroIA(429, 'A cota gratuita de IA do site acabou por hoje. Tente amanhã ou digite o texto.')
        : new ErroIA(502, `Serviço de IA indisponível (${r.status}). Tente novamente.`)
      break
    }
  }
  throw ultimo || new ErroIA(502, 'Serviço de IA indisponível.')
}

// ================================================================== Claude (pago)
let clienteClaude = null
const claude = () => (clienteClaude ||= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }))
export const MODELO_CLAUDE = 'claude-opus-5-5'

const textoClaude = (resposta) => resposta.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim()

// ================================================================== operações
/** Transcreve fotos de redação. imagens: [{ media_type, data(base64) }] */
export async function transcreverImagens(imagens) {
  if (provedorIA() === 'gemini') {
    const partes = [...imagens.map((i) => ({ inlineData: { mimeType: i.media_type, data: i.data } })), { text: INSTRUCOES_TRANSCRICAO }]
    const { texto, modelo } = await chamarGemini({ partes })
    return { texto, provedor: 'gemini', modelo }
  }
  const resposta = await claude().beta.messages.create({
    model: MODELO_CLAUDE,
    max_tokens: 16000,
    output_config: { effort: 'medium' },
    // Se o modelo recusar por engano, o próprio servidor tenta de novo num modelo de reserva.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    messages: [{
      role: 'user',
      content: [
        ...imagens.map((i) => ({ type: 'image', source: { type: 'base64', media_type: i.media_type, data: i.data } })),
        { type: 'text', text: INSTRUCOES_TRANSCRICAO },
      ],
    }],
  })
  if (resposta.stop_reason === 'refusal') throw new ErroIA(422, 'Não foi possível ler esta foto. Tente outra.')
  return { texto: textoClaude(resposta), provedor: 'claude', modelo: MODELO_CLAUDE }
}

/** Corrige a redação como um corretor do ENEM e devolve o resultado normalizado. */
export async function corrigirTexto(texto, tema) {
  const pedido = `Tema proposto: ${tema || '(não informado — avalie estrutura e argumentação sem julgar aderência ao tema)'}\n\nRedação do estudante:\n<redacao>\n${texto}\n</redacao>`
  if (provedorIA() === 'gemini') {
    const { texto: bruto, modelo } = await chamarGemini({ partes: [{ text: `${pedido}\n\n${FORMATO_JSON}` }], sistema: SISTEMA_CORRECAO, json: true })
    return { ...normalizarCorrecao(bruto), provedor: 'gemini', modelo }
  }
  const resposta = await claude().beta.messages.create({
    model: MODELO_CLAUDE,
    max_tokens: 16000,
    system: SISTEMA_CORRECAO,
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: ESQUEMA_CORRECAO } },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    messages: [{ role: 'user', content: pedido }],
  })
  if (resposta.stop_reason === 'refusal') throw new ErroIA(422, 'Não foi possível corrigir este texto com IA.')
  if (resposta.stop_reason === 'max_tokens') throw new ErroIA(502, 'A resposta da IA ficou incompleta. Tente novamente.')
  return { ...normalizarCorrecao(textoClaude(resposta)), provedor: 'claude', modelo: MODELO_CLAUDE }
}
