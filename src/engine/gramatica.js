// Verificação de norma-padrão: regras locais + LanguageTool (API pública e gratuita).
import { REGRAS, ERROS_ORTOGRAFICOS } from './dados/regras.js'
import { REPERTORIO } from './dados/repertorio.js'
import { palavras, sentencas, paragrafos } from './texto.js'

const VERBOS_ENCIA = new Set([
  'influencia', 'evidencia', 'diferencia', 'referencia', 'vivencia', 'experiencia', 'presencia', 'potencia',
  'silencia', 'licencia', 'sentencia', 'providencia', 'reverencia', 'financia', 'negocia', 'denuncia', 'anuncia',
  'renuncia', 'pronuncia', 'distancia', 'circunstancia', 'substancia',
])
const EXCECOES_AO = new Set(['cacao', 'tao', 'pao', 'bacalhao', 'callao', 'macao', 'mao'])

function preservarCaixa(original, sugestao) {
  if (!sugestao) return sugestao
  if (original === original.toUpperCase() && original.length > 1) return sugestao.toUpperCase()
  if (original[0] === original[0].toUpperCase()) return sugestao[0].toUpperCase() + sugestao.slice(1)
  return sugestao
}

function marca(inicio, fim, texto, tipo, msg, sugestoes, peso, id, fonte = 'local') {
  return {
    id: `${id}-${inicio}`, regra: id, inicio, fim, trecho: texto.slice(inicio, fim), competencia: 1,
    tipo, msg, sugestoes: (sugestoes || []).filter(Boolean).slice(0, 3), peso, fonte, natureza: 'erro',
  }
}

/** Correções de acentuação por padrão de terminação. */
function acentoPorTerminacao(norm, original) {
  const w = original.toLowerCase()
  if (/[áéíóúâêôãõç]/.test(w)) return null
  const regras = [
    [/^(.{2,})cao$/, '$1ção'], [/^(.{2,})coes$/, '$1ções'], [/^(.{2,}s)ao$/, '$1ão'], [/^(.{2,}s)oes$/, '$1ões'],
    [/^(.{2,})avel$/, '$1ável'], [/^(.{2,})ivel$/, '$1ível'], [/^(.{2,})aveis$/, '$1áveis'], [/^(.{2,})iveis$/, '$1íveis'],
    [/^(.{3,})oes$/, '$1ões'],
  ]
  for (const [re, rep] of regras) if (re.test(w)) return w.replace(re, rep)
  if (/^.{2,}ao$/.test(w) && !EXCECOES_AO.has(w)) return w.replace(/ao$/, 'ão')
  if (/^.{3,}(encia|ancia)s?$/.test(w) && !VERBOS_ENCIA.has(w.replace(/s$/, ''))) {
    return w.replace(/encia(s?)$/, 'ência$1').replace(/ancia(s?)$/, 'ância$1')
  }
  return null
}

/** Verificação local (offline). */
export function verificarLocal(texto) {
  const marcas = []

  // 1) palavras: dicionário de erros + acentuação por terminação
  for (const p of palavras(texto)) {
    const chave = p.palavra.toLowerCase()
    if (Object.prototype.hasOwnProperty.call(ERROS_ORTOGRAFICOS, chave)) {
      const sug = ERROS_ORTOGRAFICOS[chave]
      if (sug) {
        marcas.push(marca(p.inicio, p.fim, texto, 'ortografia', `Grafia incorreta. A forma correta é "${sug}".`,
          [preservarCaixa(p.palavra, sug)], 1, 'ortografia'))
      }
      continue
    }
    const acento = acentoPorTerminacao(p.norm, p.palavra)
    if (acento) {
      marcas.push(marca(p.inicio, p.fim, texto, 'acentuação', `Possível erro de acentuação: o correto é "${acento}".`,
        [preservarCaixa(p.palavra, acento)], 1, 'acento'))
    }
  }

  // 2) regras contextuais
  for (const regra of REGRAS) {
    regra.re.lastIndex = 0
    for (const m of texto.matchAll(regra.re)) {
      let inicio = m.index
      let trecho = m[0]
      if (regra.grupo && m[regra.grupo]) {
        inicio = m.index + m[0].length - m[regra.grupo].length
        trecho = m[regra.grupo]
      }
      const fim = inicio + trecho.length
      if (regra.excluir && regra.excluir(texto, inicio)) continue
      const sug = typeof regra.sug === 'function' ? regra.sug(trecho) : regra.sug
      marcas.push(marca(inicio, fim, texto, regra.tipo, regra.msg, sug ? [sug] : [], regra.peso, regra.id))
    }
  }

  // 3) períodos excessivamente longos (estrutura sintática)
  for (const par of paragrafos(texto)) {
    for (const s of sentencas(par.texto, par.inicio)) {
      const n = palavras(s.texto).length
      if (n > 65) {
        const fimTrecho = Math.min(s.fim, s.inicio + 60)
        marcas.push({
          ...marca(s.inicio, fimTrecho, texto, 'sintaxe',
            `Período muito longo (${n} palavras). Frases extensas sem pontuação adequada comprometem a clareza e a estrutura sintática — divida-o em dois ou mais períodos.`,
            [], 1, 'periodo-longo'),
        })
      }
    }
  }

  return marcas
}

// ---------- LanguageTool ----------
const LT_URL = 'https://api.languagetool.org/v2/check'
const NOMES_PROPRIOS = new Set(REPERTORIO.flatMap((r) => r.t.toLowerCase().split(/\s+/)))
// Formas verbais que o LanguageTool às vezes confunde com substantivos/adjetivos acentuados.
const FALSOS_POSITIVOS_LT = new Set([
  'perpetua', 'perpetuam', 'evidencia', 'influencia', 'pratica', 'praticas', 'critica', 'publica', 'duvida', 'valida',
  'denuncia', 'anuncia', 'vivencia', 'diferencia', 'referencia', 'sentencia', 'agencia', 'secretaria', 'continua',
])

function classificarLT(m) {
  const cat = m.rule?.category?.id || ''
  const issue = m.rule?.issueType || ''
  if (cat === 'TYPOGRAPHY' || issue === 'whitespace' || m.rule?.id === 'WHITESPACE_RULE') return null
  if (cat === 'TYPOS' || issue === 'misspelling') return ['ortografia', 1]
  if (cat === 'GRAMMAR' || cat === 'CONFUSED_WORDS' || issue === 'grammar') return ['gramática', 1]
  if (cat === 'CASING') return ['pontuação', 0.5]
  if (cat === 'PUNCTUATION') return ['pontuação', 0.5]
  // Sugestões de estilo do LanguageTool (ex.: trocar "com o objetivo de" por "para") conflitam com
  // o que o ENEM valoriza (operadores argumentativos), então são ignoradas.
  if (cat === 'REDUNDANCY' || cat === 'STYLE' || cat === 'REPETITIONS_STYLE' || issue === 'style') return null
  if (issue === 'register' || cat === 'COLLOQUIALISMS') return ['informalidade', 0.5]
  if (cat === 'SEMANTICS') return ['gramática', 0.5]
  return ['gramática', 1]
}

export async function verificarLanguageTool(texto, { timeout = 9000 } = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const body = new URLSearchParams({
      text: texto,
      language: 'pt-BR',
      disabledRules: 'WHITESPACE_RULE,UPPERCASE_SENTENCE_START,PT_SMART_QUOTES,DASH_RULE,HUNSPELL_RULE_AR',
    })
    const res = await fetch(LT_URL, {
      method: 'POST', body, signal: ctrl.signal,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`LanguageTool HTTP ${res.status}`)
    const json = await res.json()
    const out = []
    for (const m of json.matches || []) {
      const cls = classificarLT(m)
      if (!cls) continue
      const [tipo, peso] = cls
      const trecho = texto.slice(m.offset, m.offset + m.length)
      if (FALSOS_POSITIVOS_LT.has(trecho.toLowerCase())) continue
      if (tipo === 'ortografia') {
        const antes = texto.slice(Math.max(0, m.offset - 2), m.offset)
        const inicioFrase = m.offset === 0 || /[.!?\n]\s*$/.test(antes) || /\n$/.test(antes)
        if (/^\p{Lu}/u.test(trecho) && !inicioFrase) continue // provável nome próprio
        if (NOMES_PROPRIOS.has(trecho.toLowerCase())) continue
      }
      out.push(marca(m.offset, m.offset + m.length, texto, tipo, m.message,
        (m.replacements || []).map((r) => r.value), peso, `lt-${m.rule?.id || 'regra'}`, 'languagetool'))
    }
    return out
  } finally {
    clearTimeout(timer)
  }
}

/** Junta marcações removendo sobreposições (as locais têm prioridade: explicações mais didáticas). */
export function mesclarMarcas(...listas) {
  const todas = listas.flat().sort((a, b) => a.inicio - b.inicio || (a.fonte === 'local' ? -1 : 1))
  const out = []
  for (const m of todas) {
    const conflito = out.find((o) => m.inicio < o.fim && o.inicio < m.fim)
    if (!conflito) out.push(m)
    else if (conflito.fonte !== 'local' && m.fonte === 'local') out.splice(out.indexOf(conflito), 1, m)
  }
  return out.sort((a, b) => a.inicio - b.inicio)
}
