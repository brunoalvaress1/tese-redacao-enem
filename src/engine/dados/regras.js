// Regras locais de norma-padrão (Competência 1). Funcionam offline e complementam o LanguageTool.
import { rePalavra } from '../texto.js'

// ---------- Erros ortográficos frequentes em redações ----------
export const ERROS_ORTOGRAFICOS = {
  concerteza: 'com certeza', derrepente: 'de repente', apartir: 'a partir', porisso: 'por isso', denovo: 'de novo',
  encima: 'em cima', afim: 'a fim', excessão: 'exceção', excesão: 'exceção', previlégio: 'privilégio',
  previlegio: 'privilégio', beneficiente: 'beneficente', advinhar: 'adivinhar', impecilho: 'empecilho',
  cidadões: 'cidadãos', cidadães: 'cidadãos', própio: 'próprio', propio: 'próprio', própia: 'própria', propia: 'própria',
  frustado: 'frustrado', frustada: 'frustrada', poblema: 'problema', pobrema: 'problema', poblemas: 'problemas',
  menas: 'menos', trousse: 'trouxe', trouce: 'trouxe', enchergar: 'enxergar', exitar: 'hesitar', paralizar: 'paralisar',
  analizar: 'analisar', analizado: 'analisado', analize: 'análise', pesquizar: 'pesquisar', pesquiza: 'pesquisa',
  pesquizas: 'pesquisas', atravez: 'através', atraves: 'através', nescessário: 'necessário', nescessario: 'necessário',
  necessario: 'necessário', nessessário: 'necessário', nessesário: 'necessário', nescessária: 'necessária',
  necessaria: 'necessária', nescessidade: 'necessidade', nessecidade: 'necessidade', reinvindicar: 'reivindicar',
  reinvindicação: 'reivindicação', mendingo: 'mendigo', estrupo: 'estupro', gratuíto: 'gratuito', rúbrica: 'rubrica',
  'auto-estima': 'autoestima', 'anti-social': 'antissocial', 'anti-ético': 'antiético', 'auto-conhecimento': 'autoconhecimento',
  idéia: 'ideia', idéias: 'ideias', heróico: 'heroico', assembléia: 'assembleia', européia: 'europeia', platéia: 'plateia',
  paranóia: 'paranoia', estréia: 'estreia', jóia: 'joia', vôo: 'voo', enjôo: 'enjoo', lêem: 'leem', crêem: 'creem',
  vêem: 'veem', dêem: 'deem', tranqüilo: 'tranquilo', freqüente: 'frequente', freqüência: 'frequência',
  conseqüência: 'consequência', conseqüências: 'consequências', lingüística: 'linguística', cinqüenta: 'cinquenta',
  agüentar: 'aguentar', excencial: 'essencial', essêncial: 'essencial', essencias: 'essenciais', pobresa: 'pobreza',
  riquesa: 'riqueza', concientizar: 'conscientizar', concientização: 'conscientização', conciência: 'consciência',
  consiência: 'consciência', consciencia: 'consciência', conscientisação: 'conscientização', ancioso: 'ansioso',
  ansiozo: 'ansioso', asterístico: 'asterisco', supérfulo: 'supérfluo', superfulo: 'supérfluo',
  imprescindivel: 'imprescindível', impressindível: 'imprescindível', imprecindível: 'imprescindível',
  indispensavel: 'indispensável', saude: 'saúde', violencia: 'violência', ciencia: 'ciência', experiencia: 'experiência',
  existencia: 'existência', consequencia: 'consequência', consequencias: 'consequências', familia: 'família',
  familias: 'famílias', historia: 'história', memoria: 'memória', midia: 'mídia', midias: 'mídias', politica: 'política',
  politicas: 'políticas', economica: 'econômica', economico: 'econômico', economicas: 'econômicas', basico: 'básico',
  basica: 'básica', historico: 'histórico', historica: 'histórica', publicas: 'públicas', publicos: 'públicos',
  unico: 'único', unica: 'única', periodo: 'período', individuo: 'indivíduo', individuos: 'indivíduos', genero: 'gênero',
  prejuizo: 'prejuízo', prejuizos: 'prejuízos', tambem: 'também', porem: 'porém', alem: 'além', voce: 'você',
  voces: 'vocês', nao: 'não', sao: 'são', estao: 'estão', entao: 'então', ja: 'já', so: 'só', ha: 'há', ate: 'até',
  apos: 'após', atraz: 'atrás', seje: 'seja', esteje: 'esteja', interesante: 'interessante', exesso: 'excesso',
  escessivo: 'excessivo', exessivo: 'excessivo', previnir: 'prevenir', discusão: 'discussão', discursão: 'discussão',
  ezemplo: 'exemplo', izolamento: 'isolamento', compania: 'companhia', chingar: 'xingar', expontâneo: 'espontâneo',
  expontaneo: 'espontâneo', adevogado: 'advogado', adivogado: 'advogado', reboliço: 'rebuliço', magestade: 'majestade',
  cincoenta: 'cinquenta', quizer: 'quiser', quizesse: 'quisesse', atrazo: 'atraso', atrazar: 'atrasar',
  bulling: 'bullying', buling: 'bullying', excluzão: 'exclusão', inclusao: 'inclusão', exclusao: 'exclusão',
  prazeiroso: 'prazeroso', mortandela: 'mortadela', previlegiado: 'privilegiado', previlegiados: 'privilegiados',
  sobrancelha: null, caracteristica: 'característica', caracteristicas: 'características', facil: 'fácil',
  dificil: 'difícil', util: 'útil', inutil: 'inútil', agil: 'ágil', fragil: 'frágil', orgao: 'órgão', orgaos: 'órgãos',
  cerebro: 'cérebro', minimo: 'mínimo', maximo: 'máximo', proximo: 'próximo', proxima: 'próxima', ultimo: 'último',
  ultimos: 'últimos', ultima: 'última', otimo: 'ótimo', pessimo: 'péssimo', publico: null, analise: 'análise',
  metodo: 'método', medico: 'médico', medicos: 'médicos', area: 'área', areas: 'áreas', ambito: 'âmbito',
  obvio: 'óbvio', indice: 'índice', indices: 'índices', numeros: 'números', etnico: 'étnico', etnica: 'étnica',
  juridico: 'jurídico', juridica: 'jurídica', democratico: 'democrático', democratica: 'democrática',
  tecnologico: 'tecnológico', tecnologica: 'tecnológica', ecologico: 'ecológico', psicologico: 'psicológico',
  psicologica: 'psicológica', organico: 'orgânico', critica: null, critico: 'crítico', etico: 'ético', etica: 'ética',
  pratica: null, praticas: null, grafico: 'gráfico', sociedad: 'sociedade', comunicacao: 'comunicação',
  excessão_: null, beneficio: null, beneficios: 'benefícios', serie: 'série', series: 'séries', especie: 'espécie',
  especies: 'espécies', agua: 'água', aguas: 'águas', varios: 'vários', varias: 'várias', necessarios: 'necessários',
  sustentavel: 'sustentável', responsavel: 'responsável', responsaveis: 'responsáveis', possivel: 'possível',
  impossivel: 'impossível', nivel: 'nível', niveis: 'níveis', policia: 'polícia', noticia: 'notícia', noticias: 'notícias',
  inicio: 'início', fisica: 'física', fisico: 'físico', quimica: 'química', musica: 'música', ninguem: 'ninguém',
  alguem: 'alguém', tem_: null,
}

// ---------- Regras contextuais ----------
// tipo: ortografia | acentuação | crase | concordância | regência | pontuação | informalidade | sintaxe | estilo
// peso: 1 = desvio; 0.5 = desvio leve; 0.25 = recomendação de estilo
const r = (id, padrao, msg, sug, tipo, peso = 1, flags) => ({
  id, re: padrao instanceof RegExp ? padrao : rePalavra(padrao, flags), msg, sug, tipo, peso,
})

const INF = '\\p{L}+(?:ar|er|ir)'
const FEMININOS =
  'educação|saúde|população|sociedade|mulher|mulheres|cultura|internet|escola|escolas|vida|informação|' +
  'violência|fome|pobreza|desigualdade|família|famílias|natureza|cidadania|moradia|alimentação|segurança|' +
  'justiça|liberdade|dignidade|inclusão|exclusão|desinformação|tecnologia|cultura|leitura|arte|ciência|' +
  'democracia|igualdade|diversidade|comunidade|população|criança|crianças|juventude|velhice|' +
  '\\p{L}+(?:ção|ções|dade|dades|ência|ância|agem|eza|ura)'

export const REGRAS = [
  // --- crase ---
  r('crase-a-partir', 'à\\s+partir', 'Não há crase em "a partir de": "partir" é verbo, e não se usa crase antes de verbo.', 'a partir', 'crase'),
  r('crase-pronome', 'à\\s+(?:ele|ela|eles|elas|você|vocês|mim|ti|nós|isso|isto|esse|essa|esses|essas|este|esta|cada|todo|todos|qualquer|alguém|ninguém|uma|um)',
    'Não se usa crase antes de pronomes pessoais, demonstrativos (esse/essa) e indefinidos, nem antes de "um/uma".',
    (m) => m.replace(/^à/i, 'a'), 'crase'),
  r('crase-masculino', 'à\\s+(?:o|os|um|uns|seu|seus|meu|meus|nosso|nossos|este|esse|aquele|longo|nível|médio|curto|respeito)',
    'Crase indevida: não há artigo feminino "a" depois da preposição.', (m) => {
      if (/n[íi]vel/i.test(m)) return 'em nível'
      return m.replace(/^à/i, 'a')
    }, 'crase'),
  r('crase-verbo', `à\\s+(?:fazer|ser|ter|estudar|trabalhar|realizar|combater|promover|garantir|discutir|pensar|viver|ver|buscar|lutar|ajudar|investir|criar|desenvolver)`,
    'Não se usa crase antes de verbo no infinitivo.', (m) => m.replace(/^à/i, 'a'), 'crase'),
  r('crase-falta-regencia', `(?:devido|graças|em relação|referente|relativo|relativa|frente|aliado|aliada|ligado|ligada|vinculado|vinculada|atrelado|atrelada|associado|associada|direito|acesso|combate|resistência|obediência|respeito|aversão|alusão|adesão|indiferença|submetido|submetida|submetidos|submetidas|voltado|voltada|voltados|voltadas|destinado|destinada|destinados|destinadas|prejudicial|essencial|fundamental|necessário|inerente)\\s+a\\s+(?:${FEMININOS})`,
    'Falta crase: a palavra anterior exige a preposição "a" e o termo seguinte, feminino, admite o artigo "a" (a + a = à).',
    (m) => m.replace(/\sa\s(?=\S+$)/i, ' à '), 'crase'),
  r('crase-as-vezes', 'as\\s+vezes(?!\\s+(?:em\\s+)?que)', 'A locução adverbial "às vezes" (= de vez em quando) leva crase.', 'às vezes', 'crase', 1),
  r('crase-medida', 'a\\s+medida\\s+que', 'A locução "à medida que" (= à proporção que) leva crase.', 'à medida que', 'crase'),
  r('a-fim', 'à\\s+fim\\s+de', 'Não há crase em "a fim de" (locução de finalidade).', 'a fim de', 'crase'),
  r('afim-de', 'afim\\s+de', '"Afim" significa "semelhante". Para indicar finalidade, use "a fim de".', 'a fim de', 'ortografia'),
  r('a-nivel', 'a\\s+nível\\s+de', '"A nível de" é considerada inadequada. Prefira "em nível de", "no âmbito de" ou "quanto a".', 'no âmbito de', 'estilo', 0.5),

  // --- há / a ---
  r('ha-atras', 'há\\s+(?:\\p{L}+\\s+){0,3}?(?:anos|meses|dias|décadas|séculos|semanas|tempos?)\\s+atrás',
    'Redundância: "há" já indica tempo passado. Use "há dez anos" OU "dez anos atrás".', (m) => m.replace(/\s+atrás$/i, ''), 'estilo', 0.5),
  r('a-muito-tempo', '(?<!daqui\\s)a\\s+(?:muito\\s+tempo|décadas|séculos|anos|muitos\\s+anos)(?=\\s*(?:,|\\.|que|o|a|os|as|existe|persiste|se|é))',
    'Para tempo decorrido (passado), use o verbo "haver": "há muito tempo".', (m) => m.replace(/^a/i, 'há'), 'ortografia', 1),

  // --- concordância / verbos impessoais ---
  r('haviam', 'haviam\\s+(?:muitos|muitas|vários|várias|diversos|diversas|poucos|poucas|algumas|alguns|inúmeros|inúmeras|\\d+)',
    'O verbo "haver" no sentido de "existir" é impessoal e fica no singular.', (m) => m.replace(/^haviam/i, 'havia'), 'concordância'),
  r('houveram', 'houveram\\s+(?:muitos|muitas|vários|várias|diversos|diversas|poucos|poucas|algumas|alguns|inúmeros|inúmeras|\\d+)',
    'O verbo "haver" no sentido de "existir/ocorrer" é impessoal e fica no singular.', (m) => m.replace(/^houveram/i, 'houve'), 'concordância'),
  r('fazem-anos', 'fazem\\s+(?:\\d+|dois|duas|três|quatro|cinco|seis|sete|oito|nove|dez|vinte|trinta|cem|muitos|muitas|vários|várias|alguns|algumas|poucos)\\s+(?:anos|meses|dias|décadas|séculos|semanas|horas)',
    'O verbo "fazer" indicando tempo decorrido é impessoal: fica no singular.', (m) => m.replace(/^fazem/i, 'faz'), 'concordância'),
  r('existe-plural', 'existe\\s+(?:muitos|muitas|vários|várias|diversos|diversas|inúmeros|inúmeras|problemas|pessoas|fatores|casos)',
    '"Existir" é pessoal e concorda com o sujeito: no plural, "existem".', (m) => m.replace(/^existe/i, 'existem'), 'concordância'),
  r('eles-tem', '(?:eles|elas)\\s+(?:tem|vem)(?![\\p{L}])', 'Na 3ª pessoa do plural, "ter" e "vir" levam acento circunflexo: "têm", "vêm".',
    (m) => m.replace(/tem$/i, 'têm').replace(/vem$/i, 'vêm'), 'acentuação'),
  r('ele-tem', '(?:ele|ela)\\s+(?:têm|vêm)', 'Na 3ª pessoa do singular, "tem" e "vem" não levam acento.',
    (m) => m.replace(/têm$/i, 'tem').replace(/vêm$/i, 'vem'), 'acentuação'),
  r('para-mim-infinitivo', `para\\s+mim\\s+(?:fazer|ser|ter|estudar|ir|poder|entender|conseguir|saber|ler|escrever|viver|trabalhar|pagar)`,
    'Antes de verbo no infinitivo, o sujeito é "eu": "para eu fazer".', (m) => m.replace(/mim/i, 'eu'), 'concordância'),
  r('menas', 'menas', '"Menos" é invariável: nunca existe "menas".', 'menos', 'ortografia'),

  // --- mas / mais / mau / mal ---
  r('mais-adversativo', '(?<=,\\s*)mais(?=\\s+(?:não|nem|também|sim|ainda|isso|é|há|o|a|os|as|ele|ela|eles|elas|essa|esse|se|quando|existe|existem|infelizmente|na\\s+prática|ao)\\s)',
    'Aqui a ideia é de oposição: use a conjunção "mas" (e não "mais", que indica intensidade/quantidade).', (m) => m.replace(/mais/i, 'mas'), 'ortografia', 1, 'giu'),
  // (exceção da regra acima: correlação "quanto mais…, mais…" é correta)
  r('pais-acento', '(?:nosso|do|no|pelo|o|seu|esse|este|ao|todo\\s+o|um)\\s+pais(?![\\p{L}])',
    'Falta acento: "país" (nação). Sem acento, "pais" é o plural de "pai".', (m) => m.replace(/pais$/i, 'país'), 'acentuação'),
  r('mas-intensidade', '(?:cada\\s+vez|muito|bem|ainda|nunca|cada\\s+dia)\\s+mas(?![\\p{L}])',
    'Aqui a ideia é de intensidade: use "mais".', (m) => m.replace(/mas$/i, 'mais'), 'ortografia'),
  r('mal-substantivo', 'mal\\s+(?:hábito|hábitos|exemplo|exemplos|uso|caráter|humor|gosto|negócio|comportamento|funcionamento|desempenho|profissional|cidadão|governo|gestor|atendimento|planejamento)',
    'Antes de substantivo, o adjetivo é "mau" (oposto de "bom").', (m) => m.replace(/^mal/i, 'mau'), 'ortografia'),
  r('mau-particípio', 'mau\\s+(?:feito|visto|educado|informado|remunerado|planejado|estruturado|aproveitado|distribuído|interpretado|administrado|gerido|utilizado|alimentado|intencionado|sucedido|resolvido|elaborado)',
    'Antes de particípio/adjetivo, use o advérbio "mal" (oposto de "bem").', (m) => m.replace(/^mau/i, 'mal'), 'ortografia'),

  // --- por que / porque ---
  r('o-porque', '(?:o|os)\\s+(?:porque|por\\s+que)(?=\\s)', 'Substantivado (com artigo), escreve-se "o porquê".', (m) => m.replace(/(porque|por\s+que)$/i, 'porquê'), 'ortografia'),
  r('porque-interrog', '(?:porque|por\\s+que)\\s*\\?', 'No fim de frase interrogativa, use "por quê?" (separado e com acento).', 'por quê?', 'ortografia', 1, 'giu'),

  // --- trás / traz / agente ---
  r('por-traz', '(?:por|para)\\s+traz', '"Trás" (advérbio de lugar) leva acento e "s": "por trás", "para trás".', (m) => m.replace(/traz$/i, 'trás'), 'ortografia'),
  r('tras-verbo', 'trás\\s+(?:consigo|à\\s+tona|a\\s+tona|benefícios|prejuízos|consequências|problemas|danos|riscos|malefícios)',
    'Verbo "trazer" na 3ª pessoa: "traz" (com z e sem acento).', (m) => m.replace(/^trás/i, 'traz'), 'ortografia'),
  r('agente-a-gente', '(?<!(?:o|um|do|no|pelo|ao|cada|este|esse|todo|qualquer|principal|como)\\s)agente\\s+(?:vai|vê|tem|pode|deve|precisa|sabe|fala|faz|acha|percebe|vive|está|é|foi|não|sempre|nunca)',
    '"Agente" é quem age. A expressão pronominal é "a gente" — e, na redação formal, prefira "nós" ou "a sociedade".', (m) => m.replace(/^agente/i, 'nós'), 'ortografia'),

  // --- onde ---
  r('onde-tempo', '(?:época|momento|ano|anos|período|situação|caso|tempo|século|década|livro|texto|filme|obra|lei|contexto|cenário|conjuntura|sociedade|realidade|processo)\\s+onde',
    '"Onde" deve se referir a lugar físico. Para tempo, situação ou ideia, use "em que" / "no qual" / "na qual".', (m) => m.replace(/onde$/i, 'em que'), 'regência', 0.5),

  // --- redundâncias e vícios ---
  r('redundancia', 'subir\\s+para\\s+cima|descer\\s+para\\s+baixo|elo\\s+de\\s+ligação|encarar\\s+de\\s+frente|planejar\\s+antecipadamente|outra\\s+alternativa|surpresa\\s+inesperada|repetir\\s+de\\s+novo|consenso\\s+geral|fato\\s+real|certeza\\s+absoluta|conviver\\s+junto|voltar\\s+atrás|sair\\s+para\\s+fora|entrar\\s+para\\s+dentro|multidão\\s+de\\s+pessoas|monopólio\\s+exclusivo|principal\\s+protagonista|erário\\s+público|criar\\s+novos|criar\\s+novas|países\\s+do\\s+mundo|se\\s+caso|ganhar\\s+grátis',
    'Redundância (pleonasmo vicioso): a ideia se repete. Elimine a palavra desnecessária.', null, 'estilo', 0.5),
  r('o-mesmo-pronome', '(?:o|a|os|as)\\s+mesm[oa]s?\\s+(?:é|são|foi|foram|está|estão|deve|devem|pode|podem|possui|possuem|tem|têm)',
    'Evite "o mesmo" como pronome para retomar termos. Use "ele/ela", "este", "tal" ou repita o substantivo com sinônimo.', null, 'estilo', 0.5),
  r('ao-inves', 'ao\\s+invés\\s+de', '"Ao invés de" significa "ao contrário de". Para substituição, a forma mais adequada é "em vez de".', 'em vez de', 'estilo', 0.25),

  // --- informalidade / oralidade ---
  r('informal', 'pra|pro|pros|pras|tá|tô|né|vc|vcs|tb|tbm|pq|blz|mto|tava|tavam|tamo|galera|treta|zoeira|mano|véi|tipo\\s+assim|daí\\s+que|aí\\s+então|bagulho|parada\\s+toda|massa\\s+demais',
    'Marca de oralidade/informalidade. A redação do ENEM exige registro formal (norma-padrão).', null, 'informalidade'),
  r('a-gente-informal', '(?<![\\p{L}])a\\s+gente(?![\\p{L}])', '"A gente" é marca de oralidade. Em texto formal, prefira "nós", "a sociedade" ou "os cidadãos".', 'nós', 'informalidade', 0.5),
  r('abreviacao', 'ex(?=[:.])|obs(?=[:.])|qdo|qto|msm|hj|td|tds|vlw|flw', 'Evite abreviações informais na redação.', null, 'informalidade'),

  // --- pontuação ---
  { id: 'espaco-antes-pontuacao', re: /[\p{L}\d]\s+[,;.:](?=\s|$)/gu, msg: 'Não se usa espaço antes de vírgula, ponto, ponto e vírgula ou dois-pontos.', sug: (m) => m.replace(/\s+/, ''), tipo: 'pontuação', peso: 0.25 },
  { id: 'sem-espaco-depois', re: /(?<=\p{L})[,;](?=\p{L})/gu, msg: 'Falta espaço depois do sinal de pontuação.', sug: (m) => m + ' ', tipo: 'pontuação', peso: 0.25 },
  { id: 'ponto-sem-espaco', re: /(?<=\p{Ll}{2})\.(?=\p{Lu})/gu, msg: 'Falta espaço depois do ponto final.', sug: '. ', tipo: 'pontuação', peso: 0.25 },
  { id: 'minuscula-inicio', re: /(?:^|[.!?]\s+)(\p{Ll})/gmu, msg: 'Início de frase deve começar com letra maiúscula.', sug: (m) => m.toUpperCase(), tipo: 'pontuação', peso: 0.5, grupo: 1 },
  { id: 'virgula-conectivo', re: /(?:^|[.!?]\s+)(Além disso|Ademais|Portanto|Dessa forma|Desse modo|Dessa maneira|Nesse sentido|Por conseguinte|Outrossim|Em suma|Contudo|Entretanto|No entanto|Todavia|Por fim|Em primeiro lugar|Em segundo lugar|Diante disso|Diante do exposto|Sob esse viés|Nessa perspectiva|Com efeito|Dessarte|Destarte|Consequentemente|Primeiramente|Inicialmente|Paralelamente|Sendo assim|Assim sendo)(?=\s+[\p{L}])/gmu,
    msg: 'Use vírgula depois de conectivo (expressão adverbial) deslocado para o início da oração.', sug: (m) => m + ',', tipo: 'pontuação', peso: 0.5, grupo: 1 },
  { id: 'exclamacao', re: /!+/gu, msg: 'Evite pontos de exclamação na dissertação: eles conferem tom emotivo/informal ao texto.', sug: '.', tipo: 'estilo', peso: 0.25 },
  { id: 'reticencias', re: /\.{3}|…/gu, msg: 'Evite reticências: na dissertação-argumentativa, as ideias devem ser concluídas.', sug: '.', tipo: 'estilo', peso: 0.25 },
  { id: 'etc-virgula', re: /,\s*etc\.?/giu, msg: 'Evite "etc." na redação: seja específico ou encerre a enumeração com "entre outros" — e não use vírgula antes de "etc.".', sug: null, tipo: 'estilo', peso: 0.25 },
]

// Exceção: correlação "quanto mais…, mais…" é correta.
REGRAS.find((x) => x.id === 'mais-adversativo').excluir = (texto, inicio) =>
  /quanto\s+(?:mais|menos)\s[^.!?]*$/i.test(texto.slice(Math.max(0, inicio - 120), inicio))

// Palavras de baixo calão (critério de anulação: impropérios).
export const IMPROPERIOS = rePalavra(
  'porra|caralho|merda|puta|putaria|foda|foda-se|fodase|fdp|buceta|arrombad[oa]s?|cuz[aã]o|desgraçad[oa]|vagabund[oa]s?|vsf|pqp|otári[oa]s?|babaca|imbecil|idiota',
)

// Termos que indicam desrespeito aos direitos humanos na proposta (C5).
export const VIOLACAO_DH = rePalavra(
  'pena\\s+de\\s+morte|castração(?:\\s+química)?|castrar|tortur\\p{L}*|linchament\\p{L}*|linchar|extermin\\p{L}*|prisão\\s+perpétua|trabalhos?\\s+forçados?|esteriliz\\p{L}+\\s+(?:forçad\\p{L}*|compulsóri\\p{L}*)|matar\\s+(?:os|as|esses|essas|bandidos|criminosos)|eliminar\\s+(?:os|as)\\s+(?:bandidos|criminosos|imigrantes|pobres)|justiça\\s+com\\s+as\\s+próprias\\s+mãos|expuls\\p{L}+\\s+(?:os|as)\\s+(?:imigrantes|refugiados)|apedrej\\p{L}+|açoit\\p{L}+',
)
