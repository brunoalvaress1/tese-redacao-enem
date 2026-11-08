// Utilitários de processamento de texto em português.

export const CARACTERES_POR_LINHA = 66 // média medida em redações manuscritas reais na folha do ENEM (56–64 caracteres/linha + recuos)
export const MAX_LINHAS = 30
export const MIN_LINHAS = 8 // até 7 linhas = texto insuficiente (nota zero)

export const STOPWORDS = new Set(
  (
    'a o e é de da do das dos em no na nos nas um uma uns umas por para pelo pela pelos pelas com sem ' +
    'que se não mais mas como ao aos à às ou já também só ser são foi era está estão isso isto esse essa ' +
    'esses essas este esta estes estas aquele aquela aqueles aquelas ele ela eles elas seu sua seus suas ' +
    'lhe lhes nós eu tu você vocês me te nos vos muito muita muitos muitas pouco pouca tão tal tais qual ' +
    'quais quando onde porque pois então assim sobre entre até após desde ainda sempre nunca há ter tem ' +
    'têm tinha haver sido sendo estar fazer faz feito pode podem deve devem cada todo toda todos todas ' +
    'outro outra outros outras mesmo mesma mesmos mesmas meio forma modo maneira vez vezes bem mal sim ' +
    'cujo cuja cujos cujas qualquer quaisquer algum alguma alguns algumas nenhum nenhuma lo la los las ' +
    'dessa desse desses dessas nesse nessa nesses nessas deste desta neste nesta disso nisso daquilo ' +
    'quanto quanta quantos quantas segundo conforme contudo porém entretanto todavia logo portanto'
  ).split(/\s+/),
)

/** Remove acentos e passa para minúsculas. */
export function normalizar(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

const RE_PALAVRA = /[\p{L}]+(?:[-'][\p{L}]+)*/gu

/** Lista de palavras com posição no texto original. */
export function palavras(texto, base = 0) {
  const out = []
  for (const m of texto.matchAll(RE_PALAVRA)) {
    out.push({ palavra: m[0], norm: normalizar(m[0]), inicio: base + m.index, fim: base + m.index + m[0].length })
  }
  return out
}

/** Divide em parágrafos (cada quebra de linha com texto é um parágrafo). */
export function paragrafos(texto) {
  const out = []
  const re = /[^\n]+/g
  for (const m of texto.matchAll(re)) {
    const bruto = m[0]
    if (!bruto.trim()) continue
    const recuo = bruto.length - bruto.trimStart().length
    const conteudo = bruto.trim()
    out.push({ texto: conteudo, inicio: m.index + recuo, fim: m.index + recuo + conteudo.length })
  }
  return out
}

const ABREVIACOES = /(?:\b(?:sr|sra|dr|dra|prof|profa|etc|ex|p|pág|art|arts|nº|inc|séc|aprox|obs|cf|vol|ed|av)\.)$/i

/** Divide um trecho em sentenças, preservando posições absolutas. */
export function sentencas(texto, base = 0) {
  const out = []
  let inicio = 0
  const re = /[.!?]+(?=\s|$)|[.!?]+["”»)](?=\s|$)/g
  for (const m of texto.matchAll(re)) {
    const fim = m.index + m[0].length
    const trecho = texto.slice(inicio, fim)
    if (ABREVIACOES.test(texto.slice(Math.max(0, m.index - 6), m.index + 1))) continue
    if (/\d$/.test(texto.slice(0, m.index)) && /^\.\d/.test(texto.slice(m.index))) continue
    if (trecho.trim()) {
      const recuo = trecho.length - trecho.trimStart().length
      out.push({ texto: trecho.trim(), inicio: base + inicio + recuo, fim: base + fim })
    }
    inicio = fim
  }
  const resto = texto.slice(inicio)
  if (resto.trim()) {
    const recuo = resto.length - resto.trimStart().length
    out.push({ texto: resto.trim(), inicio: base + inicio + recuo, fim: base + inicio + recuo + resto.trim().length })
  }
  return out
}

/** Estima quantas linhas o texto ocuparia na folha de redação do ENEM. */
export function estimarLinhas(texto, cpl = CARACTERES_POR_LINHA) {
  return paragrafos(texto).reduce((total, p) => total + Math.max(1, Math.ceil((p.texto.length + 4) / cpl)), 0)
}

/** Radical aproximado (sem acento) para comparar palavras da mesma família. */
export function radical(palavra) {
  let p = normalizar(palavra)
  if (p.length <= 4) return p
  const sufixos = [
    'amentos', 'imentos', 'amento', 'imento', 'idades', 'idade', 'mente', 'acoes', 'icoes', 'acao', 'icao',
    'coes', 'cao', 'soes', 'sao', 'encias', 'encia', 'ancias', 'ancia', 'istas', 'ista', 'ismos', 'ismo',
    'adores', 'ador', 'ivos', 'ivas', 'ivo', 'iva', 'veis', 'vel', 'ais', 'eis', 'oes', 'aes', 'es', 'as',
    'os', 'is', 'al', 's', 'a', 'o', 'e',
  ]
  for (const s of sufixos) {
    if (p.endsWith(s) && p.length - s.length >= 4) {
      p = p.slice(0, -s.length)
      break
    }
  }
  return p
}

/** Expressão com fronteira de palavra compatível com acentos. */
export function rePalavra(padrao, flags = 'giu') {
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${padrao})(?![\\p{L}\\p{N}])`, flags)
}

/** Encontra ocorrências de uma lista de expressões (texto literal) num trecho. */
export function encontrarExpressoes(texto, lista, base = 0, flags = 'giu') {
  const achados = []
  for (const item of lista) {
    const termo = typeof item === 'string' ? item : item.t
    const re = rePalavra(termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'), flags)
    for (const m of texto.matchAll(re)) {
      achados.push({ termo, item, inicio: base + m.index, fim: base + m.index + m[0].length, trecho: m[0] })
    }
  }
  // remove sobreposições mantendo a expressão mais longa
  achados.sort((a, b) => a.inicio - b.inicio || b.fim - b.inicio - (a.fim - a.inicio))
  const out = []
  let ultimoFim = -1
  for (const a of achados) {
    if (a.inicio >= ultimoFim) {
      out.push(a)
      ultimoFim = a.fim
    }
  }
  return out
}

export function contarPalavras(texto) {
  return (texto.match(RE_PALAVRA) || []).length
}

export function capitalizar(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s
}
