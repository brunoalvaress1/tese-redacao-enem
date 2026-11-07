// Código compartilhado pelas funções da Vercel (pasta /api): autenticação, limite diário e chamadas ao Claude.
// Variáveis de ambiente (Vercel → Settings → Environment Variables):
//   ANTHROPIC_API_KEY  (obrigatória para os recursos com IA)
//   VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (já usadas pelo site)
//   TRANSCRICOES_POR_DIA (opcional, padrão 20) · CORRECOES_IA_POR_DIA (opcional, padrão 10)
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

export { Anthropic }
export const MODELO = 'claude-opus-5-5'
export const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null
export const iaConfigurada = () => !!anthropic

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

/** Traduz erros da API da Anthropic em respostas amigáveis. */
export function erroIA(res, error) {
  if (error instanceof Anthropic.RateLimitError) return responder(res, 429, { erro: 'Muitos pedidos ao mesmo tempo. Tente em instantes.' })
  if (error instanceof Anthropic.AuthenticationError) return responder(res, 503, { erro: 'A chave da IA configurada no site é inválida.' })
  if (error instanceof Anthropic.BadRequestError) return responder(res, 400, { erro: 'A IA não conseguiu processar este conteúdo.' })
  if (error instanceof Anthropic.APIError) return responder(res, 502, { erro: `Serviço de IA indisponível (${error.status}). Tente novamente.` })
  if (error instanceof SyntaxError) return responder(res, 502, { erro: 'Resposta da IA fora do formato esperado. Tente novamente.' })
  console.error('[ia] falha inesperada:', error)
  return responder(res, 500, { erro: 'Falha inesperada. Tente novamente.' })
}

export function textoDaResposta(resposta) {
  return resposta.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim()
}

// ------------------------------------------------------------------ transcrição
export const INSTRUCOES_TRANSCRICAO = `Você vai transcrever uma redação do ENEM escrita à mão. As imagens são as páginas, na ordem.

Regras:
- Transcreva exatamente o que o estudante escreveu. Não corrija ortografia, acentuação, gramática nem pontuação: os erros fazem parte da avaliação e precisam aparecer como estão.
- Transcreva apenas o texto da redação (as linhas numeradas). Ignore números de linha, cabeçalhos impressos da folha, campos de tema, nome e data, o título (se houver), a área "reservado ao corretor", notas escritas por corretores e palavras riscadas.
- Quando uma palavra for dividida no fim da linha com hífen, junte as duas partes numa palavra só.
- Separe cada parágrafo com uma linha em branco. Junte as linhas de um mesmo parágrafo em uma só.
- Se uma palavra estiver ilegível, escreva [ilegível] no lugar dela.
- Responda somente com o texto transcrito, sem comentários antes ou depois.`

// ------------------------------------------------------------------ correção
const NIVEIS = [0, 40, 80, 120, 160, 200]
export { NIVEIS }

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

const comp = (tipo) => Object.fromEntries(['c1', 'c2', 'c3', 'c4', 'c5'].map((k) => [k, tipo]))
export const ESQUEMA_CORRECAO = {
  type: 'object',
  additionalProperties: false,
  required: ['notas', 'anulacao', 'resumo', 'comentarios', 'melhorias', 'desvios'],
  properties: {
    notas: { type: 'object', additionalProperties: false, required: ['c1', 'c2', 'c3', 'c4', 'c5'], properties: comp({ type: 'integer', enum: NIVEIS }) },
    anulacao: { type: 'string', description: 'Motivo da nota zero total, ou string vazia se não houver.' },
    resumo: { type: 'string', description: 'Avaliação geral em 2 a 3 frases.' },
    comentarios: { type: 'object', additionalProperties: false, required: ['c1', 'c2', 'c3', 'c4', 'c5'], properties: comp({ type: 'string' }) },
    melhorias: { type: 'array', items: { type: 'string' }, description: 'As 3 a 5 ações mais importantes para subir a nota.' },
    desvios: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['trecho', 'correcao', 'explicacao', 'competencia'],
        properties: {
          trecho: { type: 'string' },
          correcao: { type: 'string' },
          explicacao: { type: 'string' },
          competencia: { type: 'integer', enum: [1, 2, 3, 4, 5] },
        },
      },
    },
  },
}

/** Lê o corpo JSON (a Vercel já entrega parseado; este fallback cobre outros ambientes). */
export async function lerCorpo(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') return JSON.parse(req.body)
  let bruto = ''
  for await (const parte of req) bruto += parte
  return bruto ? JSON.parse(bruto) : {}
}
