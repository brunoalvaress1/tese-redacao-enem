// Avaliação das 5 competências da redação do ENEM.
import { CONECTIVOS, REFERENCIAIS } from './dados/conectivos.js'
import { REPERTORIO, PADROES_REPERTORIO } from './dados/repertorio.js'
import { VIOLACAO_DH } from './dados/regras.js'
import { palavras, sentencas, encontrarExpressoes, radical, STOPWORDS, rePalavra, normalizar } from './texto.js'

export const DESCRITORES = {
  c1: {
    titulo: 'Norma-padrão',
    nome: 'Domínio da modalidade escrita formal da língua portuguesa',
    niveis: {
      200: 'Excelente domínio da escrita formal. Desvios aparecem só como exceção, sem reincidência.',
      160: 'Bom domínio da escrita formal, com poucos desvios gramaticais e de convenções da escrita.',
      120: 'Domínio mediano da escrita formal, com alguns desvios gramaticais e de convenções da escrita.',
      80: 'Domínio insuficiente, com muitos desvios gramaticais, de escolha de registro e de convenções da escrita.',
      40: 'Domínio precário, com desvios frequentes, diversificados e sistemáticos.',
      0: 'Desconhecimento da modalidade escrita formal da língua portuguesa.',
    },
  },
  c2: {
    titulo: 'Proposta e repertório',
    nome: 'Compreensão da proposta, do tipo dissertativo-argumentativo e uso de repertório sociocultural',
    niveis: {
      200: 'Desenvolve o tema com argumentação consistente, repertório sociocultural produtivo e excelente domínio do texto dissertativo-argumentativo.',
      160: 'Desenvolve o tema com argumentação consistente e bom domínio do texto dissertativo-argumentativo (proposição, argumentação e conclusão).',
      120: 'Desenvolve o tema com argumentação previsível e domínio mediano do texto dissertativo-argumentativo.',
      80: 'Desenvolve o tema com domínio insuficiente do tipo textual ou com estrutura incompleta (sem proposição, argumentação e conclusão).',
      40: 'Tangencia o tema (aborda apenas o assunto geral) ou demonstra domínio precário do tipo textual.',
      0: 'Fuga ao tema ou não atendimento ao tipo dissertativo-argumentativo.',
    },
  },
  c3: {
    titulo: 'Argumentação',
    nome: 'Seleção, relação, organização e interpretação de informações em defesa de um ponto de vista',
    niveis: {
      200: 'Informações e argumentos relacionados ao tema de forma consistente e organizada, com projeto de texto estratégico e autoria.',
      160: 'Informações e argumentos relacionados ao tema, organizados, com indícios de autoria.',
      120: 'Informações relacionadas ao tema, mas pouco organizadas ou limitadas, com desenvolvimento previsível.',
      80: 'Informações desorganizadas ou pouco desenvolvidas, com projeto de texto falho.',
      40: 'Informações pouco relacionadas ao tema ou incoerentes, sem defesa clara de um ponto de vista.',
      0: 'Informações não relacionadas ao tema e sem defesa de ponto de vista.',
    },
  },
  c4: {
    titulo: 'Coesão',
    nome: 'Conhecimento dos mecanismos linguísticos necessários para a construção da argumentação',
    niveis: {
      200: 'Presença expressiva de elementos coesivos entre e dentro dos parágrafos, com raras ou nenhuma repetição e sem inadequações.',
      160: 'Presença constante de elementos coesivos, com poucas repetições ou inadequações.',
      120: 'Presença regular de elementos coesivos, com algumas repetições ou inadequações.',
      80: 'Presença pontual de elementos coesivos, com muitas repetições ou inadequações.',
      40: 'Presença rara de elementos coesivos, com excessivas repetições ou inadequações.',
      0: 'Ausência de articulação entre as partes do texto.',
    },
  },
  c5: {
    titulo: 'Intervenção',
    nome: 'Proposta de intervenção para o problema abordado, respeitando os direitos humanos',
    niveis: {
      200: 'Proposta muito bem elaborada, completa (agente, ação, meio, finalidade e detalhamento) e articulada à discussão.',
      160: 'Proposta bem elaborada, relacionada ao tema e articulada à discussão (4 elementos válidos).',
      120: 'Proposta mediana, relacionada ao tema e articulada à discussão (3 elementos válidos).',
      80: 'Proposta insuficiente ou pouco articulada à discussão (2 elementos válidos).',
      40: 'Proposta vaga, precária ou relacionada apenas ao assunto.',
      0: 'Ausência de proposta, proposta não relacionada ao tema ou que desrespeita os direitos humanos.',
    },
  },
}

const nivel = (nota) => nota / 40
const somar = (arr) => arr.reduce((a, b) => a + b, 0)
const limitar = (nota, teto) => Math.min(nota, teto)

function semSobreposicao(lista) {
  const ord = [...lista].sort((a, b) => a.inicio - b.inicio || b.fim - a.fim)
  const out = []
  for (const it of ord) {
    const ult = out[out.length - 1]
    if (ult && it.inicio < ult.fim) {
      if (it.fim > ult.fim) {
        ult.fim = it.fim
        ult.trecho = (ult.trecho || '') + '…'
      }
      continue
    }
    out.push({ ...it })
  }
  return out
}

function indiceParagrafo(pars, pos) {
  return pars.findIndex((p) => pos >= p.inicio && pos <= p.fim)
}

function radicaisConteudo(texto, excluir = new Set()) {
  return new Set(
    palavras(texto)
      .map((p) => p.norm)
      .filter((w) => w.length > 3 && !STOPWORDS.has(w))
      .map(radical)
      .filter((r) => !excluir.has(r)),
  )
}

// ===================================================== C1
export function avaliarC1(marcas, stats) {
  const desvios = marcas.filter((m) => m.peso > 0)
  const pontos = somar(desvios.map((m) => m.peso))
  let nota = pontos <= 2 ? 200 : pontos <= 5 ? 160 : pontos <= 9 ? 120 : pontos <= 14 ? 80 : 40
  const limitacoes = []
  if (stats.palavras < 150) {
    nota = limitar(nota, 120)
    limitacoes.push('O texto é curto demais para demonstrar domínio pleno da escrita formal (menos de 150 palavras).')
  } else if (stats.palavras < 220) {
    nota = limitar(nota, 160)
    limitacoes.push('Textos com menos de ~220 palavras dificilmente demonstram excelente domínio da escrita formal.')
  }
  if (stats.sentencas >= 5 && stats.mediaPalavrasFrase < 9) {
    nota = limitar(nota, 160)
    limitacoes.push('As frases são muito curtas e simples: varie a estrutura sintática com orações subordinadas e coordenadas.')
  }

  const porTipo = {}
  for (const m of desvios) porTipo[m.tipo] = (porTipo[m.tipo] || 0) + 1
  const tiposOrdenados = Object.entries(porTipo).sort((a, b) => b[1] - a[1])

  const fortes = []
  const melhorias = []
  if (desvios.filter((m) => m.peso >= 1).length === 0) fortes.push('Nenhum desvio grave de ortografia, concordância, regência ou crase foi encontrado.')
  if (!porTipo['informalidade']) fortes.push('Registro formal adequado: não há marcas de oralidade ou gírias.')
  if (stats.mediaPalavrasFrase >= 14 && stats.mediaPalavrasFrase <= 35) fortes.push('Boa extensão dos períodos, com estrutura sintática variada.')

  const dicasPorTipo = {
    ortografia: 'Revise a grafia das palavras marcadas — erros ortográficos contam como desvio a cada ocorrência.',
    acentuação: 'Revise a acentuação: palavras terminadas em -ção, -ável, -ível, -ência e oxítonas exigem atenção.',
    crase: 'Revise o uso da crase: ela só ocorre quando há preposição "a" + artigo feminino "a".',
    concordância: 'Revise a concordância verbal — atenção aos verbos impessoais (haver = existir, fazer = tempo).',
    regência: 'Revise a regência e o uso de pronomes relativos ("onde" só para lugar).',
    pontuação: 'Revise a pontuação: vírgula após conectivos deslocados, maiúscula após ponto e espaçamento.',
    informalidade: 'Elimine marcas de oralidade (pra, tá, a gente, né…) — o ENEM exige registro formal.',
    sintaxe: 'Divida períodos muito longos: clareza e estrutura sintática também são avaliadas na C1.',
    gramática: 'Revise os trechos de gramática apontados (concordância, regência, colocação pronominal).',
    estilo: 'Ajuste os pontos de estilo marcados (redundâncias, "o mesmo" como pronome, exclamações).',
  }
  for (const [tipo, qtd] of tiposOrdenados.slice(0, 4)) {
    melhorias.push(`${qtd} ocorrência(s) de ${tipo}. ${dicasPorTipo[tipo] || ''}`.trim())
  }
  melhorias.push(...limitacoes)

  const resumo =
    nota >= 200
      ? 'Excelente domínio da norma-padrão. Mantenha a revisão final para não perder pontos por deslizes pontuais.'
      : nota >= 160
        ? `Bom domínio da norma-padrão, com ${desvios.length} desvio(s) identificado(s). Corrigindo os pontos marcados, a nota 200 está ao alcance.`
        : nota >= 120
          ? `Domínio mediano: foram encontrados ${desvios.length} desvios. Priorize os tipos mais frequentes listados abaixo.`
          : `Foram encontrados ${desvios.length} desvios, o que indica domínio insuficiente da escrita formal. Revise as regras dos tipos mais recorrentes.`

  return {
    nota, nivel: nivel(nota), resumo, pontosFortes: fortes, melhorias,
    proximoNivel: nota < 200 ? 'Para subir: no máximo 2 desvios leves, sem reincidência, e períodos bem estruturados.' : null,
    detalhes: { pontosDesvio: Math.round(pontos * 100) / 100, totalDesvios: desvios.length, porTipo },
  }
}

// ===================================================== Repertório
export function analisarRepertorio(texto, pars) {
  const brutos = []
  const capitalizados = REPERTORIO.filter((r) => /^[\p{Lu}\d]/u.test(r.t))
  const minusculos = REPERTORIO.filter((r) => !/^[\p{Lu}\d]/u.test(r.t))
  for (const e of encontrarExpressoes(texto, capitalizados, 0, 'gu')) brutos.push({ inicio: e.inicio, fim: e.fim, trecho: e.trecho, tipo: e.item.tipo })
  for (const e of encontrarExpressoes(texto, minusculos, 0, 'giu')) brutos.push({ inicio: e.inicio, fim: e.fim, trecho: e.trecho, tipo: e.item.tipo })
  for (const p of PADROES_REPERTORIO) {
    p.re.lastIndex = 0
    for (const m of texto.matchAll(p.re)) brutos.push({ inicio: m.index, fim: m.index + m[0].length, trecho: m[0], tipo: p.tipo })
  }
  const itens = semSobreposicao(brutos).map((r) => {
    const par = indiceParagrafo(pars, r.inicio)
    const fraco = r.tipo === 'contexto histórico' || r.tipo === 'dado estatístico'
    return { ...r, trecho: texto.slice(r.inicio, r.fim), paragrafo: par, fraco }
  })
  const unicos = []
  const vistos = new Set()
  for (const it of itens) {
    const chave = normalizar(it.trecho).replace(/^(o|a|no|na|segundo|conforme)\s+/, '')
    if (vistos.has(chave)) continue
    vistos.add(chave)
    unicos.push(it)
  }
  const n = pars.length
  const ehDesenv = (i) => n >= 3 && i > 0 && i < n - 1
  // repertório na conclusão costuma ser o agente da proposta (ex.: "Ministério da Saúde"), não argumento
  const fortes = unicos.filter((r) => !r.fraco && !(n >= 3 && r.paragrafo === n - 1))
  const indicesDesenv = n >= 3 ? [...Array(n - 2).keys()].map((i) => i + 1) : []
  const devSemRepertorio = indicesDesenv.filter((i) => !unicos.some((r) => r.paragrafo === i))
  return {
    itens: unicos,
    fortes: fortes.length,
    fracos: unicos.length - fortes.length,
    devSemRepertorio,
    todosDesenvolvimentos: indicesDesenv.length >= 2 && devSemRepertorio.length === 0,
    produtivos: fortes.filter((r) => ehDesenv(r.paragrafo) || r.paragrafo === 0).length,
    noDesenvolvimento: unicos.filter((r) => ehDesenv(r.paragrafo)).length,
  }
}

// ===================================================== Tese / projeto de texto
export const RE_TESE = rePalavra(
  'é\\s+(?:fundamental|necessário|imprescindível|preciso|urgente|inegável|evidente|notório|indubitável|perceptível|inadmissível|lamentável|inaceitável|alarmante|preocupante)|' +
  'torna-se|faz-se|configura-se|evidencia-se|nota-se|percebe-se|observa-se|constata-se|verifica-se|' +
  'persiste|persistem|perpetua|perpetuam|impasse|entrave|entraves|desafio|desafios|problemática|obstáculo|obstáculos|' +
  'representa\\s+um|constitui\\s+um|constitui\\s+uma|figura\\s+como|ainda\\s+(?:é|são|há)|não\\s+(?:é|são|tem|têm)\\s+(?:garantid|respeitad|efetivad)\\p{L}*|' +
  'mostra-se|revela-se|apresenta-se|caracteriza-se|cenário|realidade|problemas?|evidencia|demonstra|revela|' +
  'um\\s+dos\\s+maiores|uma\\s+das\\s+maiores|grave|gravidade|crise|urge|precisa\\s+ser|deve\\s+ser|necessita\\s+ser',
)
export const RE_ANUNCIO = rePalavra(
  'em\\s+virtude\\s+d[eoa]s?|em\\s+razão\\s+d[eoa]s?|devido\\s+(?:a|à|ao|aos|às)|seja\\s+pel[oa]s?|tanto\\s+(?:pel[oa]s?|n[oa]s?|d[oa]s?)|' +
  'não\\s+só|principalmente|sobretudo|decorrente\\s+d[eoa]s?|fruto\\s+d[eoa]s?|causad[oa]s?\\s+por|motivad[oa]s?\\s+por|ocasionad[oa]s?\\s+por|' +
  'resultado\\s+d[eoa]s?|em\\s+decorrência\\s+d[eoa]s?|em\\s+função\\s+d[eoa]s?|haja\\s+vista|graças\\s+(?:a|à|ao|aos|às)|' +
  'dois\\s+fatores|dois\\s+aspectos|duas\\s+causas|pela?\\s+\\p{L}+\\s+e\\s+pela?|associad[oa]s?\\s+(?:a|à|ao)|' +
  'por\\s+causa\\s+d[eoa]s?|uma\\s+vez\\s+que|visto\\s+que|já\\s+que|porque|pois|tendo\\s+em\\s+vista',
)
export const TIPOS_ARGUMENTATIVOS = new Set(['causa', 'conclusão', 'explicação', 'oposição', 'comparação'])
const RE_CONCLUSIVO = rePalavra('portanto|logo|dessa\\s+forma|desse\\s+modo|em\\s+suma|diante\\s+do\\s+exposto|diante\\s+disso|por\\s+fim|em\\s+síntese|destarte|dessarte|sendo\\s+assim|assim\\s+sendo|conclui-se|infere-se|urge|evidencia-se|depreende-se|percebe-se|fica\\s+evidente|cabe|compete|é\\s+necessário|é\\s+fundamental|é\\s+imprescindível|faz-se\\s+necessário|deve-se')

export function analisarProjeto(texto, pars, temaAnalise, temaRadicais = new Set()) {
  const n = pars.length
  const intro = pars[0]?.texto || ''
  const dev = n >= 3 ? pars.slice(1, -1) : n === 2 ? [pars[1]] : []
  const concl = n >= 3 ? pars[n - 1].texto : ''

  const sentIntro = sentencas(intro, pars[0]?.inicio || 0)
  const teseMatch = [...sentIntro].reverse().find((s) => { RE_TESE.lastIndex = 0; return RE_TESE.test(s.texto) })
  const tese = !!teseMatch
  RE_ANUNCIO.lastIndex = 0
  const anuncio = RE_ANUNCIO.test(intro)

  const radIntro = radicaisConteudo(intro, temaRadicais)
  const devInfo = dev.map((p) => {
    const sents = sentencas(p.texto, p.inicio)
    const np = palavras(p.texto).length
    const topico = sents.slice(0, 2).map((s) => s.texto).join(' ')
    const radTopico = radicaisConteudo(topico, temaRadicais)
    const alinhado = [...radTopico].some((r) => radIntro.has(r))
    const cons = encontrarExpressoes(p.texto, CONECTIVOS).filter((c) => TIPOS_ARGUMENTATIVOS.has(c.item.tipo))
    return { palavras: np, sentencas: sents.length, desenvolvido: np >= 60 && sents.length >= 2, alinhado, marcadores: cons.length }
  })
  const radConcl = radicaisConteudo(concl, temaRadicais)
  const compartilhadosConcl = [...radConcl].filter((r) => radIntro.has(r)).length
  RE_CONCLUSIVO.lastIndex = 0
  const conclusaoRetoma = n >= 3 && (compartilhadosConcl >= 2 || RE_CONCLUSIVO.test(concl))
  const temaEmTodos = temaAnalise.status === 'sem-tema' ? true : temaAnalise.porParagrafo.every((x) => x > 0)

  return {
    tese,
    teseTrecho: teseMatch ? { inicio: teseMatch.inicio, fim: teseMatch.fim } : null,
    anuncio,
    paragrafosDesenvolvimento: dev.length,
    devInfo,
    conclusaoRetoma,
    temaEmTodos,
    temConclusao: n >= 3,
  }
}

// ===================================================== C2
const RE_PRIMEIRA_PESSOA = rePalavra('eu\\s+(?:acho|penso|creio|acredito|sei|vejo|considero)|na\\s+minha\\s+opinião|em\\s+minha\\s+opinião|eu\\s+particularmente|ao\\s+meu\\s+ver|a\\s+meu\\s+ver')

export function avaliarC2({ texto, pars, temaAnalise, repertorio, projeto, narrativo }) {
  const n = pars.length
  const fortes = []
  const melhorias = []
  let nota

  if (temaAnalise.status === 'tangencia') {
    nota = 40
    melhorias.push(`O texto tangencia o tema: aborda o assunto geral, mas não o recorte proposto. ${temaAnalise.ausentes.length ? `Faltou discutir: ${temaAnalise.ausentes.join(', ')}.` : ''}`.trim())
  } else if (n <= 2) {
    nota = 80
    melhorias.push('Estrutura incompleta: o texto dissertativo-argumentativo precisa de introdução, desenvolvimento (2 parágrafos) e conclusão.')
  } else if (narrativo) {
    nota = 80
    melhorias.push('Há traços de narrativa (relato pessoal, sequência de acontecimentos). O ENEM exige texto dissertativo-argumentativo.')
  } else {
    if (repertorio.fortes >= 2 && repertorio.todosDesenvolvimentos) nota = 200
    else if (repertorio.fortes >= 1 || repertorio.fracos >= 1) nota = 160
    else nota = 120
    if (nota === 160 && repertorio.fortes >= 1 && repertorio.devSemRepertorio.length) {
      melhorias.push(`O ${repertorio.devSemRepertorio.map((i) => `${i + 1}º`).join(' e o ')} parágrafo não traz repertório. Para 200, cada desenvolvimento precisa de um repertório legitimado e explicado (dado, lei, autor, fato histórico…).`)
    }

    if (n === 3) {
      nota = limitar(nota, 160)
      melhorias.push('Há apenas um parágrafo de desenvolvimento. O ideal são dois, cada um com um argumento.')
    }
    if (!projeto.tese) {
      nota = limitar(nota, 160)
      melhorias.push('Não foi identificada uma tese clara na introdução. Apresente seu ponto de vista sobre o tema logo no 1º parágrafo.')
    }
    if (temaAnalise.status === 'parcial') {
      nota = limitar(nota, 160)
      melhorias.push(`O tema foi abordado parcialmente. ${temaAnalise.ausentes.length ? `Desenvolva também: ${temaAnalise.ausentes.join(', ')}.` : 'Retome as palavras-chave do tema em todos os parágrafos, sobretudo na introdução.'}`)
    }
  }

  if (temaAnalise.status === 'pleno') fortes.push('O tema é abordado de forma completa, contemplando o recorte da proposta.')
  if (n >= 4 && !narrativo) fortes.push('Estrutura dissertativo-argumentativa completa: introdução, desenvolvimento e conclusão.')
  if (repertorio.fortes > 0) {
    const ex = repertorio.itens.filter((r) => !r.fraco).slice(0, 3).map((r) => `"${r.trecho}"`).join(', ')
    fortes.push(`Repertório sociocultural identificado: ${ex}.`)
  }
  if (repertorio.fortes === 0 && nota > 40) {
    melhorias.push('Nenhum repertório sociocultural legitimado foi identificado. Use autores, leis, dados de instituições, fatos históricos ou obras para fundamentar os argumentos.')
  } else if (nota > 40 && nota < 200 && !repertorio.devSemRepertorio?.length) {
    melhorias.push('Para o nível máximo, explique a relação de cada repertório com o seu argumento (repertório produtivo) e use pelo menos dois repertórios legitimados.')
  }
  RE_PRIMEIRA_PESSOA.lastIndex = 0
  if (RE_PRIMEIRA_PESSOA.test(texto)) {
    melhorias.push('Evite a 1ª pessoa opinativa ("eu acho", "na minha opinião"): prefira construções impessoais ("é fundamental", "percebe-se").')
  }

  const resumo =
    nota >= 200
      ? 'Excelente compreensão da proposta: tema completo, estrutura dissertativo-argumentativa sólida e repertório produtivo.'
      : nota >= 160
        ? 'Boa compreensão da proposta. Para chegar a 200, torne o repertório mais produtivo, articulado aos argumentos.'
        : nota >= 120
          ? 'Compreensão mediana: a argumentação está previsível. Traga repertório legitimado e aprofunde o recorte temático.'
          : nota >= 80
            ? 'A estrutura do texto dissertativo-argumentativo está incompleta ou com traços de outro tipo textual.'
            : 'O texto tangencia o tema: ele aborda o assunto, mas não o problema específico proposto.'

  return {
    nota, nivel: nivel(nota), resumo, pontosFortes: fortes, melhorias,
    proximoNivel: nota < 200 ? 'Para subir: tema completo + estrutura com 4 parágrafos + repertório legitimado, pertinente e produtivo.' : null,
  }
}

// ===================================================== C3
export function avaliarC3({ pars, temaAnalise, projeto, repertorio }) {
  const n = pars.length
  const dev = projeto.devInfo
  const media = (f) => (dev.length ? somar(dev.map(f)) / dev.length : 0)
  const pontos = {
    tese: projeto.tese ? 1 : 0,
    anuncio: projeto.anuncio ? 1 : 0,
    quantidade: dev.length >= 2 ? 1 : dev.length === 1 ? 0.4 : 0,
    desenvolvimento: 1.5 * media((d) => (d.desenvolvido ? 1 : d.sentencas >= 2 ? Math.max(0, Math.min(1, (d.palavras - 25) / 40)) : 0)),
    marcadores: media((d) => (d.marcadores >= 1 ? 1 : 0)),
    alinhamento: 0.5 * media((d) => (d.alinhado ? 1 : 0)),
    conclusao: projeto.conclusaoRetoma ? 0.5 : 0,
    tema: projeto.temaEmTodos ? 0.5 : 0,
  }
  for (const k of Object.keys(pontos)) pontos[k] = Math.round(pontos[k] * 100) / 100
  const total = somar(Object.values(pontos))
  let nota = total >= 6.5 ? 200 : total >= 5.4 ? 160 : total >= 4.2 ? 120 : total >= 2.6 ? 80 : 40
  const fortes = []
  if (nota === 200 && (!projeto.anuncio || !projeto.temaEmTodos)) nota = 160
  const melhorias = []
  if (n <= 2) nota = limitar(nota, 80)
  if (temaAnalise.status === 'tangencia') nota = limitar(nota, 40)
  if (nota === 200 && repertorio?.devSemRepertorio?.length) {
    nota = 160
    melhorias.push(`Para 200, cada desenvolvimento precisa de informações concretas (dados, leis, autores, fatos). O ${repertorio.devSemRepertorio.map((i) => `${i + 1}º`).join(' e o ')} parágrafo argumenta sem nenhuma fonte.`)
  }
  if (nota === 200 && dev.some((d) => !d.desenvolvido)) {
    nota = 160
    melhorias.push('Para 200, todos os parágrafos de desenvolvimento precisam estar bem desenvolvidos (cerca de 60 palavras ou mais, com explicação e exemplo).')
  }
  if (repertorio && repertorio.fortes === 0 && nota > 120) {
    nota = 120
    melhorias.push('Os argumentos não se apoiam em fatos, dados ou referências: sem informações concretas, a argumentação fica limitada (nível 120 no máximo).')
  }

  if (projeto.tese) fortes.push('Ponto de vista (tese) apresentado na introdução.')
  else melhorias.push('Deixe explícita a tese na introdução: qual é a sua posição sobre o problema?')
  if (projeto.anuncio) fortes.push('A introdução antecipa os argumentos/causas que serão desenvolvidos (projeto de texto).')
  else melhorias.push('Anuncie na introdução os dois argumentos que serão desenvolvidos — isso evidencia um projeto de texto estratégico.')
  if (dev.length >= 2 && pontos.desenvolvimento >= 1.5) fortes.push('Parágrafos de desenvolvimento bem extensos, com argumentos aprofundados.')
  dev.forEach((d, i) => {
    if (!d.desenvolvido) melhorias.push(`O ${i + 2}º parágrafo está pouco desenvolvido (${d.palavras} palavras). Explique causas, consequências e exemplos do argumento.`)
    else if (!d.alinhado) melhorias.push(`O tópico frasal do ${i + 2}º parágrafo não retoma claramente o que foi anunciado na introdução.`)
    if (d.marcadores === 0) melhorias.push(`No ${i + 2}º parágrafo, use operadores argumentativos (pois, visto que, dessa forma, consequentemente) para encadear a explicação.`)
  })
  if (!projeto.temaEmTodos && temaAnalise.status !== 'sem-tema') melhorias.push('Nem todos os parágrafos se relacionam explicitamente ao tema. Retome o problema central em cada um deles.')
  if (projeto.conclusaoRetoma) fortes.push('A conclusão retoma a discussão desenvolvida, fechando o projeto de texto.')
  else if (n >= 3) melhorias.push('Retome a tese e os argumentos na conclusão antes da proposta de intervenção.')

  const resumo =
    nota >= 200
      ? 'Argumentação consistente e organizada, com projeto de texto claro do início ao fim.'
      : nota >= 160
        ? 'Argumentação organizada, com indícios de autoria. Aprofunde a explicação dos argumentos para chegar ao nível máximo.'
        : nota >= 120
          ? 'Argumentação previsível ou pouco desenvolvida. Planeje melhor o projeto de texto: tese → 2 argumentos → conclusão.'
          : 'As informações estão pouco organizadas ou desconectadas do tema. Estruture uma tese e defenda-a com argumentos desenvolvidos.'

  return {
    nota, nivel: nivel(nota), resumo, pontosFortes: fortes, melhorias,
    proximoNivel: nota < 200 ? 'Para subir: tese clara + argumentos anunciados na introdução + cada desenvolvimento aprofundado (causa, consequência, exemplo).' : null,
    detalhes: { pontos },
  }
}

// ===================================================== C4
export function analisarCoesao(texto, pars, temaRadicais = new Set()) {
  const conectivos = encontrarExpressoes(texto, CONECTIVOS)
  const n = pars.length
  let transicoes = 0
  let transicoesOk = 0
  const inter = new Set()
  for (let i = 1; i < n; i++) {
    transicoes++
    const p = pars[i]
    const inicioP = p.texto.slice(0, 40)
    const c = conectivos.find((x) => x.inicio >= p.inicio && x.inicio < p.inicio + 25)
    const referencial = /^(?:Esse|Essa|Esses|Essas|Tal|Tais|Isso|Diante|Nesse|Nessa|Sob|Ante|Com\s+isso|Por\s+outro\s+lado)\b/u.test(inicioP)
    if (c || referencial) {
      transicoesOk++
      if (c) inter.add(c)
    }
  }
  const intra = conectivos.filter((c) => !inter.has(c))
  const totalSentencas = pars.reduce((t, p) => t + sentencas(p.texto).length, 0) || 1
  const contagem = {}
  for (const c of conectivos) {
    const k = c.termo.toLowerCase()
    contagem[k] = (contagem[k] || 0) + 1
  }
  const variedade = Object.keys(contagem).length
  const repetidosConectivos = Object.entries(contagem).filter(([k, v]) => v >= 3 && k !== 'também').map(([k, v]) => ({ termo: k, vezes: v }))
  const referenciais = encontrarExpressoes(texto, REFERENCIAIS).length

  // repetição de palavras
  const ps = palavras(texto).filter((p) => p.norm.length >= 5 && !STOPWORDS.has(p.norm))
  const grupos = {}
  for (const p of ps) {
    const r = radical(p.palavra)
    ;(grupos[r] = grupos[r] || []).push(p)
  }
  const repeticoes = []
  for (const [r, lista] of Object.entries(grupos)) {
    const limite = temaRadicais.has(r) ? 7 : 5
    if (lista.length >= limite) {
      repeticoes.push({ radical: r, palavra: lista[0].palavra.toLowerCase(), vezes: lista.length, ocorrencias: lista.slice(2) })
    }
  }
  repeticoes.sort((a, b) => b.vezes - a.vezes)
  const repeticoesLeves = Object.entries(grupos).filter(([r, lista]) => !temaRadicais.has(r) && lista.length === 4).length

  return {
    conectivos, inter: [...inter], intra, transicoes, transicoesOk, variedade, contagem, repetidosConectivos,
    referenciais, repeticoes, repeticoesLeves, densidadeIntra: intra.length / totalSentencas,
  }
}

export function avaliarC4(coesao, pars) {
  const { transicoes, transicoesOk, densidadeIntra, variedade, referenciais, repeticoes, repetidosConectivos } = coesao
  const razaoInter = transicoes ? transicoesOk / transicoes : 0
  let pontos = 0
  pontos += razaoInter >= 1 ? 2 : razaoInter >= 0.66 ? 1.5 : razaoInter >= 0.5 ? 1 : razaoInter > 0 ? 0.5 : 0
  pontos += densidadeIntra >= 0.8 ? 1.5 : densidadeIntra >= 0.5 ? 1.2 : densidadeIntra >= 0.3 ? 0.8 : densidadeIntra > 0 ? 0.4 : 0
  pontos += variedade >= 10 ? 1 : variedade >= 6 ? 0.6 : variedade >= 3 ? 0.3 : 0
  pontos += referenciais >= 3 ? 0.5 : referenciais >= 1 ? 0.25 : 0
  pontos -= Math.min(1.2, repeticoes.length * 0.4)
  pontos -= Math.min(0.6, repetidosConectivos.length * 0.3)
  let nota = pontos >= 4.6 ? 200 : pontos >= 3.7 ? 160 : pontos >= 2.6 ? 120 : pontos >= 1.6 ? 80 : 40
  if (pars.length <= 1) nota = limitar(nota, 80)
  // 200 = articulação impecável: todas as transições, repertório coesivo amplo e nenhuma repetição relevante
  if (nota === 200 && (razaoInter < 1 || variedade < 10 || repeticoes.length > 0 || repetidosConectivos.length > 0 || coesao.repeticoesLeves > 0)) nota = 160

  const fortes = []
  const melhorias = []
  if (razaoInter >= 1 && transicoes > 0) fortes.push('Todos os parágrafos estão articulados por conectivos ou retomadas no início.')
  else if (transicoes > 0) melhorias.push(`${transicoes - transicoesOk} de ${transicoes} transições entre parágrafos não têm conectivo. Inicie cada parágrafo com um elemento coesivo (Em primeiro lugar, Além disso, Portanto…).`)
  if (variedade >= 8) fortes.push(`Repertório coesivo diversificado: ${variedade} conectivos diferentes.`)
  else melhorias.push(`Apenas ${variedade} conectivo(s) diferente(s). Diversifique: ademais, outrossim, nesse sentido, por conseguinte, haja vista…`)
  if (densidadeIntra < 0.5) melhorias.push('Use mais conectivos dentro dos parágrafos para ligar as frases (causa, consequência, explicação).')
  else fortes.push('Boa articulação entre as frases dentro dos parágrafos.')
  if (referenciais >= 3) fortes.push('Bom uso de coesão referencial (pronomes e expressões que retomam termos).')
  for (const r of repeticoes.slice(0, 3)) melhorias.push(`A palavra "${r.palavra}" (e variações) aparece ${r.vezes} vezes. Substitua por sinônimos, pronomes ou hiperônimos.`)
  for (const c of repetidosConectivos.slice(0, 2)) melhorias.push(`O conectivo "${c.termo}" foi usado ${c.vezes} vezes — varie para não soar repetitivo.`)

  const resumo =
    nota >= 200
      ? 'Coesão excelente: conectivos variados entre e dentro dos parágrafos, sem repetições relevantes.'
      : nota >= 160
        ? 'Boa coesão textual. Diversifique os conectivos e evite repetições para alcançar o nível máximo.'
        : nota >= 120
          ? 'Coesão regular: faltam conectivos em alguns pontos e há repetições.'
          : 'Coesão insuficiente: as partes do texto estão pouco articuladas.'

  return {
    nota, nivel: nivel(nota), resumo, pontosFortes: fortes, melhorias,
    proximoNivel: nota < 200 ? 'Para subir: conectivo no início de todos os parágrafos, 2+ conectivos por parágrafo, variedade e nenhuma repetição excessiva.' : null,
    detalhes: { pontos: Math.round(pontos * 100) / 100, razaoInter, variedade, referenciais },
  }
}

// ===================================================== C5
const RE_AGENTE = rePalavra(
  'governo(?:\\s+federal|\\s+estadual|\\s+municipal)?|estado|poder\\s+(?:público|executivo|legislativo|judiciário)|' +
  'ministérios?(?:\\s+d[aoe]s?\\s+[\\p{L}]+(?:\\s+e\\s+(?:d[aoe]s?\\s+)?[\\p{L}]+)?)?|secretarias?(?:\\s+(?:municipais|estaduais)?\\s*d[aoe]s?\\s+[\\p{L}]+)?|' +
  'prefeituras?|congresso(?:\\s+nacional)?|câmaras?\\s+(?:municipais|dos\\s+deputados)|senado(?:\\s+federal)?|escolas?|instituições\\s+de\\s+ensino|' +
  'universidades?|mídias?|imprensa|veículos\\s+de\\s+(?:comunicação|mídia|imprensa)|meios\\s+de\\s+comunicação|ongs?|' +
  'organizações\\s+não\\s+governamentais|sociedade\\s+civil|famílias?|empresas?|iniciativa\\s+privada|setor\\s+privado|' +
  'igrejas?|instituições\\s+religiosas|comunidades?|influenciadores(?:\\s+digitais)?|plataformas\\s+digitais|redes\\s+sociais|' +
  'big\\s+techs|polícias?|ministério\\s+público|defensoria\\s+pública|sus|funai|ibama|anvisa|inep|mec|' +
  'conselhos?\\s+tutelares?|órgãos\\s+(?:públicos|competentes|governamentais)|autoridades|legisladores|parlamentares|' +
  'gestores(?:\\s+públicos)?|profissionais\\s+d[aoe]s?\\s+\\p{L}+|cidadãos|centros\\s+comunitários|terceiro\\s+setor|' +
  'união|entes\\s+federativos|poder\\s+judiciário|judiciário|instituições|sociedade|população|educadores|professores',
)
const VERBOS_ACAO = (
  'promover criar implementar ampliar fiscalizar investir desenvolver realizar garantir incentivar conscientizar elaborar ' +
  'fomentar estabelecer destinar oferecer ofertar capacitar combater divulgar instituir assegurar intensificar viabilizar ' +
  'reformular inserir construir aplicar adotar mobilizar debater democratizar regulamentar monitorar financiar apoiar ' +
  'valorizar expandir disponibilizar produzir veicular orientar educar sensibilizar esclarecer ensinar revisar alterar ' +
  'aprovar treinar qualificar contratar distribuir facilitar estimular alertar informar integrar incluir acolher proteger ' +
  'punir penalizar responsabilizar propor criar efetivar priorizar reforçar fortalecer implantar lançar organizar ' +
  'executar formular planejar mapear estruturar articular reestruturar abordar discutir trabalhar inserir legislar ' +
  'atuar agir intervir combater erradicar reduzir mitigar ampliar difundir democratizar subsidiar cobrar exigir'
).split(/\s+/)
function formasVerbo(v) {
  const raiz = v.slice(0, -2)
  const term = v.slice(-2)
  if (term === 'ar') return [v, raiz + 'e', raiz + 'em', raiz + 'ará', raiz + 'arão', raiz + 'aria', raiz + 'ariam']
  if (term === 'er') return [v, raiz + 'a', raiz + 'am', raiz + 'erá', raiz + 'erão', raiz + 'eria', raiz + 'eriam']
  if (term === 'ir') return [v, raiz + 'a', raiz + 'am', raiz + 'irá', raiz + 'irão', raiz + 'iria', raiz + 'iriam']
  if (term === 'or') return [v, v.replace(/or$/, 'onha'), v.replace(/or$/, 'onham')]
  return [v]
}
const RE_ACAO = rePalavra([...new Set(VERBOS_ACAO.flatMap(formasVerbo))].join('|'))
const RE_MODAL = rePalavra('deve(?:m|ria|riam)?|precisa(?:m)?|necessita(?:m)?|cabe|caberia|compete|incumbe|urge|é\\s+(?:dever|papel|função|responsabilidade|necessário|preciso|fundamental|imprescindível|urgente|essencial|crucial|indispensável|mister)|faz-se\\s+(?:necessário|urgente|imprescindível|mister)|torna-se\\s+(?:necessário|imprescindível|fundamental|urgente)|é\\s+necessário\\s+que|é\\s+preciso\\s+que')
const RE_MEIO = rePalavra(
  'por\\s+meio\\s+d[eoa]s?|mediante|por\\s+intermédio\\s+d[eoa]s?|através\\s+d[eoa]s?|com\\s+o\\s+(?:auxílio|apoio|uso)\\s+d[eoa]s?|' +
  'via|com\\s+base\\s+em|utilizando|por\\s+via\\s+d[eoa]s?|com\\s+a\\s+(?:criação|implementação|realização|ampliação|promoção|utilização|ajuda)\\s+d[eoa]s?|' +
  'por\\s+meio\\s+da|valendo-se\\s+d[eoa]s?|por\\s+mei[oa]',
)
const RE_FINALIDADE = rePalavra(
  'a\\s+fim\\s+de|com\\s+(?:o\\s+)?(?:objetivo|intuito|propósito|fito)\\s+de|com\\s+a\\s+finalidade\\s+de|para\\s+que|no\\s+intuito\\s+de|' +
  'visando(?:\\s+(?:a|à|ao))?|objetivando|de\\s+modo\\s+a|de\\s+forma\\s+a|de\\s+maneira\\s+a|' +
  'para\\s+(?:\\p{L}+(?:ar|er|ir))|para\\s+(?:se|lhes?)\\s+\\p{L}+(?:ar|er|ir)',
)
const RE_DETALHE = new RegExp(
  '(?:,\\s*(?:órgão|instituição|entidade|instância|ente|responsável|principal|que\\s+(?:é|tem|possui|detém|atua|são)|o\\s+qual|a\\s+qual|os\\s+quais|as\\s+quais|cuj[oa]s?)\\b)|' +
  '(?<![\\p{L}])(?:' +
  'que\\s+(?:discutam|abordem|expliquem|mostrem|ensinem|tratem|promovam|esclareçam|apresentem|alertem|orientem|incentivem|informem|conscientizem|estimulem|valorizem)|' +
  'tais\\s+como|a\\s+exemplo\\s+d[eoa]s?|por\\s+exemplo|isto\\s+é|ou\\s+seja|especialmente|com\\s+destaque\\s+para|em\\s+especial|como\\s+(?:palestras|campanhas|oficinas|aulas|projetos|cursos|programas|rodas|debates|aplicativos|anúncios|propagandas|vídeos|cartilhas|feiras|mutirões))(?![\\p{L}])',
  'giu',
)

const RE_ATRIBUICAO = /(?<![\p{L}])(?:cabe|caberia|compete|competiria|incumbe|é\s+(?:dever|papel|função|responsabilidade))\s+(?:a|ao|à|aos|às|d[oa]s?)\s+/giu
const RE_ACAO_NOMINAL = rePalavra(
  'palestras?|campanhas?|projetos?|programas?|oficinas?|cursos?|debates?|rodas\\s+de\\s+conversa|fiscalização|criação|' +
  'implementação|ampliação|investimentos?|políticas\\s+públicas|capacitações?|mutirões|propagandas?|ações\\s+educativas',
)

function primeiro(re, texto, base) {
  re.lastIndex = 0
  const m = re.exec(texto)
  return m ? { inicio: base + m.index, fim: base + m.index + m[0].length, trecho: m[0] } : null
}

export function analisarProposta(texto, pars, temaGrupos) {
  const n = pars.length
  const candidatos = n >= 2 ? [pars[n - 1], pars[n - 2]] : pars.slice()
  let alvo = candidatos[0]
  for (const c of candidatos) {
    RE_ACAO.lastIndex = 0
    RE_MODAL.lastIndex = 0
    if (RE_ACAO.test(c.texto) && RE_MODAL.test(c.texto)) { alvo = c; break }
  }
  if (!alvo) return { elementos: {}, quantidade: 0, violacaoDH: null, relacionadaTema: false, paragrafo: -1 }
  const base = alvo.inicio
  const t = alvo.texto

  // 1) agente: de preferência o que vem logo após "cabe ao", "compete à", "é dever do"…
  let agente = null
  for (const m of t.matchAll(RE_ATRIBUICAO)) {
    const ini = m.index + m[0].length
    RE_AGENTE.lastIndex = 0
    const ma = RE_AGENTE.exec(t.slice(ini))
    // aceita "cabe ao poder do Governo Federal", "cabe à figura do Ministério…"
    const intervalo = ma ? t.slice(ini, ini + ma.index) : ''
    if (ma && (ma.index <= 4 || /^(?:poder|figura|esfera|âmbito)\s+d[oa]s?\s+$/i.test(intervalo))) {
      agente = { inicio: base + ini + ma.index, fim: base + ini + ma.index + ma[0].length, trecho: ma[0] }
      break
    }
  }
  if (!agente) {
    RE_AGENTE.lastIndex = 0
    for (const m of t.matchAll(RE_AGENTE)) {
      if (m[0] === 'estado' || m[0] === 'estados') continue // "estado" minúsculo costuma ser substantivo comum
      agente = { inicio: base + m.index, fim: base + m.index + m[0].length, trecho: m[0] }
      break
    }
  }
  const relAgente = agente ? agente.fim - base : 0

  // 2) finalidade: a primeira depois do agente
  let finalidade = primeiro(RE_FINALIDADE, t.slice(relAgente), base + relAgente)

  // 3) ação: verbo depois do agente e ANTES da finalidade (um verbo dentro de "a fim de… promover" é finalidade, não ação)
  const limite = finalidade ? finalidade.inicio : base + t.length
  RE_ACAO.lastIndex = 0
  let acao = null
  for (const m of t.slice(relAgente).matchAll(RE_ACAO)) {
    const ini = base + relAgente + m.index
    if (ini >= limite) break
    acao = { inicio: ini, fim: ini + m[0].length, trecho: m[0] }
    break
  }
  // "cabe ao Estado, para combater X, investir em…": finalidade com "para" antes do verbo da ação
  if (!acao && finalidade && /^para\s/i.test(finalidade.trecho)) {
    RE_ACAO.lastIndex = 0
    const rel = finalidade.fim - base
    const ma = RE_ACAO.exec(t.slice(rel))
    if (ma) {
      acao = { inicio: base + rel + ma.index, fim: base + rel + ma.index + ma[0].length, trecho: ma[0] }
      finalidade = primeiro(RE_FINALIDADE, t.slice(acao.fim - base), acao.fim) || finalidade
    }
  }
  // ação implícita: substantivo de ação no meio/modo ("por meio de palestras e campanhas…")
  if (!acao) {
    RE_ACAO_NOMINAL.lastIndex = 0
    const trechoAcao = t.slice(relAgente, limite - base)
    const mn = RE_ACAO_NOMINAL.exec(trechoAcao)
    if (mn && agente) acao = { inicio: base + relAgente + mn.index, fim: base + relAgente + mn.index + mn[0].length, trecho: mn[0], nominal: true }
  }
  const modal = primeiro(RE_MODAL, t, base)
  const meio = primeiro(RE_MEIO, t, base)
  const detalhamento = primeiro(RE_DETALHE, t, base)
  if (detalhamento) {
    const limpo = detalhamento.trecho.replace(/^,\s*/, '')
    detalhamento.inicio += detalhamento.trecho.length - limpo.length
    detalhamento.trecho = limpo
  }

  const elementos = {
    agente,
    acao: acao && (modal || agente) ? acao : null,
    meio,
    finalidade,
    detalhamento,
  }
  const quantidade = Object.values(elementos).filter(Boolean).length
  const violacao = primeiro(VIOLACAO_DH, texto, 0)

  const tokens = palavras(t).map((p) => p.norm)
  const relacionadaTema = !temaGrupos.length || temaGrupos.some((g) => g.termos.some((term) => (term.includes(' ') ? normalizar(t).includes(term) : tokens.some((tk) => tk.startsWith(term)))))

  return { elementos, quantidade, violacaoDH: violacao, relacionadaTema, paragrafo: pars.indexOf(alvo), ehUltimo: alvo === pars[n - 1] }
}

export function avaliarC5(proposta, temaAnalise) {
  const { elementos, quantidade, violacaoDH, relacionadaTema } = proposta
  const nomes = { agente: 'Agente', acao: 'Ação', meio: 'Meio/modo', finalidade: 'Finalidade', detalhamento: 'Detalhamento' }
  const fortes = []
  const melhorias = []
  let nota

  if (violacaoDH) {
    nota = 0
    melhorias.push(`A proposta desrespeita os direitos humanos ("${violacaoDH.trecho}"). Isso zera a Competência 5. Proponha soluções que respeitem a dignidade de todos.`)
  } else if (!elementos.acao) {
    nota = quantidade >= 1 ? 40 : 0
    melhorias.push(
      quantidade >= 1
        ? 'A proposta está vaga: não há uma ação concreta. Diga claramente O QUE deve ser feito (ex.: "o Ministério da Educação deve criar…").'
        : 'Não foi identificada proposta de intervenção. Na conclusão, proponha uma solução com agente, ação, meio/modo, finalidade e detalhamento.',
    )
  } else {
    nota = Math.min(200, quantidade * 40)
    if (elementos.acao.nominal) {
      nota = limitar(nota, 160)
      melhorias.push(`A ação está só implícita ("${elementos.acao.trecho}"). Deixe o verbo explícito — ex.: "deve promover palestras" — para o corretor reconhecer a ação com clareza.`)
    }
  }
  if (nota > 0 && !relacionadaTema) {
    nota = limitar(nota, 80)
    melhorias.push('A proposta não retoma o problema do tema. Relacione a solução diretamente ao recorte temático discutido.')
  }
  if (temaAnalise.status === 'tangencia') nota = limitar(nota, 40)
  if (proposta.paragrafo >= 0 && !proposta.ehUltimo && nota > 0) melhorias.push('A proposta deve ficar preferencialmente na conclusão (último parágrafo).')

  for (const [k, v] of Object.entries(elementos)) {
    if (v) fortes.push(`${nomes[k]}: "${v.trecho}"`)
  }
  const faltando = Object.entries(elementos).filter(([, v]) => !v).map(([k]) => nomes[k])
  const dicas = {
    Agente: 'Quem vai executar? (ex.: "o Ministério da Educação", "as escolas", "a mídia")',
    Ação: 'O que será feito? (ex.: "deve promover campanhas", "cabe ao Estado criar…")',
    'Meio/modo': 'Como será feito? (ex.: "por meio de", "mediante", "com o auxílio de")',
    Finalidade: 'Para quê? (ex.: "a fim de", "com o objetivo de", "para que")',
    Detalhamento: 'Detalhe um dos elementos (ex.: "o MEC, órgão responsável pela educação básica, …" ou "como palestras e oficinas")',
  }
  if (!violacaoDH) for (const f of faltando) melhorias.push(`Falta ${f.toLowerCase()} — ${dicas[f]}.`)

  const resumo = violacaoDH
    ? 'A proposta fere os direitos humanos e, por isso, não pode ser considerada.'
    : nota >= 200
      ? 'Proposta de intervenção completa, com os 5 elementos e relacionada ao tema.'
      : nota >= 160
        ? 'Proposta bem elaborada, com 4 elementos. Falta apenas um para a nota máxima.'
        : nota >= 120
          ? 'Proposta mediana, com 3 elementos. Complete os que faltam para subir de nível.'
          : nota > 0
            ? 'Proposta insuficiente ou vaga. Estruture-a com agente, ação, meio, finalidade e detalhamento.'
            : 'Não há proposta de intervenção válida.'

  return {
    nota, nivel: nivel(nota), resumo, pontosFortes: fortes, melhorias,
    proximoNivel: nota < 200 ? 'Para subir: 5 elementos válidos — agente + ação + meio/modo + finalidade + detalhamento — articulados ao tema.' : null,
    detalhes: { elementos: Object.fromEntries(Object.entries(elementos).map(([k, v]) => [k, v ? v.trecho : null])) },
  }
}
