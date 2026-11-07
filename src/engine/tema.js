// Aderência ao tema: identifica abordagem plena, parcial, tangenciamento e fuga ao tema.
import { normalizar, palavras, paragrafos, STOPWORDS } from './texto.js'

export const GENERICAS = new Set(
  (
    'desafios desafio caminhos caminho combater combate enfrentamento enfrentar brasil brasileira brasileiro ' +
    'brasileiros brasileiras sociedade social sociais questao perspectivas perspectiva acerca importancia ' +
    'impactos impacto efeitos efeito consequencias problema problemas contemporanea contemporaneo atual atuais ' +
    'seculo xxi realidade garantia garantir promover promocao formas forma meios papel relacao persistencia ' +
    'como sobre para pela pelo diante frente atualidade mundo pais nacional avanco aumento crescimento ' +
    'reducao queda presenca ausencia falta necessidade influencia tempos hoje atualmente contexto cenario ' +
    'importancia relevancia papel desafios limites riscos questoes ligadas ampliar debate'
  ).split(/\s+/),
)

/**
 * Converte o tema em grupos de termos. Cada grupo representa uma parte do recorte temático.
 * Termos são prefixos sem acento (ex.: "invisi" casa com "invisível" e "invisibilidade").
 */
export function gruposDoTema(tema) {
  if (!tema) return []
  if (tema.grupos?.length) {
    return tema.grupos.map((g, i) => ({
      nome: g.split('|')[0],
      termos: g.split('|').map((t) => normalizar(t.trim())).filter(Boolean),
      nucleo: i === 0,
    }))
  }
  // Tema livre digitado pelo estudante: deriva os grupos das palavras significativas do título.
  const ps = palavras(tema.titulo || '')
    .map((p) => p.norm)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w) && !GENERICAS.has(w))
  const unicos = [...new Set(ps)]
  return unicos.slice(0, 5).map((w) => ({
    nome: w,
    termos: [w.length > 6 ? w.slice(0, Math.max(5, w.length - 3)) : w],
    nucleo: false,
  }))
}

function casaTermo(termo, tokens, textoNorm) {
  if (termo.includes(' ')) return textoNorm.includes(termo)
  if (termo.length <= 3) return tokens.some((t) => t === termo)
  return tokens.some((t) => t.startsWith(termo))
}

function contarOcorrencias(grupos, tokens, textoNorm) {
  let total = 0
  for (const g of grupos) {
    for (const termo of g.termos) {
      if (termo.includes(' ')) total += textoNorm.split(termo).length - 1
      else total += tokens.filter((t) => (termo.length <= 3 ? t === termo : t.startsWith(termo))).length
    }
  }
  return total
}

/** Analisa a aderência do texto ao tema. */
export function analisarTema(texto, tema) {
  const grupos = gruposDoTema(tema)
  if (!grupos.length) {
    return { status: 'sem-tema', grupos: [], encontrados: [], ausentes: [], porParagrafo: [], ocorrencias: 0, cobertura: 1 }
  }
  const tokens = palavras(texto).map((p) => p.norm)
  const textoNorm = normalizar(texto).replace(/\s+/g, ' ')
  const encontrados = grupos.filter((g) => g.termos.some((t) => casaTermo(t, tokens, textoNorm)))
  const ausentes = grupos.filter((g) => !encontrados.includes(g))
  const cobertura = encontrados.length / grupos.length
  const ocorrencias = contarOcorrencias(grupos, tokens, textoNorm)

  const pars = paragrafos(texto)
  const porParagrafo = pars.map((p) => {
    const tk = palavras(p.texto).map((x) => x.norm)
    const tn = normalizar(p.texto).replace(/\s+/g, ' ')
    return grupos.filter((g) => g.termos.some((t) => casaTermo(t, tk, tn))).length
  })
  const paragrafosComTema = porParagrafo.filter((n) => n > 0).length
  const nucleo = grupos.find((g) => g.nucleo)
  const nucleoPresente = !nucleo || encontrados.includes(nucleo)

  let status
  if (encontrados.length === 0) status = 'fuga'
  else if (!nucleoPresente || cobertura < 0.5) status = 'tangencia'
  else if (pars.length >= 3 && paragrafosComTema <= 1) status = 'tangencia'
  else if (cobertura < (tema.grupos?.length ? 1 : 0.66) || ocorrencias < 3 || (pars.length >= 3 && porParagrafo[0] === 0)) status = 'parcial'
  else status = 'pleno'

  return {
    status,
    grupos: grupos.map((g) => g.nome),
    encontrados: encontrados.map((g) => g.nome),
    ausentes: ausentes.map((g) => g.nome),
    porParagrafo,
    paragrafosComTema,
    ocorrencias,
    cobertura,
  }
}
