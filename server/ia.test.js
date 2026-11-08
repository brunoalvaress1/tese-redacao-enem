import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { provedorIA, transcreverImagens, corrigirTexto, normalizarCorrecao, modelosGemini, ErroIA } from './ia.js'

const resposta = (status, corpo) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => corpo,
  text: async () => (typeof corpo === 'string' ? corpo : JSON.stringify(corpo)),
})
const geminiOk = (...partes) => resposta(200, { candidates: [{ content: { parts: partes } }] })

beforeEach(() => {
  vi.stubEnv('ANTHROPIC_API_KEY', '')
  vi.stubEnv('GEMINI_API_KEY', '')
  vi.stubEnv('IA_PROVEDOR', '')
  vi.stubEnv('GEMINI_MODELO', '')
})
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('escolha do provedor de IA', () => {
  it('sem chaves → nenhum; só Gemini → gemini; ambos → claude; IA_PROVEDOR força', () => {
    expect(provedorIA()).toBeNull()
    vi.stubEnv('GEMINI_API_KEY', 'g-123')
    expect(provedorIA()).toBe('gemini')
    vi.stubEnv('ANTHROPIC_API_KEY', 'sk-ant-x')
    expect(provedorIA()).toBe('claude')
    vi.stubEnv('IA_PROVEDOR', 'gemini')
    expect(provedorIA()).toBe('gemini')
  })
})

describe('Gemini (grátis)', () => {
  beforeEach(() => vi.stubEnv('GEMINI_API_KEY', 'g-123'))

  it('transcreve: envia a imagem, troca de modelo quando a cota esgota e ignora o "pensamento"', async () => {
    const chamadas = []
    vi.stubGlobal('fetch', vi.fn(async (url, opcoes) => {
      chamadas.push({ url, opcoes })
      if (chamadas.length === 1) return resposta(429, 'quota exceeded')
      return geminiOk({ text: 'pensando…', thought: true }, { text: 'A Constituição Federal de 1988 assegura…' })
    }))
    const r = await transcreverImagens([{ media_type: 'image/jpeg', data: 'QUJD' }])
    expect(r.texto).toBe('A Constituição Federal de 1988 assegura…')
    expect(r.provedor).toBe('gemini')
    expect(r.modelo).toBe(modelosGemini()[1])
    expect(chamadas[0].url).toContain(`${modelosGemini()[0]}:generateContent`)
    expect(chamadas[0].opcoes.headers['x-goog-api-key']).toBe('g-123')
    const corpo = JSON.parse(chamadas[1].opcoes.body)
    expect(corpo.contents[0].parts[0].inlineData).toEqual({ mimeType: 'image/jpeg', data: 'QUJD' })
  })

  it('corrige: aceita JSON com cercas de código e normaliza notas para múltiplos de 40', async () => {
    const json = '```json\n' + JSON.stringify({
      notas: { c1: 170, c2: 200, c3: 150, c4: 160, c5: 999 },
      anulacao: '', resumo: 'Bom texto.', comentarios: { c1: 'ok', c2: 'ok', c3: 'ok', c4: 'ok', c5: 'ok' },
      melhorias: ['a', 'b'], desvios: [{ trecho: 'têm', correcao: 'tem', explicacao: 'concordância', competencia: 9 }],
    }) + '\n```'
    vi.stubGlobal('fetch', vi.fn(async () => geminiOk({ text: json })))
    const r = await corrigirTexto('A redação do estudante com mais de trinta caracteres.', 'Tema')
    expect(r.notas).toEqual({ c1: 160, c2: 200, c3: 160, c4: 160, c5: 200 })
    expect(r.total).toBe(880)
    expect(r.desvios[0].competencia).toBe(1)
  })

  it('se o modo JSON não for aceito (400), repete o pedido sem ele', async () => {
    const corpos = []
    vi.stubGlobal('fetch', vi.fn(async (url, op) => {
      corpos.push(JSON.parse(op.body))
      if (corpos.length === 1) return resposta(400, 'responseMimeType is not supported')
      return geminiOk({ text: JSON.stringify({ notas: { c1: 200, c2: 200, c3: 200, c4: 200, c5: 200 }, anulacao: '', resumo: '', comentarios: {}, melhorias: [], desvios: [] }) })
    }))
    const r = await corrigirTexto('Texto com tamanho suficiente para a correção.', '')
    expect(r.total).toBe(1000)
    expect(corpos[0].generationConfig.responseMimeType).toBe('application/json')
    expect(corpos[1].generationConfig.responseMimeType).toBeUndefined()
  })

  it('chave inválida vira mensagem amigável; cota esgotada em todos os modelos vira 429', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => resposta(403, 'PERMISSION_DENIED')))
    await expect(transcreverImagens([{ media_type: 'image/png', data: 'x' }])).rejects.toMatchObject({ status: 503 })
    vi.stubGlobal('fetch', vi.fn(async () => resposta(429, 'quota')))
    const erro = await transcreverImagens([{ media_type: 'image/png', data: 'x' }]).catch((e) => e)
    expect(erro).toBeInstanceOf(ErroIA)
    expect(erro.status).toBe(429)
  })
})

describe('normalizarCorrecao', () => {
  it('anulação zera todas as notas', () => {
    const r = normalizarCorrecao({ notas: { c1: 200, c2: 200, c3: 200, c4: 200, c5: 200 }, anulacao: 'Fuga ao tema', desvios: [] })
    expect(r.total).toBe(0)
  })
  it('rejeita resposta sem notas', () => {
    expect(() => normalizarCorrecao('{"resumo":"x"}')).toThrow()
  })
})

describe('leitura do tema na foto', async () => {
  const { lerTranscricao } = await import('./ia.js')
  it('separa tema e texto quando a IA devolve JSON (com ou sem cercas)', () => {
    expect(lerTranscricao('```json\n{"tema":"Os impactos das redes sociais","texto":"A Constituição..."}\n```'))
      .toMatchObject({ tema: 'Os impactos das redes sociais', texto: 'A Constituição...' })
  })
  it('se a IA não devolver JSON, usa tudo como texto e deixa o tema vazio', () => {
    expect(lerTranscricao('A Constituição Federal de 1988...')).toMatchObject({ tema: '', texto: 'A Constituição Federal de 1988...', linhas: null })
  })
})

describe('linhas lidas na foto', async () => {
  const { lerTranscricao } = await import('./ia.js')
  it('lê o número de linhas usadas e descarta valores absurdos', () => {
    expect(lerTranscricao('{"tema":"T","texto":"abc","linhas":30}').linhas).toBe(30)
    expect(lerTranscricao('{"tema":"T","texto":"abc","linhas":"28"}').linhas).toBe(28)
    expect(lerTranscricao('{"tema":"T","texto":"abc","linhas":500}').linhas).toBeNull()
    expect(lerTranscricao('texto sem json').linhas).toBeNull()
  })
})
