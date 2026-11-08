// Diagnóstico da redação: erros e pontos de melhoria localizados por parágrafo, com exemplos e prioridades.
// É recalculado a partir do texto, então funciona também para correções antigas.
import { paragrafos, palavras, radical, contarPalavras, estimarLinhas, MAX_LINHAS } from './texto.js'
import { analisarTema, gruposDoTema } from './tema.js'
import { analisarRepertorio, analisarProjeto, analisarCoesao, analisarProposta } from './competencias.js'
import { buscarTema } from '../data/temas.js'

export const ROTULO_TIPO = {
  ortografia: 'Ortografia', acentuação: 'Acentuação', crase: 'Crase', concordância: 'Concordância', regência: 'Regência',
  pontuação: 'Pontuação', informalidade: 'Linguagem informal', sintaxe: 'Estrutura da frase', gramática: 'Gramática',
  estilo: 'Estilo', repetição: 'Repetição', 'direitos humanos': 'Direitos humanos', 'apontado pela IA': 'Apontado pela IA',
}

// Sinônimos para trocar palavras repetidas (radical → sugestões)
const SINONIMOS = {
  socied: ['população', 'coletividade', 'corpo social'], problem: ['entrave', 'impasse', 'questão', 'desafio'],
  pesso: ['indivíduos', 'cidadãos', 'população'], joven: ['juventude', 'adolescentes', 'essa parcela da população'],
  jove: ['juventude', 'adolescentes'], garant: ['assegurar', 'efetivar', 'promover'], import: ['relevante', 'fundamental', 'essencial'],
  govern: ['Estado', 'poder público', 'esfera governamental'], brasil: ['país', 'território nacional'],
  educ: ['ensino', 'formação'], prote: ['amparo', 'segurança', 'salvaguarda'], tecnolog: ['recursos digitais', 'ferramentas tecnológicas'],
  internet: ['rede', 'ambiente virtual', 'meio digital'], mulher: ['população feminina', 'elas', 'brasileiras'],
  crianc: ['infância', 'público infantil', 'menores'], direit: ['garantia', 'prerrogativa'], falt: ['ausência', 'carência', 'escassez'],
  desafi: ['entrave', 'obstáculo', 'impasse'], public: ['coletivo', 'estatal', 'governamental'], digit: ['virtual', 'on-line', 'tecnológico'],
  saud: ['bem-estar', 'qualidade de vida'], redes: ['plataformas', 'mídias sociais'], cidad: ['indivíduo', 'brasileiro', 'sujeito'],
  violenc: ['agressão', 'hostilidade'], idos: ['pessoas da terceira idade', 'população idosa'], cultur: ['tradições', 'manifestações culturais'],
}
const sinonimosDe = (palavra) => {
  const r = radical(palavra)
  const chave = Object.keys(SINONIMOS).find((k) => r.startsWith(k) || k.startsWith(r))
  return chave ? SINONIMOS[chave] : ['um sinônimo', 'um pronome (ele, isso, tal)', 'uma expressão que retome a ideia']
}

const item = (tipo, competencia, titulo, detalhe, extra = {}) => ({ tipo, competencia, titulo, detalhe, ...extra })

/**
 * @param {object} r resultado de corrigirRedacao
 * @returns {{ prioridades: object[], porParagrafo: object[], gerais: object[], ganhoPossivel: number }}
 */
export function diagnosticar(r) {
  const texto = r.texto || ''
  const pars = paragrafos(texto)
  const n = pars.length
  const tema = r.tema?.id ? buscarTema(r.tema.id) : r.tema ? { id: null, titulo: r.tema.titulo } : null
  const temaGrupos = gruposDoTema(tema)
  const temaRadicais = new Set([
    ...temaGrupos.flatMap((g) => g.termos.flatMap((t) => t.split(/\s+/).map((w) => radical(w)))),
    ...palavras(tema?.titulo || '').filter((p) => p.norm.length > 3).map((p) => radical(p.palavra)),
  ])
  const temaAnalise = analisarTema(texto, tema)
  const repertorio = analisarRepertorio(texto, pars)
  const projeto = analisarProjeto(texto, pars, temaAnalise, temaRadicais)
  const coesao = analisarCoesao(texto, pars, temaRadicais)
  const proposta = analisarProposta(texto, pars, temaGrupos)

  const rotulo = (i) => (i === 0 ? 'Introdução' : n >= 3 && i === n - 1 ? 'Conclusão' : `${i + 1}º parágrafo · desenvolvimento`)
  const porParagrafo = pars.map((p, i) => ({ indice: i, rotulo: rotulo(i), inicio: p.texto.slice(0, 90), erros: [], melhorias: [] }))
  const gerais = []

  // ---- erros marcados no texto (C1, repetições, direitos humanos, IA)
  for (const m of r.marcas || []) {
    if (m.natureza !== 'erro') continue
    const i = pars.findIndex((p) => m.inicio >= p.inicio && m.inicio <= p.fim)
    const e = item('erro', m.competencia, ROTULO_TIPO[m.tipo] || m.tipo, m.msg, { trecho: m.trecho, correcao: m.sugestoes?.[0] || null, marcaId: m.id })
    if (m.tipo === 'repetição') continue // tratado nos itens gerais, com sinônimos
    if (i >= 0) porParagrafo[i].erros.push(e)
    else gerais.push(e)
  }

  // ---- introdução
  if (n >= 1) {
    const intro = porParagrafo[0].melhorias
    if (!projeto.tese) intro.push(item('melhoria', 3, 'Deixe a tese explícita', 'O leitor precisa saber, já na introdução, qual é o seu ponto de vista sobre o problema.', { exemplo: '"Tal cenário é inaceitável e precisa ser enfrentado com urgência."' }))
    if (!projeto.anuncio) intro.push(item('melhoria', 3, 'Anuncie os dois argumentos', 'Diga, no fim da introdução, quais causas você vai desenvolver. Isso mostra um projeto de texto estratégico.', { exemplo: '"Esse problema é motivado, sobretudo, pela falta de… e pela…"' }))
    if (!repertorio.itens.some((x) => x.paragrafo === 0)) intro.push(item('melhoria', 2, 'Comece com um repertório', 'Abrir com uma referência legitimada valoriza a C2.', { exemplo: '"A Constituição Federal de 1988 garante…" ou "Segundo o filósofo…"' }))
    if (tema && temaAnalise.porParagrafo[0] === 0) intro.push(item('melhoria', 2, 'Cite o tema na introdução', 'Retome as palavras-chave do tema logo no primeiro parágrafo.'))
  }

  // ---- desenvolvimentos
  const devSemRep = new Set(repertorio.devSemRepertorio || [])
  for (let i = 1; i < n - (n >= 3 ? 1 : 0); i++) {
    const lista = porParagrafo[i].melhorias
    const d = projeto.devInfo[i - 1]
    if (coesao.semConectivo.includes(i)) lista.push(item('melhoria', 4, 'Comece o parágrafo com um conectivo', 'Sem um elemento de ligação, a passagem entre as ideias fica abrupta.', { exemplo: i === 1 ? '"Em primeiro lugar,", "Em primeiro plano,"' : '"Além disso,", "Ademais,", "Outrossim,"' }))
    if (devSemRep.has(i)) lista.push(item('melhoria', 2, 'Falta repertório neste parágrafo', 'Para C2 e C3 altas, cada desenvolvimento precisa de uma fonte legitimada, explicada e ligada ao argumento.', { exemplo: 'Um dado (IBGE, OMS), uma lei (artigo da Constituição, ECA) ou um autor — e diga como ele comprova o argumento.' }))
    if (d && d.sentencas <= 1) lista.push(item('melhoria', 3, 'Parágrafo de uma frase só', 'Um parágrafo precisa de tópico frasal + desenvolvimento. Junte esta frase ao parágrafo seguinte ou desenvolva a ideia com explicação e exemplo.'))
    else if (d && !d.desenvolvido) lista.push(item('melhoria', 3, `Parágrafo curto (${d.palavras} palavras)`, 'Desenvolva o argumento: causa → consequência → exemplo. O ideal é entre 70 e 100 palavras.'))
    if (d && d.marcadores === 0 && d.sentencas > 1) lista.push(item('melhoria', 3, 'Explique melhor o argumento', 'Use operadores que mostrem causa e consequência para encadear a explicação.', { exemplo: '"Isso ocorre porque…", "Consequentemente…", "Dessa forma…"' }))
    if (tema && temaAnalise.porParagrafo[i] === 0) lista.push(item('melhoria', 2, 'Ligue o parágrafo ao tema', 'Este parágrafo não retoma as palavras-chave do tema; o corretor pode entender que você saiu do recorte.'))
  }

  // ---- conclusão / proposta
  if (n >= 3) {
    const lista = porParagrafo[n - 1].melhorias
    if (coesao.semConectivo.includes(n - 1)) lista.push(item('melhoria', 4, 'Use um conectivo de conclusão', 'Sinalize que o texto está chegando ao fim.', { exemplo: '"Portanto,", "Diante do exposto,", "Em suma,"' }))
    const e = proposta.elementos || {}
    const agente = e.agente?.trecho || 'o Ministério da Educação'
    const faltas = [
      ['agente', 'Falta o agente (quem vai agir)', 'Diga claramente quem executa a proposta.', '"o Ministério da Educação", "as escolas", "a mídia"'],
      ['acao', 'Falta a ação (o que fazer)', 'Use um verbo de ação explícito depois do agente.', `"${agente} deve criar/promover/ampliar…"`],
      ['meio', 'Falta o meio/modo (como)', 'Explique por meio de que a ação será realizada.', '"…por meio de campanhas nas escolas e nas redes sociais…"'],
      ['finalidade', 'Falta a finalidade (para quê)', 'Diga qual resultado a ação busca.', '"…a fim de reduzir o problema e garantir…"'],
      ['detalhamento', 'Falta o detalhamento', 'Explique melhor um dos elementos (o agente, a ação ou o meio).', `"${agente}, órgão responsável por…, deve…" ou "…como palestras e oficinas…"`],
    ]
    if (proposta.violacaoDH) lista.push(item('melhoria', 5, 'Proposta fere os direitos humanos', 'Propostas como pena de morte ou tortura zeram a C5. Proponha soluções que respeitem a dignidade de todos.'))
    else for (const [k, titulo, detalhe, exemplo] of faltas) if (!e[k]) lista.push(item('melhoria', 5, titulo, detalhe, { exemplo }))
    if (e.acao?.nominal) lista.push(item('melhoria', 5, 'Deixe a ação explícita', `A ação aparece só como substantivo ("${e.acao.trecho}"). Use um verbo.`, { exemplo: `"${agente} deve promover ${e.acao.trecho}…"` }))
  } else if (n > 0) {
    gerais.push(item('melhoria', 2, 'Organize o texto em 4 parágrafos', 'O texto dissertativo-argumentativo precisa de introdução, dois desenvolvimentos e conclusão com proposta de intervenção.'))
  }

  // ---- texto todo
  for (const rep of coesao.repeticoes.slice(0, 4)) {
    gerais.push(item('melhoria', 4, `"${rep.palavra}" repetida ${rep.vezes} vezes`, 'Repetições pesam na C4. Troque algumas ocorrências.', { exemplo: sinonimosDe(rep.palavra).map((s) => `"${s}"`).join(', ') }))
  }
  if (coesao.variedade < 8 && n >= 3) gerais.push(item('melhoria', 4, `Só ${coesao.variedade} conectivo(s) diferente(s)`, 'Diversifique os elementos de ligação ao longo do texto.', { exemplo: '"ademais", "outrossim", "nesse sentido", "por conseguinte", "haja vista"' }))
  const nPal = contarPalavras(texto)
  const linhas = r.analise?.estatisticas?.linhasFolha ?? estimarLinhas(texto)
  if (nPal < 250 && nPal > 0) gerais.push(item('melhoria', 3, `Texto curto (${nPal} palavras, ≈${linhas} linhas)`, 'Redações nota alta costumam ocupar de 25 a 30 linhas. Aprofunde os argumentos.'))
  if (linhas > MAX_LINHAS) gerais.push(item('melhoria', 1, `Passa de 30 linhas (≈${linhas})`, 'Na folha oficial, o que passar da linha 30 não é lido. Corte repetições e frases longas.'))
  if (temaAnalise.status === 'parcial' && temaAnalise.ausentes?.length) gerais.push(item('melhoria', 2, 'Aborde todo o recorte do tema', `Faltou discutir: ${temaAnalise.ausentes.join(', ')}.`))
  if (temaAnalise.status === 'tangencia') gerais.push(item('melhoria', 2, 'O texto tangencia o tema', `Você falou do assunto geral, mas não do recorte proposto${temaAnalise.ausentes?.length ? ` (faltou: ${temaAnalise.ausentes.join(', ')})` : ''}.`))

  // ---- prioridades: competências com mais pontos a ganhar e a 1ª ação de cada uma
  const todos = [...porParagrafo.flatMap((p) => [...p.erros.map((x) => ({ ...x, paragrafo: p })), ...p.melhorias.map((x) => ({ ...x, paragrafo: p }))]), ...gerais]
  const facilidade = { 5: 0, 4: 1, 1: 2, 2: 3, 3: 4 }
  const prioridades = []
  if (r.anulacao) {
    prioridades.push({ competencia: 0, ganho: null, titulo: `Redação anulada: ${r.anulacao.motivo}`, detalhe: r.anulacao.detalhe })
  } else {
    const gaps = ['c1', 'c2', 'c3', 'c4', 'c5'].map((k, idx) => ({ k, c: idx + 1, gap: 200 - (r.notas?.[k] ?? 200) }))
      .filter((g) => g.gap > 0)
      .sort((a, b) => b.gap - a.gap || facilidade[a.c] - facilidade[b.c])
    for (const g of gaps.slice(0, 3)) {
      const erros = todos.filter((x) => x.competencia === g.c && x.tipo === 'erro')
      const acao = g.c === 1 && erros.length
        ? { titulo: `Corrija ${erros.length} erro(s) de português`, detalhe: [...new Set(erros.map((x) => x.titulo))].join(', ') + '. Veja os detalhes em cada parágrafo abaixo.' }
        : todos.find((x) => x.competencia === g.c && x.tipo === 'melhoria')
      if (acao) prioridades.push({ competencia: g.c, ganho: g.gap, titulo: acao.titulo, detalhe: acao.detalhe, exemplo: acao.exemplo, onde: acao.paragrafo?.rotulo })
    }
  }

  return { prioridades, porParagrafo, gerais, ganhoPossivel: Math.max(0, 1000 - (r.total || 0)) }
}
