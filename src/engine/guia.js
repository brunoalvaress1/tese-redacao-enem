// Checklists em tempo real para o modo Redação Guiada.
import { paragrafos, contarPalavras, encontrarExpressoes, sentencas } from './texto.js'
import { CONECTIVOS } from './dados/conectivos.js'
import { analisarRepertorio, analisarProposta, RE_TESE, RE_ANUNCIO, TIPOS_ARGUMENTATIVOS } from './competencias.js'
import { analisarTema, gruposDoTema } from './tema.js'

const testar = (re, t) => {
  re.lastIndex = 0
  return re.test(t)
}

function base(texto, tema) {
  const t = texto.trim()
  const pars = t ? [{ texto: t, inicio: 0, fim: t.length }] : []
  const rep = t ? analisarRepertorio(t, pars) : { itens: [] }
  const temaOk = !tema || (t && analisarTema(t, tema).encontrados.length > 0)
  const conectivos = t ? encontrarExpressoes(t, CONECTIVOS) : []
  const iniciaConectivo = conectivos.some((c) => c.inicio < 25) || /^(?:Esse|Essa|Tal|Diante|Nesse|Nessa|Sob)\b/u.test(t)
  return { t, pars, rep, temaOk, conectivos, iniciaConectivo, palavras: contarPalavras(t), frases: t ? sentencas(t).length : 0 }
}

export const ETAPAS_GUIADA = [
  {
    id: 'introducao', titulo: 'Introdução', meta: [60, 100],
    objetivo: 'Apresente o tema, posicione-se (tese) e anuncie os dois argumentos que serão desenvolvidos.',
    estrutura: ['Contextualização com repertório (autor, lei, fato histórico, dado)', 'Apresentação do problema ligado ao tema', 'Tese + anúncio dos 2 argumentos'],
    modelos: [
      'Segundo o filósofo ___, "___". Sob essa ótica, ',
      'A Constituição Federal de 1988 assegura a todos os cidadãos o direito a ___. No entanto, ',
      'Tal cenário é motivado, sobretudo, pela ___ e pela ___.',
    ],
  },
  {
    id: 'desenvolvimento1', titulo: '1º desenvolvimento', meta: [80, 120],
    objetivo: 'Desenvolva o primeiro argumento anunciado: explique a causa, fundamente com repertório e mostre a consequência.',
    estrutura: ['Tópico frasal (retoma o 1º argumento)', 'Fundamentação com repertório', 'Explicação: causa → consequência', 'Fechamento ligado à tese'],
    modelos: ['Em primeiro lugar, cabe destacar que ', 'Isso ocorre porque ', 'Dessa forma, '],
  },
  {
    id: 'desenvolvimento2', titulo: '2º desenvolvimento', meta: [80, 120],
    objetivo: 'Desenvolva o segundo argumento com a mesma lógica, usando um repertório diferente.',
    estrutura: ['Tópico frasal (retoma o 2º argumento)', 'Fundamentação com novo repertório', 'Explicação e exemplificação', 'Fechamento ligado à tese'],
    modelos: ['Além disso, ', 'Nesse sentido, segundo dados do ___, ', 'Consequentemente, '],
  },
  {
    id: 'conclusao', titulo: 'Conclusão', meta: [70, 110],
    objetivo: 'Retome a tese e proponha uma intervenção completa, com os 5 elementos.',
    estrutura: ['Retomada da tese', 'Agente + ação', 'Meio/modo', 'Finalidade', 'Detalhamento de um dos elementos'],
    modelos: [
      'Portanto, é imprescindível ___. Para isso, ',
      'o Ministério da ___, órgão responsável por ___, deve ',
      'por meio de ___, a fim de ___.',
    ],
  },
]

/** Retorna os itens do checklist de uma etapa. */
export function checarEtapa(etapaId, texto, tema) {
  const b = base(texto, tema)
  const [min] = ETAPAS_GUIADA.find((e) => e.id === etapaId)?.meta || [60]
  const tamanho = { rotulo: `Pelo menos ${min} palavras (${b.palavras})`, ok: b.palavras >= min }
  const temaItem = { rotulo: 'Menciona o tema', ok: !!b.t && b.temaOk }

  if (etapaId === 'introducao') {
    return [
      temaItem,
      { rotulo: 'Repertório sociocultural', ok: b.rep.itens.some((r) => !r.fraco) },
      { rotulo: 'Tese (posicionamento)', ok: !!b.t && testar(RE_TESE, b.t) },
      { rotulo: 'Anúncio dos argumentos', ok: !!b.t && testar(RE_ANUNCIO, b.t) },
      tamanho,
    ]
  }
  if (etapaId === 'desenvolvimento1' || etapaId === 'desenvolvimento2') {
    return [
      { rotulo: 'Começa com conectivo', ok: b.iniciaConectivo },
      temaItem,
      { rotulo: 'Repertório para fundamentar', ok: b.rep.itens.length > 0 },
      { rotulo: 'Operadores argumentativos (causa/consequência)', ok: b.conectivos.some((c) => c.inicio >= 25 && TIPOS_ARGUMENTATIVOS.has(c.item.tipo)) },
      { rotulo: 'Pelo menos 3 frases', ok: b.frases >= 3 },
      tamanho,
    ]
  }
  // conclusão
  const prop = b.t ? analisarProposta(b.t, b.pars, gruposDoTema(tema)) : { elementos: {} }
  const e = prop.elementos || {}
  return [
    { rotulo: 'Começa com conectivo conclusivo', ok: b.iniciaConectivo },
    { rotulo: 'Agente (quem?)', ok: !!e.agente, trecho: e.agente?.trecho },
    { rotulo: 'Ação (o quê?)', ok: !!e.acao, trecho: e.acao?.trecho },
    { rotulo: 'Meio/modo (como?)', ok: !!e.meio, trecho: e.meio?.trecho },
    { rotulo: 'Finalidade (para quê?)', ok: !!e.finalidade, trecho: e.finalidade?.trecho },
    { rotulo: 'Detalhamento', ok: !!e.detalhamento, trecho: e.detalhamento?.trecho },
    temaItem,
  ]
}

export function montarTexto(partes) {
  return ETAPAS_GUIADA.map((e) => (partes[e.id] || '').trim().replace(/\s*\n+\s*/g, ' ')).filter(Boolean).join('\n')
}

export { paragrafos }
