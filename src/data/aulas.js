// Conteúdo do curso gratuito. Blocos: h (subtítulo), p, lista, numerada, dica, alerta, exemplo, tabela, conectivos, modelo.

export const REDACAO_MODELO = {
  tema: 'Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil',
  paragrafos: [
    {
      texto: 'Na obra "O Segundo Sexo", a filósofa Simone de Beauvoir afirma que ninguém nasce mulher, mas torna-se mulher, evidenciando que os papéis de gênero são construções sociais. Essa reflexão permanece atual no Brasil, onde o trabalho de cuidado realizado pelas brasileiras ainda é invisibilizado. Tal cenário é motivado, sobretudo, pela herança patriarcal da sociedade e pela omissão do Estado na criação de políticas públicas de apoio às cuidadoras.',
      comentario: 'Introdução completa: repertório legitimado (Beauvoir) ligado ao tema, apresentação do problema com as palavras-chave do recorte e tese com dois argumentos anunciados (herança patriarcal + omissão do Estado).',
    },
    {
      texto: 'Em primeiro lugar, cabe destacar que a divisão sexual do trabalho tem raízes históricas. Desde o período colonial, às mulheres foi atribuída a responsabilidade pelo lar e pela criação dos filhos, enquanto aos homens coube o espaço público e remunerado. Esse modelo, embora questionado, ainda se reproduz: segundo dados do IBGE, as brasileiras dedicam quase o dobro de horas semanais aos afazeres domésticos em comparação aos homens. Dessa forma, a sobrecarga feminina é naturalizada como um dever afetivo, e não reconhecida como atividade essencial para a manutenção da vida e da economia.',
      comentario: 'Tópico frasal retoma o 1º argumento. Há repertório histórico (período colonial) e estatístico (IBGE), explicação de causa e consequência e fechamento que volta à tese.',
    },
    {
      texto: 'Além disso, a negligência estatal agrava o problema. A Constituição Federal de 1988 garante, em seu artigo 6º, a proteção à maternidade e à infância; no entanto, a escassez de creches públicas e de serviços de apoio a idosos transfere essa demanda quase exclusivamente para as famílias — e, nelas, para as mulheres. Consequentemente, muitas cidadãs abandonam os estudos ou o emprego, o que aprofunda a desigualdade de gênero e a dependência financeira. Assim, a ausência de políticas públicas perpetua a invisibilidade de uma tarefa que sustenta toda a sociedade.',
      comentario: 'Desenvolve o 2º argumento com repertório jurídico (Constituição). Conectivos variados (no entanto, consequentemente, assim) e progressão clara: direito garantido → falha do Estado → impacto na vida das mulheres.',
    },
    {
      texto: 'Portanto, é imprescindível enfrentar a invisibilidade do trabalho de cuidado exercido pela mulher. Para isso, o Ministério das Mulheres, em parceria com o Ministério da Educação, deve promover campanhas educativas nas escolas e na mídia, por meio de palestras e propagandas que discutam a divisão igualitária das tarefas domésticas, a fim de desconstruir a herança patriarcal. Paralelamente, cabe ao Governo Federal ampliar a rede de creches e de centros-dia para idosos, com o objetivo de reduzir a sobrecarga feminina. Desse modo, a lição de Beauvoir será, enfim, compreendida na prática.',
      comentario: 'Proposta com os 5 elementos: agente (Ministério das Mulheres), ação (promover campanhas), meio (por meio de palestras e propagandas), finalidade (a fim de desconstruir…) e detalhamento (em parceria com o MEC; que discutam a divisão…). Fecha retomando o repertório da introdução.',
    },
  ],
}

export const AULAS = [
  {
    slug: 'estrutura', titulo: 'Estrutura da redação nota 1000', resumo: 'Como organizar introdução, desenvolvimento e conclusão em 30 linhas.', duracao: '8 min', modulo: 'Fundamentos',
    blocos: [
      { p: 'A redação do ENEM é um texto dissertativo-argumentativo: você defende um ponto de vista sobre um problema social e propõe uma solução. O formato que mais funciona tem 4 parágrafos, com cerca de 7 linhas cada.' },
      { h: 'O esqueleto em 4 parágrafos' },
      { numerada: [
        'Introdução (5–7 linhas): contextualização com repertório + apresentação do problema + tese com dois argumentos anunciados.',
        '1º desenvolvimento (7–9 linhas): tópico frasal com o 1º argumento + fundamentação (repertório) + explicação + fechamento.',
        '2º desenvolvimento (7–9 linhas): mesma estrutura, com o 2º argumento e outro repertório.',
        'Conclusão (6–8 linhas): retomada da tese + proposta de intervenção com agente, ação, meio, finalidade e detalhamento.',
      ] },
      { dica: 'Antes de escrever, gaste 10 minutos planejando: anote a tese, os dois argumentos, um repertório para cada um e os elementos da proposta. Um bom projeto de texto vale pontos na C3.' },
      { h: 'Limites da folha' },
      { lista: ['Mínimo: 8 linhas — com até 7, a redação recebe nota zero.', 'Máximo: 30 linhas — o que passar disso não é lido.', 'Título é opcional e não conta como linha de texto.'] },
      { alerta: 'Não copie trechos dos textos motivadores: linhas copiadas são desconsideradas na contagem e podem levar à nota zero.' },
    ],
  },
  {
    slug: 'competencias', titulo: 'As 5 competências do ENEM', resumo: 'O que cada competência avalia e como os 1000 pontos são distribuídos.', duracao: '10 min', modulo: 'Fundamentos',
    blocos: [
      { p: 'Cada redação é avaliada em 5 competências, valendo de 0 a 200 pontos cada, em seis níveis: 0, 40, 80, 120, 160 e 200. A nota final é a soma das cinco.' },
      { tabela: { cabecalho: ['Competência', 'O que avalia', 'Como garantir 200'], linhas: [
        ['C1 · Norma-padrão', 'Gramática, ortografia, acentuação, pontuação e registro formal', 'No máximo 2 desvios leves e frases bem estruturadas'],
        ['C2 · Proposta', 'Compreensão do tema, tipo dissertativo-argumentativo e repertório', 'Tema completo + repertório legitimado, pertinente e produtivo'],
        ['C3 · Argumentação', 'Seleção, organização e interpretação de informações', 'Projeto de texto claro e argumentos bem desenvolvidos'],
        ['C4 · Coesão', 'Conectivos e mecanismos de retomada', 'Conectivos variados entre e dentro dos parágrafos, sem repetições'],
        ['C5 · Intervenção', 'Proposta de solução para o problema', 'Agente, ação, meio/modo, finalidade e detalhamento'],
      ] } },
      { dica: 'As competências 3 e 5 são as que mais diferenciam candidatos. Treinar o projeto de texto e a proposta completa costuma render os maiores saltos de nota.' },
      { p: 'Duas pessoas corrigem cada redação. Se as notas diferirem em mais de 100 pontos no total (ou mais de 80 em uma competência), uma terceira pessoa avalia o texto.' },
    ],
  },
  {
    slug: 'norma-padrao', titulo: 'C1: norma-padrão e erros mais comuns', resumo: 'Os desvios que mais derrubam a nota e como evitá-los.', duracao: '12 min', modulo: 'Competências',
    blocos: [
      { p: 'A Competência 1 avalia se você domina a escrita formal. Cada desvio conta — e a reincidência pesa. A meta para 200 pontos é ter, no máximo, dois deslizes leves.' },
      { h: 'Os 10 erros campeões' },
      { tabela: { cabecalho: ['Errado', 'Certo', 'Por quê'], linhas: [
        ['Haviam muitos casos', 'Havia muitos casos', '"Haver" no sentido de existir é impessoal'],
        ['Fazem dez anos', 'Faz dez anos', '"Fazer" indicando tempo é impessoal'],
        ['à partir de', 'a partir de', 'Não há crase antes de verbo'],
        ['acesso a educação', 'acesso à educação', 'Preposição "a" + artigo "a"'],
        ['É importante, mais não basta', 'É importante, mas não basta', '"Mas" indica oposição; "mais", intensidade'],
        ['A gente precisa', 'Nós precisamos / A sociedade precisa', '"A gente" é marca de oralidade'],
        ['O cenário onde vivemos', 'O cenário em que vivemos', '"Onde" só para lugar físico'],
        ['Eles tem direito', 'Eles têm direito', 'Plural de "ter" leva circunflexo'],
        ['mal hábito', 'mau hábito', '"Mau" é o oposto de "bom"'],
        ['Além disso a sociedade…', 'Além disso, a sociedade…', 'Vírgula após conectivo deslocado'],
      ] } },
      { h: 'Registro formal' },
      { lista: ['Evite gírias, abreviações (vc, pq, tb) e marcas de oralidade (pra, tá, né).', 'Prefira construções impessoais: "percebe-se", "é fundamental" em vez de "eu acho".', 'Evite períodos muito longos (mais de 4 linhas sem ponto): eles prejudicam a estrutura sintática.'] },
      { dica: 'Reserve os 10 minutos finais da prova para revisar só a C1: acentos, crases, concordância e vírgulas após conectivos.' },
    ],
  },
  {
    slug: 'repertorio', titulo: 'C2: tema, tipo textual e repertório', resumo: 'Como não fugir do tema e usar repertório de forma produtiva.', duracao: '12 min', modulo: 'Competências',
    blocos: [
      { h: 'Entenda o recorte temático' },
      { p: 'Todo tema tem um assunto geral e um recorte. Em "Desafios para a valorização da herança africana no Brasil", o assunto é cultura africana, mas o recorte exige discutir a valorização dessa herança. Falar só de racismo, sem tratar de herança e valorização, é tangenciar o tema (nota 40 na C2).' },
      { alerta: 'Fuga total ao tema zera a redação inteira. Tangenciar limita C2, C3 e C5 a 40 pontos.' },
      { dica: 'Sublinhe as palavras-chave do tema e use-as (ou sinônimos) na introdução e em todos os parágrafos.' },
      { h: 'Repertório: legitimado, pertinente e produtivo' },
      { lista: [
        'Legitimado: vem de uma área do conhecimento (filosofia, sociologia, história, leis, dados, literatura, cinema).',
        'Pertinente: tem relação com o tema discutido.',
        'Produtivo: é explicado e usado para sustentar o argumento — não apenas citado.',
      ] },
      { h: 'Repertórios coringa por eixo' },
      { tabela: { cabecalho: ['Eixo', 'Repertórios'], linhas: [
        ['Cidadania e direitos', 'Constituição Federal (art. 5º e 6º), Declaração Universal dos Direitos Humanos, John Rawls (justiça como equidade), Hannah Arendt ("direito a ter direitos")'],
        ['Educação', 'Paulo Freire (educação libertadora), LDB, dados do PISA/INEP, Anísio Teixeira'],
        ['Tecnologia', 'Zygmunt Bauman (modernidade líquida), Byung-Chul Han (sociedade do cansaço), Shoshana Zuboff (capitalismo de vigilância), Marco Civil da Internet, LGPD'],
        ['Saúde', 'Artigo 196 da Constituição (saúde como direito), OMS, SUS, Reforma Psiquiátrica'],
        ['Meio ambiente', 'Artigo 225 da Constituição, Agenda 2030 (ODS), Acordo de Paris, Ailton Krenak'],
        ['Cultura e diversidade', 'Djamila Ribeiro, Lei 10.639/2003, Darcy Ribeiro ("O Povo Brasileiro"), Gilberto Freyre'],
        ['Violência', 'Lei Maria da Penha, Atlas da Violência (IPEA), Michel Foucault ("Vigiar e Punir")'],
      ] } },
    ],
  },
  {
    slug: 'argumentacao', titulo: 'C3: argumentação e projeto de texto', resumo: 'Como construir argumentos consistentes e um texto bem planejado.', duracao: '10 min', modulo: 'Competências',
    blocos: [
      { p: 'A C3 avalia se você seleciona boas informações e as organiza em defesa de um ponto de vista. O segredo é o projeto de texto: tudo que é anunciado na introdução precisa ser desenvolvido.' },
      { h: 'Fórmula do parágrafo argumentativo' },
      { numerada: ['Tópico frasal: afirme o argumento (retomando o que foi anunciado).', 'Fundamentação: traga um repertório, dado ou exemplo.', 'Explicação: mostre a relação de causa e consequência ("isso ocorre porque…", "consequentemente…").', 'Fechamento: conecte o argumento à tese.'] },
      { exemplo: 'Em primeiro lugar (tópico), a ausência de educação midiática favorece a desinformação. Segundo a pesquisa TIC Kids Online (fundamentação), a maioria dos jovens não verifica a fonte do que lê. Isso ocorre porque a escola ainda não ensina a checar informações (explicação). Dessa forma, notícias falsas circulam sem resistência (fechamento).' },
      { dica: 'Evite argumentos genéricos ("a situação é muito grave"). Prefira causas concretas e explique o "porquê".' },
      { alerta: 'Contradições e informações soltas, sem relação com a tese, derrubam a C3 para 80 ou menos.' },
    ],
  },
  {
    slug: 'conectivos', titulo: 'C4: lista completa de conectivos', resumo: 'Mais de 150 conectivos organizados por função.', duracao: '7 min', modulo: 'Competências',
    blocos: [
      { p: 'A C4 avalia a articulação do texto. Para 200 pontos: conectivos no início de todos os parágrafos, articulação entre as frases dentro dos parágrafos, variedade e nenhuma repetição excessiva de palavras.' },
      { conectivos: true },
      { h: 'Coesão referencial' },
      { p: 'Além dos conectivos, use pronomes e expressões para retomar ideias sem repetir palavras: "esse cenário", "tal problemática", "a qual", "cujo", "isso". Troque palavras repetidas por sinônimos ou hiperônimos (ex.: "jovens" → "essa parcela da população").' },
      { alerta: 'Usar o mesmo conectivo várias vezes ou empregá-lo com sentido errado (ex.: "portanto" introduzindo uma causa) conta como inadequação.' },
    ],
  },
  {
    slug: 'proposta-de-intervencao', titulo: 'C5: proposta de intervenção completa', resumo: 'Os 5 elementos que garantem 200 pontos na conclusão.', duracao: '9 min', modulo: 'Competências',
    blocos: [
      { p: 'A proposta deve resolver o problema discutido, estar articulada aos argumentos e respeitar os direitos humanos. Cada elemento válido vale, na prática, 40 pontos.' },
      { tabela: { cabecalho: ['Elemento', 'Pergunta', 'Exemplo'], linhas: [
        ['Agente', 'Quem vai fazer?', 'o Ministério da Educação'],
        ['Ação', 'O que vai fazer?', 'deve incluir aulas de educação midiática'],
        ['Meio/modo', 'Como?', 'por meio da reformulação da BNCC'],
        ['Finalidade', 'Para quê?', 'a fim de formar leitores críticos'],
        ['Detalhamento', 'Mais informação sobre um elemento', 'órgão responsável pela educação básica'],
      ] } },
      { exemplo: 'Portanto, o Ministério da Educação, órgão responsável pela educação básica, deve incluir aulas de educação midiática nas escolas, por meio da reformulação da BNCC, a fim de formar leitores capazes de identificar notícias falsas.' },
      { alerta: 'Propostas que desrespeitam os direitos humanos (pena de morte, tortura, "justiça com as próprias mãos") zeram a C5.' },
      { dica: 'Evite agentes vagos como "alguém" ou "eles" e ações genéricas como "fazer algo" ou "resolver o problema".' },
    ],
  },
  {
    slug: 'nota-zero', titulo: 'O que zera a redação', resumo: 'Os critérios de anulação para nunca cair neles.', duracao: '4 min', modulo: 'Fundamentos',
    blocos: [
      { lista: [
        'Fuga total ao tema.',
        'Não atendimento ao tipo dissertativo-argumentativo (narrativa, poema, carta…).',
        'Texto com até 7 linhas.',
        'Cópia integral dos textos motivadores ou do caderno de questões.',
        'Impropérios, desenhos ou outras formas propositais de anulação.',
        'Parte do texto deliberadamente desconectada do tema.',
        'Texto predominantemente em língua estrangeira.',
        'Folha de redação em branco ou assinatura fora do local indicado.',
      ] },
      { dica: 'O corretor desta plataforma verifica automaticamente os principais critérios de anulação e avisa quando algum é detectado.' },
    ],
  },
  {
    slug: 'modelo-nota-1000', titulo: 'Redação modelo comentada', resumo: 'Um texto completo analisado parágrafo por parágrafo.', duracao: '6 min', modulo: 'Prática',
    blocos: [
      { p: 'A redação abaixo foi escrita para este curso a partir do tema do ENEM 2023. Observe como cada parágrafo cumpre sua função e como as competências aparecem no texto.' },
      { modelo: true },
      { dica: 'Cole este texto no corretor para ver todas as marcações: repertórios, conectivos, tese e os 5 elementos da proposta.' },
    ],
  },
]

export const MODULOS = ['Fundamentos', 'Competências', 'Prática']
export const buscarAula = (slug) => AULAS.find((a) => a.slug === slug) || null
