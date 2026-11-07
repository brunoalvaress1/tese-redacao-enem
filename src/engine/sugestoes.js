// Sugere temas do banco a partir do tema lido na foto e/ou do próprio texto da redação.
// O ranking pelo texto usa TF-IDF: palavras raras no banco de temas (ex.: "desinformação") pesam mais
// que palavras comuns a muitos temas (ex.: "sociedade", "educação").
import { TODOS_TEMAS } from '../data/temas.js'
import { analisarTema, GENERICAS } from './tema.js'
import { palavras, radical, normalizar, STOPWORDS } from './texto.js'

const significativas = (texto) =>
  palavras(texto).map((p) => p.norm).filter((w) => w.length > 3 && !STOPWORDS.has(w) && !GENERICAS.has(w))

function radicaisSignificativos(texto) {
  return new Set(significativas(texto).map(radical))
}

/** Semelhança (0 a 1) entre dois títulos de tema, pelas palavras importantes em comum. */
export function semelhancaTitulos(a, b) {
  const ra = radicaisSignificativos(a)
  const rb = radicaisSignificativos(b)
  if (!ra.size || !rb.size) return 0
  let comuns = 0
  for (const r of ra) if (rb.has(r)) comuns++
  return (comuns / Math.min(ra.size, rb.size)) * 0.7 + (comuns / new Set([...ra, ...rb]).size) * 0.3
}

// ---- índice do banco de temas (calculado uma vez)
let indice = null
function indiceTemas() {
  if (indice) return indice
  const chavesPorTema = new Map()
  const df = new Map()
  for (const t of TODOS_TEMAS) {
    const chaves = new Set(significativas(t.titulo).map(radical))
    for (const g of t.grupos || []) {
      for (const termo of g.split('|')) {
        for (const w of normalizar(termo).split(/\s+/)) if (w.length > 3 && !STOPWORDS.has(w) && !GENERICAS.has(w)) chaves.add(w.length > 6 ? radical(w) : w)
      }
    }
    chavesPorTema.set(t.id, chaves)
    for (const c of chaves) df.set(c, (df.get(c) || 0) + 1)
  }
  const N = TODOS_TEMAS.length
  const idf = new Map([...df].map(([c, n]) => [c, Math.log(N / n)]))
  indice = { chavesPorTema, idf }
  return indice
}

/**
 * @param {{ temaLido?: string, texto?: string, limite?: number }} p
 * @returns {{ tema: object, motivo: 'titulo'|'texto', pontos: number }[]}
 */
export function sugerirTemas({ temaLido = '', texto = '', limite = 3 } = {}) {
  const pontos = new Map()
  if (temaLido.trim().length > 5) {
    for (const t of TODOS_TEMAS) {
      const s = semelhancaTitulos(temaLido, t.titulo)
      if (s >= 0.34) pontos.set(t.id, { tema: t, motivo: 'titulo', pontos: 1 + s })
    }
  }
  const tokens = significativas(texto)
  if (tokens.length >= 25) {
    const { chavesPorTema, idf } = indiceTemas()
    const contagem = new Map()
    const freq = (c) => {
      if (!contagem.has(c)) contagem.set(c, tokens.filter((tk) => tk.startsWith(c)).length)
      return contagem.get(c)
    }
    const candidatos = []
    for (const t of TODOS_TEMAS) {
      if (pontos.has(t.id)) continue
      const chaves = chavesPorTema.get(t.id)
      let s = 0
      for (const c of chaves) s += (idf.get(c) || 0) * Math.min(freq(c), 3)
      s /= Math.sqrt(chaves.size || 1)
      if (s > 0) candidatos.push({ tema: t, motivo: 'texto', pontos: s })
    }
    candidatos.sort((a, b) => b.pontos - a.pontos)
    // confirma a aderência pelo mesmo analisador da correção (descarta fuga/tangência)
    const maior = candidatos[0]?.pontos || 1
    for (const c of candidatos.slice(0, 12)) {
      const status = analisarTema(texto, c.tema).status
      // escala 0,5–0,99: sempre abaixo de um tema reconhecido pelo título (≥ 1,34)
      if (status === 'pleno' || status === 'parcial') pontos.set(c.tema.id, { ...c, pontos: 0.5 + 0.49 * (c.pontos / maior) })
    }
  }
  return [...pontos.values()].sort((x, y) => y.pontos - x.pontos).slice(0, limite)
}
