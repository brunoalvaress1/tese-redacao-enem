// Leitura de redação a partir de foto.
// 1) IA (Edge Function do Supabase com Claude) — alta precisão para letra cursiva, exige login.
// 2) Tesseract.js no navegador — gratuito e sem servidor, melhor para letra de forma legível.
import { supabase } from './supabase.js'

export const MAX_FOTOS = 3
export const TAMANHO_MAX_ARQUIVO = 15 * 1024 * 1024

async function carregar(file) {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}

function desenhar(img, maxLado) {
  const escala = Math.min(1, maxLado / Math.max(img.naturalWidth, img.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.naturalWidth * escala)
  canvas.height = Math.round(img.naturalHeight * escala)
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return { canvas, ctx }
}

/** Escala de cinza + realce de contraste (ajuda o OCR a separar tinta das pautas). */
export async function prepararParaOcr(file) {
  const img = await carregar(file)
  const { canvas, ctx } = desenhar(img, 2400)
  const dados = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const px = dados.data
  const hist = new Uint32Array(256)
  for (let i = 0; i < px.length; i += 4) {
    const y = Math.round(0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2])
    px[i] = y
    hist[y]++
  }
  // corta 1% mais escuro e 1% mais claro e estica o contraste
  const total = px.length / 4
  let acc = 0
  let lo = 0
  let hi = 255
  for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc > total * 0.01) { lo = v; break } }
  acc = 0
  for (let v = 255; v >= 0; v--) { acc += hist[v]; if (acc > total * 0.01) { hi = v; break } }
  const faixa = Math.max(1, hi - lo)
  for (let i = 0; i < px.length; i += 4) {
    let y = ((px[i] - lo) / faixa) * 255
    y = y > 200 ? 255 : y // clareia pautas e fundo
    y = Math.max(0, Math.min(255, y))
    px[i] = px[i + 1] = px[i + 2] = y
  }
  ctx.putImageData(dados, 0, 0)
  return canvas
}

/** JPEG reduzido em base64 para envio à IA. */
export async function comprimirParaEnvio(file) {
  const img = await carregar(file)
  const { canvas } = desenhar(img, 1800)
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
  return { media_type: 'image/jpeg', data: dataUrl.split(',')[1] }
}

/** Organiza o texto vindo do OCR: remove números de linha, junta hifenização e reconstrói parágrafos. */
export function limparTranscricao(bruto) {
  if (!bruto) return ''
  let t = bruto.replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ')
  // números de linha da folha (1 a 30) no início da linha
  t = t.replace(/^[ \t]*(?:[1-9]|[12]\d|30)[ \t]*[|.):\-–]?[ \t]+(?=\S)/gm, '')
  // linhas que só têm números/símbolos
  t = t.split('\n').filter((l) => !/^[\s\d|.,;:_\-–—=*~'"`´]*$/.test(l) || !l.trim()).join('\n')
  // palavra hifenizada no fim da linha
  t = t.replace(/(\p{L})-\n[ \t]*(\p{Ll})/gu, '$1$2')

  let paragrafos
  if (/\n[ \t]*\n/.test(t)) {
    paragrafos = t.split(/\n[ \t]*\n+/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
  } else {
    const linhas = t.split('\n').map((l) => l.trim()).filter(Boolean)
    const tamanhos = linhas.map((l) => l.length).sort((a, b) => a - b)
    const mediana = tamanhos[Math.floor(tamanhos.length / 2)] || 60
    paragrafos = []
    let atual = []
    linhas.forEach((l, i) => {
      atual.push(l)
      const prox = linhas[i + 1]
      const fimDeFrase = /[.!?:"”]$/.test(l)
      const linhaCurta = l.length < mediana * 0.72
      if (prox && fimDeFrase && linhaCurta && /^[\p{Lu}"“]/u.test(prox)) {
        paragrafos.push(atual.join(' '))
        atual = []
      }
    })
    if (atual.length) paragrafos.push(atual.join(' '))
  }
  return paragrafos
    .map((p) => p.replace(/\s+([,.;:!?])/g, '$1').replace(/\s{2,}/g, ' ').trim())
    .filter((p) => p.length > 1)
    .join('\n')
}

/** Indica se a leitura com IA está disponível (Supabase configurado + usuário logado). */
export async function iaDisponivel() {
  if (!supabase) return false
  const { data } = await supabase.auth.getSession()
  return !!data.session
}

async function transcreverComIA(arquivos, aoProgredir) {
  aoProgredir?.({ etapa: 'Preparando as fotos…', progresso: 0.1 })
  const imagens = []
  for (const f of arquivos) imagens.push(await comprimirParaEnvio(f))
  aoProgredir?.({ etapa: 'Lendo a redação com IA…', progresso: 0.35 })
  const { data, error } = await supabase.functions.invoke('transcrever-redacao', { body: { imagens } })
  if (error) throw new Error(error.message || 'Falha na leitura com IA')
  if (!data?.texto) throw new Error(data?.erro || 'A IA não retornou texto')
  aoProgredir?.({ etapa: 'Concluído', progresso: 1 })
  return { texto: limparTranscricao(data.texto), fonte: 'ia', confianca: null }
}

async function transcreverComTesseract(arquivos, aoProgredir) {
  const { createWorker } = await import('tesseract.js')
  const n = arquivos.length
  let atual = 0
  aoProgredir?.({ etapa: 'Baixando o leitor de português (só na primeira vez)…', progresso: 0.02 })
  const worker = await createWorker('por', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        aoProgredir?.({ etapa: n > 1 ? `Lendo a foto ${atual + 1} de ${n}…` : 'Lendo a redação…', progresso: 0.15 + 0.85 * ((atual + m.progress) / n) })
      } else if (m.status && m.progress != null && atual === 0) {
        aoProgredir?.({ etapa: 'Preparando o leitor…', progresso: Math.min(0.15, 0.02 + m.progress * 0.13) })
      }
    },
  })
  try {
    await worker.setParameters({ preserve_interword_spaces: '1' })
    const textos = []
    const confs = []
    for (atual = 0; atual < n; atual++) {
      const canvas = await prepararParaOcr(arquivos[atual])
      const { data } = await worker.recognize(canvas)
      textos.push(data.text)
      confs.push(data.confidence)
    }
    const confianca = Math.round(confs.reduce((a, b) => a + b, 0) / confs.length)
    return { texto: limparTranscricao(textos.join('\n\n')), fonte: 'navegador', confianca }
  } finally {
    await worker.terminate()
  }
}

/**
 * Transcreve as fotos. Tenta a IA quando disponível; se falhar, usa o leitor do navegador.
 * @returns {Promise<{texto: string, fonte: 'ia'|'navegador', confianca: number|null, aviso?: string}>}
 */
export async function transcreverFotos(arquivos, { aoProgredir, usarIA = true } = {}) {
  if (usarIA && (await iaDisponivel())) {
    try {
      return await transcreverComIA(arquivos, aoProgredir)
    } catch (e) {
      console.warn('[OCR] IA indisponível, usando o leitor do navegador:', e.message)
      const r = await transcreverComTesseract(arquivos, aoProgredir)
      return { ...r, aviso: 'A leitura com IA não está disponível agora; usamos o leitor do navegador.' }
    }
  }
  return transcreverComTesseract(arquivos, aoProgredir)
}
