// Possíveis temas para o ENEM 2026 — análise feita em 07/11/2026.
// Ninguém conhece o tema antes da prova (é sigiloso). Estas são apostas fundamentadas em:
// (1) padrões dos temas do INEP, (2) leis e marcos de 2025–2026, (3) apostas de professores publicadas na imprensa.

export const PROVA = {
  ano: 2026,
  redacao: '2026-11-08T13:30:00-03:00', // 1º dia (Edital nº 64/2026 do INEP)
  segundoDia: '2026-11-15',
}

export const ANALISE = {
  atualizadoEm: '07/11/2026',
  padroes: [
    'Desde 2020, o INEP prioriza grupos sociais invisibilizados ou vulneráveis: pessoas com doença mental (2020), sem registro civil (2021), povos tradicionais (2022), mulheres cuidadoras (2023), herança africana (2024) e idosos (2025).',
    'A formulação mais comum é "Desafios para…" ou "Perspectivas acerca de…", com recorte bem específico — quem só fala do assunto geral tangencia.',
    'Tecnologia não aparece desde 2018 (dados na internet), o que reforça apostas digitais em 2026.',
    'Temas costumam dialogar com leis recentes e políticas públicas em evidência no ano.',
  ],
  metodo: 'Cruzamos leis e marcos de 2025–2026, dados oficiais divulgados no período, o histórico de temas do INEP e as apostas publicadas por professores em veículos de imprensa.',
}

const fonte = (nome, url) => ({ nome, url })
const F = {
  g1: fonte('G1 via Agenda do Poder — 11 temas apontados por professores', 'https://agendadopoder.com.br/enem-2026-professores-apontam-11-temas-que-podem-cair-na-redacao-deste-domingo/'),
  estrategia: fonte('Estratégia Vestibulares — palpites dos professores', 'https://vestibulares.estrategia.com/portal/materias/redacao/tema-de-redacao-enem-2026-veja-os-palpites-dos-professores-do-estrategia-vestibulares/'),
  ecaDigital: fonte('Poder360 — ECA Digital entra em vigor', 'https://www.poder360.com.br/poder-governo/eca-digital-entra-em-vigor-nesta-3a-feira-entenda-o-que-muda/'),
  ecaDecretos: fonte('Machado Meyer — ECA Digital e seus decretos', 'https://www.machadomeyer.com.br/pt/inteligencia-juridica/publicacoes-ij/direito-digital/estatuto-digital-da-crianca-e-do-adolescente-e-seus-decretos'),
  censoAutismo: fonte('Estado de Minas — Censo do IBGE revela dados inéditos sobre autismo', 'https://www.em.com.br/gerais/2025/05/7155140-censo-do-ibge-revela-dados-ineditos-sobre-autismo-no-brasil.html'),
  matriculasTea: fonte('Extra Classe — matrículas de estudantes autistas', 'https://www.extraclasse.org.br/educacao/2025/04/matriculas-de-estudantes-com-autistas-cresceram-444-em-um-ano/'),
  orgulhoAutista: fonte('O Imparcial — Dia Nacional do Orgulho Autista', 'https://oimparcial.com.br/noticias/2026/06/brasil-passa-a-celebrar-oficialmente-o-dia-nacional-do-orgulho-autista/'),
  pl2338: fonte('Congresso Nacional — PL 2338/2023 (marco da IA)', 'https://www.congressonacional.leg.br/web/atividade/materias/-/materia/157233'),
  bets: fonte('Monitor Mercantil — gastos mensais com bets', 'https://monitormercantil.com.br/bc-ate-r-30-bi-por-mes-de-apostas-nas-bets/'),
  betsDebate: fonte('Bem Paraná — debate sobre bets e endividamento', 'https://www.bemparana.com.br/esportes/apostas-nao-aumentam-endividamento-no-brasil-mas-setor-enfrenta-desafios-regulatorios/'),
  mariaPenha: fonte('TJRJ — 20 anos da Lei Maria da Penha', 'https://www.tjrj.jus.br/web/portal-conhecimento/noticias/noticia/-/visualizar-conteudo/5736540/406515429'),
  edital: fonte('Exame — datas do ENEM 2026', 'https://exame.com/brasil/enem-2026-veja-datas-horarios-local-de-prova-e-o-que-muda-neste-ano/'),
}

const a = (id, titulo, eixo, nivel, grupos, porque, repertorios, fontes) => ({
  id, titulo, eixo, nivel, grupos, porque, repertorios, fontes, origem: 'Aposta 2026', aposta: true,
})

export const APOSTAS = [
  a('ap-eca-digital', 'Desafios para a proteção de crianças e adolescentes no ambiente digital', 'Tecnologia e comunicação', 'Forte',
    ['criança|adolescen|infância|infantil|menores|jovens', 'digital|internet|redes sociais|plataforma|online|virtual|tela'],
    [
      'O ECA Digital (Lei 15.211/2025) entrou em vigor em 17/03/2026, e decretos de 18/03/2026 proíbem práticas como rolagem infinita e autoplay para menores.',
      'A ANPD passou a fiscalizar plataformas em 2026 — tema de política pública em evidência no ano da prova.',
      'É uma das apostas mais citadas por professores (G1 e Estratégia Vestibulares).',
    ],
    ['ECA Digital (Lei 15.211/2025)', 'Estatuto da Criança e do Adolescente, art. 4º', 'Byung-Chul Han — "Sociedade do Cansaço"', 'Pesquisa TIC Kids Online (Cetic.br)'],
    [F.ecaDigital, F.ecaDecretos, F.estrategia]),
  a('ap-ia', 'Os desafios do uso ético da inteligência artificial na sociedade brasileira', 'Tecnologia e comunicação', 'Forte',
    ['inteligência artificial|ia|algoritm|automaç|chatgpt|tecnolog', 'étic|responsab|regula|privacidade|trabalho|educa|desinforma'],
    [
      'É a aposta mais repetida nas listas de professores em 2026.',
      'O marco legal da IA (PL 2338/2023) foi aprovado no Senado e seguiu em debate na Câmara durante 2026.',
      'Professores relatam que o próprio INEP tem divulgado conteúdos sobre tecnologia na educação.',
    ],
    ['PL 2338/2023 (marco legal da IA)', 'Shoshana Zuboff — "capitalismo de vigilância"', 'Yuval Harari — "21 lições para o século 21"', 'LGPD'],
    [F.g1, F.estrategia, F.pl2338]),
  a('ap-neurodivergentes', 'Desafios para a inclusão de pessoas neurodivergentes na sociedade brasileira', 'Cidadania e direitos', 'Forte',
    ['neurodiverg|autis|tea|tdah|neurodiversidade|espectro', 'inclus|acessib|direit|preconceito|capacitis|escola|trabalho'],
    [
      'O Censo 2022 do IBGE trouxe pela primeira vez dados de autismo: cerca de 2,4 milhões de pessoas (1,2% da população).',
      'Estudantes com TEA chegaram a 918 mil no Censo Escolar de 2024, segundo o MEC.',
      'A Lei 15.365/2026 instituiu o Dia Nacional do Orgulho Autista (18 de junho). Encaixa no padrão do INEP de grupos invisibilizados.',
    ],
    ['Lei Berenice Piana (12.764/2012)', 'Lei Brasileira de Inclusão (13.146/2015)', 'Censo 2022 — IBGE', 'Erving Goffman — "Estigma"'],
    [F.censoAutismo, F.matriculasTea, F.orgulhoAutista, F.g1]),
  a('ap-clima', 'Caminhos para o enfrentamento da crise climática e da injustiça socioambiental no Brasil', 'Meio ambiente', 'Boa',
    ['climátic|clima|aquecimento|ambient|enchente|seca|evento extremo', 'injust|desigual|racismo ambiental|vulnerab|periferi|populaç'],
    [
      'A COP30 foi realizada em Belém (PA) em novembro de 2025 e colocou o Brasil no centro do debate climático.',
      'Enchentes e secas recentes atingem de forma desigual populações vulneráveis (racismo ambiental), recorte citado por professores.',
    ],
    ['Acordo de Paris', 'Constituição Federal, art. 225', 'Ailton Krenak — "Ideias para adiar o fim do mundo"', 'Relatórios do IPCC'],
    [F.estrategia, F.g1]),
  a('ap-bets', 'Os impactos das apostas on-line na sociedade brasileira', 'Trabalho e economia', 'Boa',
    ['aposta|bets|bet|jogos de azar|cassino', 'endivid|vício|vulnerab|saúde mental|famíl|regulament|renda'],
    [
      'Levantamento da CNC com dados do Banco Central estimou gastos mensais com bets acima de R$ 30 bilhões em março de 2026.',
      'O governo bloqueou cartões do Bolsa Família nas casas de apostas e criou mecanismos de autoexclusão.',
      'Aparece nas apostas do Estratégia Vestibulares ("apostas esportivas e vulnerabilidade social").',
    ],
    ['Lei 14.790/2023 (regulamentação das apostas)', 'Zygmunt Bauman — sociedade de consumo', 'OMS — transtorno do jogo', 'Dados do Banco Central'],
    [F.bets, F.betsDebate, F.estrategia]),
  a('ap-saude-mental-jovens', 'Os impactos da era da informação na saúde mental da juventude brasileira', 'Saúde', 'Boa',
    ['saúde mental|ansiedade|depress|psicológ|emocional|sofrimento', 'jovens|juventude|adolescen|estudant', 'informação|digital|redes sociais|internet|hiperconect|tela'],
    [
      'Aposta de professores para 2026, ligada à hiperconectividade e à pressão por produtividade.',
      'Dialoga com o ECA Digital e com debates sobre uso de celular por crianças e jovens.',
    ],
    ['Byung-Chul Han — "Sociedade do Cansaço"', 'OMS — saúde mental de adolescentes', 'Jonathan Haidt — "A geração ansiosa"'],
    [F.estrategia, F.g1]),
  a('ap-pcd-trabalho', 'Desafios para a inclusão das pessoas com deficiência no mercado de trabalho brasileiro', 'Cidadania e direitos', 'Boa',
    ['deficiência|pcd|deficientes|capacitis|acessibilidade', 'trabalho|emprego|mercado|contrata|renda|inclus'],
    [
      'Professores destacam que pessoas com deficiência ainda não apareceram no ENEM com esse recorte (2017 tratou só da educação de surdos).',
      'Encaixa no padrão do INEP de cidadania de grupos vulneráveis.',
    ],
    ['Lei de Cotas para PcD (Lei 8.213/1991, art. 93)', 'Lei Brasileira de Inclusão', 'Convenção da ONU sobre Direitos das Pessoas com Deficiência'],
    [F.estrategia]),
  a('ap-desinformacao', 'Desafios para o combate à desinformação e o fortalecimento da confiança na ciência', 'Tecnologia e comunicação', 'Boa',
    ['desinforma|fake news|notícias falsas|informações falsas|negacionis', 'ciência|científic|confiança|vacina|saúde|educação midiática'],
    [
      '2026 é ano de eleições gerais no Brasil, o que coloca a desinformação em evidência.',
      'Está na lista de temas apontados por professores ao G1.',
    ],
    ['Carl Sagan — "O mundo assombrado pelos demônios"', 'Marco Civil da Internet', 'Pesquisas do Instituto Reuters'],
    [F.g1]),
  a('ap-maria-penha', 'Os desafios para a efetividade da Lei Maria da Penha no combate à violência contra a mulher', 'Violência e segurança', 'Possível',
    ['violência|agress|feminicíd|medida protetiva|abuso', 'mulher|feminin|gênero|machis|maria da penha'],
    [
      'A Lei Maria da Penha (Lei 11.340/2006) completou 20 anos em 7 de agosto de 2026, com campanhas e jornadas no Judiciário.',
      'O tema geral já caiu em 2015, então uma nova abordagem viria com recorte diferente (efetividade, medidas protetivas).',
    ],
    ['Lei Maria da Penha (11.340/2006)', 'Lei do Feminicídio', 'Simone de Beauvoir — "O Segundo Sexo"', 'Fórum Brasileiro de Segurança Pública'],
    [F.mariaPenha]),
  a('ap-analfabetismo', 'Caminhos para combater o analfabetismo funcional na era da hiperconectividade', 'Educação', 'Possível',
    ['analfabet|letramento|leitura|interpreta|compreensão', 'hiperconect|digital|internet|redes sociais|tela|tecnolog'],
    ['Aposta de professora do Estratégia: lemos e escrevemos muito nas redes, mas perdemos a capacidade de interpretar textos longos.'],
    ['Paulo Freire — "A importância do ato de ler"', 'Indicador de Alfabetismo Funcional (Inaf)', 'PISA/OCDE'],
    [F.estrategia]),
  a('ap-biomas', 'Desafios para a preservação dos biomas brasileiros', 'Meio ambiente', 'Possível',
    ['bioma|amazôn|cerrado|caatinga|pantanal|mata atlântica|pampa', 'preserv|desmat|conserv|queimada|exploraç|sustentáv'],
    ['Citado por professores ao G1, no contexto pós-COP30 e de queimadas recentes.'],
    ['Código Florestal', 'MapBiomas', 'Chico Mendes', 'Constituição Federal, art. 225'],
    [F.g1]),
  a('ap-habitacao', 'Caminhos para o enfrentamento do déficit habitacional e da segregação urbana no Brasil', 'Cidadania e direitos', 'Possível',
    ['moradia|habitac|déficit habitacional|favela|sem-teto|situação de rua', 'segrega|urban|cidade|periferi|desigual|direito'],
    ['Aposta de professora de Geografia do Estratégia Vestibulares.'],
    ['Constituição Federal, art. 6º (direito à moradia)', 'Estatuto da Cidade', 'Milton Santos — "O espaço do cidadão"'],
    [F.estrategia]),
  a('ap-microplasticos', 'Os impactos da poluição por microplásticos na saúde e no meio ambiente', 'Meio ambiente', 'Possível',
    ['microplástic|plástic|poluiç', 'saúde|ambient|água|aliment|consumo|ocean'],
    ['Citado por professores ao G1 como desafio emergente de saúde pública e consumo.'],
    ['Agenda 2030 — ODS 12 e 14', 'Política Nacional de Resíduos Sólidos', 'Zygmunt Bauman — "Vida para consumo"'],
    [F.g1]),
  a('ap-esporte', 'O esporte como instrumento de inclusão social no Brasil', 'Cultura e diversidade', 'Possível',
    ['esporte|esportiv|atleta|atividade física|prática esportiva', 'inclus|social|jovens|periferi|oportunidade|desigual'],
    ['Ano de Copa do Mundo (2026) e tema citado por professores ao G1.'],
    ['Constituição Federal, art. 217', 'Lei de Incentivo ao Esporte', 'Nelson Mandela — "o esporte tem o poder de mudar o mundo"'],
    [F.g1]),
]

export const NIVEIS_APOSTA = {
  Forte: { cor: 'verde', descricao: 'Muitos indícios em 2026 (lei nova, dados oficiais e várias apostas de especialistas)' },
  Boa: { cor: 'tinta', descricao: 'Indícios relevantes no ano e citação de especialistas' },
  Possível: { cor: 'slate', descricao: 'Tema citado, com menos indícios ou já abordado de forma parecida' },
}

/** Dias que faltam para a redação (null se já passou). */
export function diasParaProva(agora = new Date()) {
  const alvo = new Date(PROVA.redacao)
  if (agora - alvo > 6 * 60 * 60 * 1000) return null // prova já terminou
  const dia = (d) => new Date(d.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }) + 'T00:00:00Z')
  return Math.max(0, Math.round((dia(alvo) - dia(agora)) / 86400000))
}
