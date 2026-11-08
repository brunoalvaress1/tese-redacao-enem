import { describe, it, expect } from 'vitest'
import { corrigirRedacao, estatisticas } from '../corretor.js'
import { verificarLocal } from '../gramatica.js'
import { analisarTema } from '../tema.js'
import { buscarTema, TEMAS } from '../../data/temas.js'
import { paragrafos, sentencas, estimarLinhas } from '../texto.js'
import * as A from './amostras.js'

const corrigir = (texto, temaId) => corrigirRedacao({ texto, tema: temaId ? buscarTema(temaId) : null, usarLanguageTool: false })
const tiposEm = (texto) => verificarLocal(texto).map((m) => m.regra)

describe('utilitários de texto', () => {
  it('divide parágrafos e sentenças', () => {
    const t = 'Primeira frase. Segunda frase!\nOutro parágrafo, com Dr. Silva aqui. Fim.'
    const p = paragrafos(t)
    expect(p).toHaveLength(2)
    expect(sentencas(p[0].texto)).toHaveLength(2)
    expect(sentencas(p[1].texto, p[1].inicio)).toHaveLength(2)
  })
  it('estima linhas da folha do ENEM', () => {
    expect(estimarLinhas('a'.repeat(140))).toBe(2)
    expect(estimarLinhas(A.FORTE_2023)).toBeGreaterThan(20)
  })
})

describe('competência 1 — regras locais', () => {
  const casos = [
    ['Eu acho que agente vai mudar isso.', 'agente-a-gente'],
    ['A educação, à partir de agora, muda.', 'crase-a-partir'],
    ['Haviam muitos problemas na cidade.', 'haviam'],
    ['É importante, mais não é suficiente.', 'mais-adversativo'],
    ['Todos têm direito a educação de qualidade.', 'crase-falta-regencia'],
    ['Além disso a sociedade precisa agir.', 'virgula-conectivo'],
    ['A educacao é essencial.', 'acento'],
    ['O Estado é responsavel por isso.', 'ortografia'],
    ['O dado é confiavel e a decisao foi tomada.', 'acento'],
    ['Fazem dez anos que isso ocorre.', 'fazem-anos'],
    ['Isso é muito importante pra sociedade.', 'informal'],
    ['eles tem muitos direitos.', 'eles-tem'],
    ['A situação onde vivemos é grave.', 'onde-tempo'],
    ['Isso é um mal hábito da população.', 'mal-substantivo'],
    ['O problema persiste. a sociedade se omite.', 'minuscula-inicio'],
  ]
  for (const [frase, regra] of casos) {
    it(`detecta "${regra}" em: ${frase}`, () => {
      expect(tiposEm(frase)).toContain(regra)
    })
  }
  it('não acusa formas corretas', () => {
    const corretas = 'Evidencia-se, portanto, que o agente responsável deve agir à medida que o problema cresce. Às vezes, há anos, a população tem acesso à educação. Isso influencia a sociedade.'
    expect(verificarLocal(corretas).filter((m) => m.peso >= 0.5)).toEqual([])
  })
  it('redação forte quase sem marcações locais', () => {
    const pontos = verificarLocal(A.FORTE_2023).reduce((t, m) => t + m.peso, 0)
    expect(pontos).toBeLessThanOrEqual(1)
  })
})

describe('aderência ao tema', () => {
  it('pleno, tangência e fuga', () => {
    expect(analisarTema(A.FORTE_2023, buscarTema('enem-2023')).status).toBe('pleno')
    expect(analisarTema(A.TANGENCIA_2023, buscarTema('enem-2023')).status).toBe('tangencia')
    expect(analisarTema(A.FUGA_OBESIDADE, buscarTema('in-desinformacao')).status).toBe('fuga')
  })
  it('tema livre digitado pelo estudante', () => {
    const r = analisarTema(A.FUGA_OBESIDADE, { titulo: 'O avanço da obesidade infantil no Brasil' })
    expect(r.status).toBe('pleno')
  })
  it('todos os temas do banco têm grupos válidos', () => {
    expect(TEMAS.length).toBeGreaterThanOrEqual(80)
    for (const t of TEMAS) {
      expect(t.grupos.length).toBeGreaterThanOrEqual(2)
      expect(new Set(TEMAS.map((x) => x.id)).size).toBe(TEMAS.length)
    }
  })
})

describe('correção completa', () => {
  it('redação forte recebe nota alta (≥ 880)', async () => {
    const r = await corrigir(A.FORTE_2023, 'enem-2023')
    expect(r.anulacao).toBeNull()
    expect(r.total).toBeGreaterThanOrEqual(880)
    expect(r.notas.c5).toBe(200)
    expect(r.notas.c2).toBeGreaterThanOrEqual(160)
    expect(r.analise.proposta.quantidade).toBe(5)
  })
  it('redação mediana com erros fica na faixa intermediária', async () => {
    const r = await corrigir(A.MEDIANA_DESINFORMACAO, 'in-desinformacao')
    expect(r.anulacao).toBeNull()
    expect(r.notas.c1).toBeLessThanOrEqual(80)
    expect(r.notas.c5).toBeLessThanOrEqual(80)
    expect(r.total).toBeGreaterThanOrEqual(280)
    expect(r.total).toBeLessThanOrEqual(640)
  })
  it('fuga ao tema zera a redação', async () => {
    const r = await corrigir(A.FUGA_OBESIDADE, 'in-desinformacao')
    expect(r.anulacao?.motivo).toMatch(/Fuga/)
    expect(r.total).toBe(0)
  })
  it('tangenciamento limita C2, C3 e C5 a 40', async () => {
    const r = await corrigir(A.TANGENCIA_2023, 'enem-2023')
    expect(r.anulacao).toBeNull()
    expect(r.notas.c2).toBe(40)
    expect(r.notas.c3).toBeLessThanOrEqual(40)
    expect(r.notas.c5).toBeLessThanOrEqual(40)
  })
  it('texto com até 7 linhas é insuficiente', async () => {
    const r = await corrigir(A.CURTA, 'in-desinformacao')
    expect(r.anulacao?.motivo).toMatch(/insuficiente/i)
    expect(r.total).toBe(0)
  })
  it('narrativa não atende ao tipo textual', async () => {
    const r = await corrigir(A.NARRATIVA, 'in-desinformacao')
    expect(r.anulacao?.motivo).toMatch(/dissertativo/)
  })
  it('desrespeito aos direitos humanos zera a C5', async () => {
    const r = await corrigir(A.DH_VIOLACAO, null)
    expect(r.notas.c5).toBe(0)
    expect(r.marcas.some((m) => m.tipo === 'direitos humanos')).toBe(true)
  })
  it('notas são sempre múltiplos de 40 entre 0 e 200', async () => {
    for (const texto of Object.values(A)) {
      const r = await corrigir(texto, null)
      for (const n of Object.values(r.notas)) {
        expect(n % 40).toBe(0)
        expect(n).toBeGreaterThanOrEqual(0)
        expect(n).toBeLessThanOrEqual(200)
      }
      expect(r.total).toBe(Object.values(r.notas).reduce((a, b) => a + b, 0))
    }
  })
  it('marcações apontam para trechos reais do texto', async () => {
    const r = await corrigir(A.MEDIANA_DESINFORMACAO, 'in-desinformacao')
    for (const m of r.marcas) {
      expect(m.inicio).toBeGreaterThanOrEqual(0)
      expect(m.fim).toBeLessThanOrEqual(r.texto.length)
      expect(m.fim).toBeGreaterThan(m.inicio)
    }
  })
  it('estatísticas básicas', () => {
    const s = estatisticas(A.FORTE_2023)
    expect(s.paragrafos).toBe(4)
    expect(s.palavras).toBeGreaterThan(300)
  })
})

describe('calibração adicional', () => {
  it('redação bem escrita sem repertório fica entre 680 e 840', async () => {
    const r = await corrigir(A.BOA_SEM_REPERTORIO_2019, 'enem-2019')
    expect(r.total).toBeGreaterThanOrEqual(680)
    expect(r.total).toBeLessThanOrEqual(840)
    expect(r.notas.c2).toBeLessThanOrEqual(120)
  })
})

describe('foto e temas', async () => {
  const { limparTranscricao } = await import('../../lib/ocr.js')
  const { temasPorPalavra, gerarTemaLivre, buscarTema, TODOS_TEMAS } = await import('../../data/temas.js')
  const { APOSTAS, diasParaProva } = await import('../../data/apostas.js')

  it('limpa transcrição: números de linha, hifenização e parágrafos', () => {
    const bruto = '1 A desinformação é um pro-\n2 blema grave no Brasil.\n3 Muitas pessoas acreditam em tudo.\n\n4 Além disso, faltam ações.'
    const t = limparTranscricao(bruto)
    expect(t).toBe('A desinformação é um problema grave no Brasil. Muitas pessoas acreditam em tudo.\nAlém disso, faltam ações.')
  })
  it('reconstrói parágrafos sem linha em branco pelo tamanho da linha', () => {
    const linhas = [
      'Em primeiro lugar, as redes sociais facilitam a divulgação de notícias',
      'falsas e boatos.',
      'Além disso, a falta de educação midiática nas escolas agrava o problema',
      'e precisa ser enfrentada.',
    ].join('\n')
    expect(limparTranscricao(linhas).split('\n')).toHaveLength(2)
  })
  it('sorteio por palavra-chave encontra temas e gera tema livre', () => {
    expect(temasPorPalavra('internet').length).toBeGreaterThan(2)
    const livre = gerarTemaLivre('mobilidade elétrica')
    expect(livre.livre).toBe(true)
    expect(livre.titulo).toMatch(/mobilidade elétrica/)
    expect(livre.grupos[0]).toMatch(/mobilida/)
  })
  it('apostas 2026 são válidas, com fontes e buscáveis por id', () => {
    expect(APOSTAS.length).toBeGreaterThanOrEqual(10)
    for (const a of APOSTAS) {
      expect(a.fontes.length).toBeGreaterThan(0)
      expect(a.porque.length).toBeGreaterThan(0)
      expect(buscarTema(a.id)).toBe(a)
    }
    expect(new Set(TODOS_TEMAS.map((t) => t.id)).size).toBe(TODOS_TEMAS.length)
    expect(diasParaProva(new Date('2026-11-07T12:00:00-03:00'))).toBe(1)
    expect(diasParaProva(new Date('2026-12-01T12:00:00-03:00'))).toBeNull()
  })
  it('aposta forte corrige com aderência ao tema', async () => {
    const tema = buscarTema('ap-eca-digital')
    const texto = A.FORTE_2023.replace(/trabalho de cuidado realizado pelas brasileiras/g, 'uso de redes sociais por crianças')
    const r = await corrigirRedacao({ texto, tema, usarLanguageTool: false })
    expect(['pleno', 'parcial', 'tangencia']).toContain(r.analise.tema.status)
  })
})

describe('ajustes a partir de redação real (nota humana 880)', async () => {
  const { avaliarLeitura } = await import('../../lib/ocr.js')
  it('detecta concordância "Ministério Pública" e "o vício dessas plataformas têm"', () => {
    const regras = verificarLocal('Cabe ao poder público, na figura do Ministério Pública, agir. Desse modo, o vício dessas plataformas têm se tornado frequente.').map((m) => m.regra)
    expect(regras).toContain('concordancia-publico')
    expect(regras).toContain('sujeito-singular-tem')
    expect(verificarLocal('A maioria das pessoas têm acesso.').map((m) => m.regra)).not.toContain('sujeito-singular-tem')
  })
  it('C5: verbo dentro da finalidade não conta como ação; ação implícita limita a 160', async () => {
    const texto = A.FORTE_2023.split('\n').slice(0, 3).join('\n') + '\nPortanto, é necessária a ação conjunta do Estado e da sociedade para mitigá-los. Nesse âmbito, cabe ao poder público, em parceria com a Mídia, por intermédio de palestras no ambiente escolar e campanhas nas redes sociais, a fim de preservar a saúde dos jovens e promover o uso responsável das plataformas.'
    const r = await corrigirRedacao({ texto, tema: null, usarLanguageTool: false })
    expect(r.analise.proposta.elementos.agente).toBe('poder público')
    expect(r.analise.proposta.elementos.acao).toBe('palestras')
    expect(r.notas.c5).toBe(160)
  })
  it('C5: finalidade com "para" antes do verbo da ação', async () => {
    const texto = A.FORTE_2023.split('\n').slice(0, 3).join('\n') + '\nPortanto, cabe ao Ministério da Educação, para combater a desigualdade, investir em creches públicas, por meio de verbas federais, como forma de apoio às cuidadoras.'
    const r = await corrigirRedacao({ texto, tema: buscarTema('enem-2023'), usarLanguageTool: false })
    expect(r.analise.proposta.elementos.acao).toBe('investir')
  })
  it('detector de leitura ruim: lixo de OCR x texto real', () => {
    const lixo = 'Sr o faso? adontdoo: NT AA o AbSbaSTA Et OI Ao E à SS oco oe gecatot oo AMET Á, É s ecos decerto LON ANA ANA ut ullio SCORES CSASSAAADAAA SISTER Y ME ES a P SS Pd faca enem PR VFV TEMA tes Us sampa dor seda seco'
    expect(avaliarLeitura(lixo, 37).ok).toBe(false)
    expect(avaliarLeitura(A.FORTE_2023, 92).ok).toBe(true)
  })
})

describe('sugestão de temas para a foto', async () => {
  const { sugerirTemas } = await import('../sugestoes.js')
  it('tema oficial escrito igual é reconhecido em 1º lugar', () => {
    const s = sugerirTemas({ temaLido: 'Desafios para a valorização da herança africana no Brasil' })
    expect(s[0].tema.id).toBe('enem-2024')
    expect(s[0].pontos).toBeGreaterThanOrEqual(1.75)
  })
  it('sem tema na foto, sugere pelo conteúdo do texto', () => {
    const s = sugerirTemas({ texto: A.FORTE_2023 })
    expect(s.map((x) => x.tema.id)).toContain('enem-2023')
  })
})

describe('calibração com redação real (outro corretor: 880)', () => {
  const tema = { id: null, titulo: 'Os impactos das redes sociais na saúde mental dos adolescentes brasileiros', livre: true }
  it('dá 880, com ou sem verbo explícito na proposta e com tema do site', async () => {
    for (const [texto, t] of [
      [A.REAL_880, tema],
      [A.REAL_880.replace('e informas sobre', 'e informar sobre'), tema],
      [A.REAL_880.replace('e informas sobre', 'e informar sobre'), buscarTema('in-saude-mental-jovens')],
    ]) {
      const r = await corrigirRedacao({ texto, tema: t, usarLanguageTool: false })
      expect(r.total).toBe(880)
    }
  })
  it('C2 só dá 200 com repertório em todos os desenvolvimentos', async () => {
    const r = await corrigirRedacao({ texto: A.REAL_880, tema, usarLanguageTool: false })
    expect(r.notas.c2).toBe(160)
    expect(r.competencias.c2.melhorias.join(' ')).toMatch(/3º parágrafo não traz repertório/)
  })
})

describe('calibração com a 2ª redação real', () => {
  const tema = { id: null, titulo: 'Os desafios para garantir a proteção de crianças e adolescentes no ambiente digital brasileiro', livre: true }
  it('detecta os 3 desvios de C1 e o agente correto da proposta', async () => {
    const r = await corrigirRedacao({ texto: A.REAL_2, tema, usarLanguageTool: false })
    const regras = r.marcas.filter((m) => m.competencia === 1).map((m) => m.regra)
    expect(regras).toEqual(expect.arrayContaining(['sintaxe-lei-dever', 'virgula-verbo-complemento', 'virgula-adversativa']))
    expect(r.analise.proposta.elementos.agente).toBe('Governo Federal')
  })
  it('nota fica bem abaixo de 920 (entre 760 e 840), com 4 ou 5 parágrafos e com o tema do site', async () => {
    const quatro = A.REAL_2.replace('plataformas online.\nSegundo', 'plataformas online. Segundo')
    for (const [texto, t] of [[A.REAL_2, tema], [quatro, tema], [quatro, buscarTema('ap-eca-digital')]]) {
      const r = await corrigirRedacao({ texto, tema: t, usarLanguageTool: false })
      expect(r.total).toBeGreaterThanOrEqual(760)
      expect(r.total).toBeLessThanOrEqual(840)
    }
  })
  it('as regras novas não acusam construções corretas', () => {
    const certas = 'A Constituição Federal de 1988 garante, em seu artigo 6º, a proteção à infância. Segundo a Constituição, no artigo 227, é dever do Estado proteger. O Estado garante, a todos os cidadãos, o direito à saúde. Isso é grave; entretanto, há soluções.'
    expect(verificarLocal(certas).filter((m) => ['sintaxe-lei-dever', 'virgula-verbo-complemento', 'virgula-adversativa'].includes(m.regra))).toEqual([])
  })
})
