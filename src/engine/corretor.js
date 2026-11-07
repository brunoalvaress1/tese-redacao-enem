// Corretor de redação ENEM — orquestra a análise das 5 competências.
import { paragrafos, sentencas, palavras, estimarLinhas, contarPalavras, normalizar, radical, MAX_LINHAS, MIN_LINHAS } from './texto.js'
import { verificarLocal, verificarLanguageTool, mesclarMarcas } from './gramatica.js'
import { analisarTema, gruposDoTema } from './tema.js'
import { IMPROPERIOS } from './dados/regras.js'
import {
  DESCRITORES, avaliarC1, avaliarC2, avaliarC3, avaliarC4, avaliarC5,
  analisarRepertorio, analisarProjeto, analisarCoesao, analisarProposta,
} from './competencias.js'

export { DESCRITORES }

const RE_NARRATIVA = /(?<![\p{L}])(?:era\s+uma\s+vez|certo\s+dia|de\s+repente|um\s+dia|lembro\s+(?:que|de)|eu\s+(?:fui|estava|era|tinha|fiquei|vi|senti|morava)|minha\s+(?:mãe|avó|tia|irmã|amiga)\s+(?:disse|falou|contou)|meu\s+(?:pai|avô|tio|irmão|amigo)\s+(?:disse|falou|contou)|quando\s+eu\s+era)(?![\p{L}])/giu
const INGLES = new Set(['the', 'and', 'is', 'of', 'to', 'in', 'that', 'it', 'with', 'for', 'are', 'this', 'be', 'on', 'not', 'have', 'they', 'we', 'you'])

function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/** Estatísticas gerais do texto. */
export function estatisticas(texto) {
  const pars = paragrafos(texto)
  const sents = pars.flatMap((p) => sentencas(p.texto, p.inicio))
  const nPal = contarPalavras(texto)
  return {
    palavras: nPal,
    caracteres: texto.replace(/\s/g, '').length,
    paragrafos: pars.length,
    sentencas: sents.length,
    linhas: estimarLinhas(texto),
    mediaPalavrasFrase: sents.length ? Math.round((nPal / sents.length) * 10) / 10 : 0,
  }
}

/** Critérios que zeram a redação no ENEM. */
export function verificarAnulacao(texto, stats, temaAnalise) {
  if (!texto.trim() || stats.palavras < 5) return { motivo: 'Texto em branco', detalhe: 'Não há texto suficiente para avaliar.' }
  if (stats.linhas < MIN_LINHAS) {
    return { motivo: 'Texto insuficiente', detalhe: `O texto ocuparia cerca de ${stats.linhas} linha(s). Redações com até 7 linhas recebem nota zero no ENEM.` }
  }
  const tokens = palavras(texto).map((p) => p.norm)
  const ingles = tokens.filter((t) => INGLES.has(t)).length
  if (tokens.length && ingles / tokens.length > 0.12) {
    return { motivo: 'Texto predominantemente em língua estrangeira', detalhe: 'A redação deve ser escrita em língua portuguesa.' }
  }
  IMPROPERIOS.lastIndex = 0
  const imp = IMPROPERIOS.exec(texto)
  if (imp) return { motivo: 'Impropérios ou termos ofensivos', detalhe: `Foi encontrado o termo "${imp[0]}". Impropérios e partes desconectadas propositais anulam a redação.` }
  if (temaAnalise.status === 'fuga') {
    return { motivo: 'Fuga total ao tema', detalhe: 'O texto não aborda o tema proposto. Nenhuma das palavras-chave do tema foi encontrada.' }
  }
  const narrativas = (texto.match(RE_NARRATIVA) || []).length
  const dialogos = paragrafos(texto).filter((p) => /^[—–-]\s*\p{L}/u.test(p.texto)).length
  if (narrativas >= 4 || dialogos >= 3) {
    return { motivo: 'Não atendimento ao tipo dissertativo-argumentativo', detalhe: 'O texto apresenta características predominantes de narrativa (relato, diálogos, sequência de fatos).' }
  }
  return null
}

/**
 * Corrige uma redação.
 * @param {object} p
 * @param {string} p.texto
 * @param {object|null} p.tema  { id, titulo, grupos? }
 * @param {boolean} [p.usarLanguageTool=true]
 */
export async function corrigirRedacao({ texto, tema = null, usarLanguageTool = true, origem = 'digitado' }) {
  const textoLimpo = texto.replace(/\r\n?/g, '\n').replace(/[ \t]+$/gm, '')
  const stats = estatisticas(textoLimpo)
  const pars = paragrafos(textoLimpo)
  const temaAnalise = analisarTema(textoLimpo, tema)
  const temaGrupos = gruposDoTema(tema)
  const temaRadicais = new Set([
    ...temaGrupos.flatMap((g) => g.termos.flatMap((t) => t.split(/\s+/).map((w) => radical(w)))),
    ...palavras(tema?.titulo || '').filter((p) => p.norm.length > 3).map((p) => radical(p.palavra)),
  ])

  // ---- Competência 1: norma-padrão
  let fonteGramatica = 'local'
  let avisoGramatica = null
  const locais = verificarLocal(textoLimpo)
  let remotas = []
  if (usarLanguageTool && stats.palavras >= 5) {
    try {
      remotas = await verificarLanguageTool(textoLimpo)
      fonteGramatica = 'local+languagetool'
    } catch (e) {
      avisoGramatica = 'A verificação ortográfica avançada (LanguageTool) não respondeu; foram usadas apenas as regras locais.'
    }
  }
  const marcasC1 = mesclarMarcas(locais, remotas)

  const repertorio = analisarRepertorio(textoLimpo, pars)
  const projeto = analisarProjeto(textoLimpo, pars, temaAnalise, temaRadicais)
  const coesao = analisarCoesao(textoLimpo, pars, temaRadicais)
  const proposta = analisarProposta(textoLimpo, pars, temaGrupos)
  const narrativo = (textoLimpo.match(RE_NARRATIVA) || []).length >= 2

  const anulacao = verificarAnulacao(textoLimpo, stats, temaAnalise)

  const competencias = {
    c1: avaliarC1(marcasC1, stats),
    c2: avaliarC2({ texto: textoLimpo, pars, temaAnalise, repertorio, projeto, narrativo }),
    c3: avaliarC3({ pars, temaAnalise, projeto, repertorio }),
    c4: avaliarC4(coesao, pars),
    c5: avaliarC5(proposta, temaAnalise),
  }
  if (anulacao) {
    for (const c of Object.values(competencias)) {
      c.nota = 0
      c.nivel = 0
    }
  }

  // ---- marcações exibidas no texto
  const marcas = [
    ...marcasC1,
    ...repertorio.itens.map((r) => ({
      id: `rep-${r.inicio}`, inicio: r.inicio, fim: r.fim, trecho: r.trecho, competencia: 2, natureza: 'acerto', tipo: 'repertório',
      msg: r.fraco
        ? `Repertório (${r.tipo}). Para ser produtivo, cite a fonte e explique a relação com o seu argumento.`
        : `Repertório sociocultural (${r.tipo}). Ótimo — garanta que ele esteja articulado ao argumento do parágrafo.`,
      sugestoes: [],
    })),
    ...(projeto.teseTrecho ? [{
      id: `tese-${projeto.teseTrecho.inicio}`, ...projeto.teseTrecho, trecho: textoLimpo.slice(projeto.teseTrecho.inicio, projeto.teseTrecho.fim),
      competencia: 3, natureza: 'info', tipo: 'tese', msg: 'Trecho identificado como a tese (ponto de vista) da redação.', sugestoes: [],
    }] : []),
    ...coesao.conectivos.map((c) => ({
      id: `con-${c.inicio}`, inicio: c.inicio, fim: c.fim, trecho: c.trecho, competencia: 4, natureza: 'acerto', tipo: 'conectivo',
      msg: `Conectivo de ${c.item.tipo}.${(coesao.contagem[c.termo.toLowerCase()] || 0) >= 3 ? ' Atenção: usado muitas vezes no texto.' : ''}`, sugestoes: [],
    })),
    ...coesao.repeticoes.flatMap((r) => r.ocorrencias.map((o) => ({
      id: `repet-${o.inicio}`, inicio: o.inicio, fim: o.fim, trecho: o.palavra, competencia: 4, natureza: 'erro', tipo: 'repetição',
      msg: `Repetição: "${r.palavra}" e variações aparecem ${r.vezes} vezes. Use sinônimos, pronomes ou expressões equivalentes.`, sugestoes: [],
    }))),
    ...Object.entries(proposta.elementos).filter(([, v]) => v).map(([k, v]) => ({
      id: `c5-${k}-${v.inicio}`, inicio: v.inicio, fim: v.fim, trecho: v.trecho, competencia: 5, natureza: 'acerto', tipo: k,
      msg: { agente: 'Agente: quem executa a proposta.', acao: 'Ação: o que deve ser feito.', meio: 'Meio/modo: como a ação será executada.', finalidade: 'Finalidade: o objetivo da ação.', detalhamento: 'Detalhamento: informação que especifica um dos elementos.' }[k],
      sugestoes: [],
    })),
    ...(proposta.violacaoDH ? [{
      id: `dh-${proposta.violacaoDH.inicio}`, ...proposta.violacaoDH, competencia: 5, natureza: 'erro', tipo: 'direitos humanos',
      msg: 'Proposta que desrespeita os direitos humanos — zera a Competência 5.', sugestoes: [],
    }] : []),
  ].sort((a, b) => a.inicio - b.inicio)

  const notas = Object.fromEntries(Object.entries(competencias).map(([k, v]) => [k, v.nota]))
  const total = Object.values(notas).reduce((a, b) => a + b, 0)

  const avisos = []
  if (avisoGramatica) avisos.push(avisoGramatica)
  if (stats.linhas > MAX_LINHAS) avisos.push(`O texto ocuparia cerca de ${stats.linhas} linhas — mais que as 30 da folha oficial. Na prova, o excedente não é considerado.`)
  if (!tema) avisos.push('Nenhum tema foi informado: a aderência ao tema não pôde ser verificada.')

  return {
    id: gerarId(),
    criadoEm: new Date().toISOString(),
    tema: tema ? { id: tema.id || null, titulo: tema.titulo } : null,
    texto: textoLimpo,
    total,
    notas,
    competencias,
    anulacao,
    marcas,
    avisos,
    fonte: fonteGramatica,
    origem,
    analise: {
      estatisticas: stats,
      tema: temaAnalise,
      repertorio: repertorio.itens.map(({ trecho, tipo, paragrafo, fraco }) => ({ trecho, tipo, paragrafo, fraco })),
      coesao: {
        conectivos: Object.entries(coesao.contagem).sort((a, b) => b[1] - a[1]),
        variedade: coesao.variedade,
        transicoes: coesao.transicoes,
        transicoesOk: coesao.transicoesOk,
        repeticoes: coesao.repeticoes.map(({ palavra, vezes }) => ({ palavra, vezes })),
        referenciais: coesao.referenciais,
      },
      proposta: {
        elementos: Object.fromEntries(Object.entries(proposta.elementos).map(([k, v]) => [k, v ? v.trecho : null])),
        quantidade: proposta.quantidade,
        relacionadaTema: proposta.relacionadaTema,
      },
      projeto: {
        tese: projeto.tese, anuncio: projeto.anuncio, conclusaoRetoma: projeto.conclusaoRetoma,
        desenvolvimento: projeto.devInfo,
      },
    },
  }
}

export function classificacao(total) {
  if (total >= 900) return { rotulo: 'Excelente', cor: 'emerald' }
  if (total >= 700) return { rotulo: 'Muito bom', cor: 'tinta' }
  if (total >= 500) return { rotulo: 'Regular', cor: 'amber' }
  if (total > 0) return { rotulo: 'Precisa melhorar', cor: 'rose' }
  return { rotulo: 'Nota zero', cor: 'rose' }
}

export { normalizar }
