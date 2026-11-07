import { APOSTAS } from './apostas.js'

// Banco de temas. "grupos": partes do recorte temático (prefixos separados por "|").
// O primeiro grupo é o núcleo do tema — se ele não aparecer no texto, há tangenciamento.

const t = (id, titulo, eixo, grupos, extra = {}) => ({ id, titulo, eixo, grupos, ...extra })
const enem = (ano, id, titulo, eixo, grupos, extra = {}) => t(id, titulo, eixo, grupos, { ano, origem: 'ENEM', ...extra })
const inedito = (id, titulo, eixo, grupos) => t(id, titulo, eixo, grupos, { origem: 'Inédito' })

export const EIXOS = [
  'Cidadania e direitos', 'Educação', 'Saúde', 'Tecnologia e comunicação', 'Meio ambiente',
  'Cultura e diversidade', 'Trabalho e economia', 'Violência e segurança',
]

export const TEMAS = [
  // ---------------- ENEM (provas oficiais) ----------------
  enem(2025, 'enem-2025', 'Perspectivas acerca do envelhecimento na sociedade brasileira', 'Cidadania e direitos',
    ['envelhec|idos|velhice|terceira idade|pessoa idosa|longevidade|etarismo', 'socied|social|famíl|polític|cuidad|direit']),
  enem(2024, 'enem-2024', 'Desafios para a valorização da herança africana no Brasil', 'Cultura e diversidade',
    ['african|afro|negr|matriz african|diáspora|quilomb', 'herança|heranç|legado|cultur|tradiç|memória|ancestr', 'valoriz|reconhec|preserv|desvaloriz|apagamento|racismo|preconceito']),
  enem(2023, 'enem-2023', 'Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil', 'Trabalho e economia',
    ['cuidad|cuidar|trabalho doméstico|tarefas domésticas|afazeres|economia do cuidado', 'mulher|feminin|mães|mãe|gênero|machis|patriarc', 'invisi|reconhec|desvaloriz|remuner|não pago|não remunerado|sobrecarga|dupla jornada|tripla jornada']),
  enem(2022, 'enem-2022', 'Desafios para a valorização de comunidades e povos tradicionais no Brasil', 'Cultura e diversidade',
    ['tradicion|indígen|quilombol|ribeirinh|caiçara|extrativist|originári', 'valoriz|reconhec|preserv|território|demarcaç|direit|invisi|marginaliz']),
  enem(2021, 'enem-2021', 'Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil', 'Cidadania e direitos',
    ['registro|certidão|documentaç|sub-registro|sub registro|cartório', 'cidadan|direit|acesso|invisi|existência']),
  enem(2020, 'enem-2020', 'O estigma associado às doenças mentais na sociedade brasileira', 'Saúde',
    ['mental|mentais|psíqu|psicológ|depress|ansiedade|transtorno', 'estigma|preconceito|tabu|discrimin|rótulo|marginaliz|silenciamento']),
  enem(2019, 'enem-2019', 'Democratização do acesso ao cinema no Brasil', 'Cultura e diversidade',
    ['cinema|filme|audiovisual|sétima arte|sala de exibição|salas de exibição|cinematográf', 'democratiz|acesso|acessív|elitiz|desigual|exclus|ingresso']),
  enem(2018, 'enem-2018', 'Manipulação do comportamento do usuário pelo controle de dados na internet', 'Tecnologia e comunicação',
    ['dados|algoritm|informações pessoais|big data|privacidade', 'manipul|influênc|comportamento|bolha|controle|direcionad', 'internet|redes sociais|digital|online|plataforma|usuári']),
  enem(2017, 'enem-2017', 'Desafios para a formação educacional de surdos no Brasil', 'Educação',
    ['surd|deficiência auditiva|deficientes auditivos|libras|língua de sinais', 'educa|escol|ensino|formação|aprendiz|bilíngue|inclus']),
  enem(2016, 'enem-2016', 'Caminhos para combater a intolerância religiosa no Brasil', 'Cultura e diversidade',
    ['religi|crença|fé|culto|terreiro|candomblé|umbanda', 'intolerân|preconceito|discrimin|respeito|liberdade|laico|ódio|violência']),
  enem(2016, 'enem-2016-2', 'Caminhos para combater o racismo no Brasil', 'Cultura e diversidade',
    ['racis|racial|raça|negr|étnic|discrimina|preconceito', 'combat|enfrent|igualdade|cotas|educa|políticas']),
  enem(2015, 'enem-2015', 'A persistência da violência contra a mulher na sociedade brasileira', 'Violência e segurança',
    ['violência|agress|feminicíd|abuso|assédio|estupro', 'mulher|feminin|gênero|machis|patriarc', 'persist|ainda|perpetu|cultura|naturaliz']),
  enem(2014, 'enem-2014', 'Publicidade infantil em questão no Brasil', 'Tecnologia e comunicação',
    ['publicidade|propaganda|anúnci|marketing|comercia|consum', 'infantil|criança|infância|menores']),
  enem(2013, 'enem-2013', 'Efeitos da implantação da Lei Seca no Brasil', 'Violência e segurança',
    ['lei seca|álcool|alcool|bebida|embriaguez|alcoolizad', 'trânsito|motorista|direção|dirigir|acidente|volante|condutor']),
  enem(2012, 'enem-2012', 'O movimento imigratório para o Brasil no século XXI', 'Cidadania e direitos',
    ['imigra|migra|refugiad|estrangeir|haitian|venezuelan|xenofob', 'brasil|acolhi|integra|direit|trabalho']),
  enem(2011, 'enem-2011', 'Viver em rede no século XXI: os limites entre o público e o privado', 'Tecnologia e comunicação',
    ['rede|internet|redes sociais|digital|online|virtual', 'privad|privacidade|públic|intimidade|exposição|limite']),
  enem(2010, 'enem-2010', 'O trabalho na construção da dignidade humana', 'Trabalho e economia',
    ['trabalh|emprego|ofício|labor|profiss', 'dignidade|digno|humaniz|cidadania|realização|exploraç']),
  enem(2009, 'enem-2009', 'O indivíduo frente à ética nacional', 'Cidadania e direitos',
    ['ética|ético|moral|corrupç|honest|jeitinho', 'indivídu|cidadão|cidadãos|pessoa|sujeito|coletiv']),
  enem(2008, 'enem-2008', 'Como preservar a floresta Amazônica', 'Meio ambiente',
    ['amazôn|floresta|desmatament|queimada|bioma|mata', 'preserv|conserv|fiscaliz|proteç|sustentáv|multa|incentivo']),
  enem(2007, 'enem-2007', 'O desafio de se conviver com a diferença', 'Cultura e diversidade',
    ['diferen|diversidade|divers|plural|outro', 'conviv|respeito|toler|preconceito|aceita|inclus|discrimin']),
  enem(2006, 'enem-2006', 'O poder de transformação da leitura', 'Educação',
    ['leitura|ler|leitor|livro|literatura|letrament', 'transform|mudança|poder|formação|crítico|emancipa|conhecimento']),
  enem(2005, 'enem-2005', 'O trabalho infantil na realidade brasileira', 'Trabalho e economia',
    ['trabalho infantil|criança|infância|menores|infantil', 'trabalh|exploraç|labor|emprego']),
  enem(2004, 'enem-2004', 'Como garantir a liberdade de informação e evitar abusos nos meios de comunicação', 'Tecnologia e comunicação',
    ['informação|imprensa|mídia|comunicação|jornalis|notícia', 'liberdade|censura|abuso|manipula|ética|responsabilidade']),
  enem(2003, 'enem-2003', 'A violência na sociedade brasileira: como mudar as regras desse jogo', 'Violência e segurança',
    ['violência|violent|crime|criminal|homicíd|segurança', 'socied|social|desigualdade|mudar|regras|cultura']),
  enem(2002, 'enem-2002', 'O direito de votar: como fazer dessa conquista um meio para promover as transformações sociais', 'Cidadania e direitos',
    ['voto|votar|eleiç|eleitor|sufrágio|urna', 'transform|mudança|cidadan|democracia|consciência|participaç']),
  enem(2001, 'enem-2001', 'Desenvolvimento e preservação ambiental: como conciliar os interesses em conflito?', 'Meio ambiente',
    ['ambient|natureza|ecológ|sustentáv|preserv', 'desenvolviment|econom|progresso|crescimento|indústria|lucro']),
  enem(2000, 'enem-2000', 'Direitos da criança e do adolescente: como enfrentar esse desafio nacional', 'Cidadania e direitos',
    ['criança|adolescen|infância|infantil|juvent|menores|eca', 'direit|proteç|garantia|estatuto|violaç']),
  enem(1999, 'enem-1999', 'Cidadania e participação social', 'Cidadania e direitos',
    ['cidadan|cidadão|cidadãos', 'participa|engaja|mobiliza|coletiv|social|política']),
  enem(1998, 'enem-1998', 'Viver e aprender', 'Educação',
    ['aprend|educa|conhecimento|ensino|escola|saber', 'viver|vida|experiência|cotidian|existência']),

  // ---------------- Inéditos ----------------
  inedito('in-desinformacao', 'O combate à desinformação nas redes sociais no Brasil', 'Tecnologia e comunicação',
    ['desinforma|fake news|notícias falsas|informações falsas|boato|mentira', 'redes sociais|internet|digital|online|plataforma|whatsapp']),
  inedito('in-ia', 'Os impactos da inteligência artificial no mercado de trabalho brasileiro', 'Tecnologia e comunicação',
    ['inteligência artificial|ia|automaç|algoritm|robô|máquina', 'trabalh|emprego|desemprego|profiss|mercado|qualifica']),
  inedito('in-ia-educacao', 'Desafios do uso da inteligência artificial na educação brasileira', 'Educação',
    ['inteligência artificial|ia|chatgpt|chatbot|algoritm|tecnolog', 'educa|escol|ensino|aprendiz|estudant|professor']),
  inedito('in-saude-mental-jovens', 'Saúde mental dos jovens na era digital', 'Saúde',
    ['saúde mental|ansiedade|depress|psicológ|emocional|sofrimento', 'jovens|juvent|adolescen|estudant', 'digital|redes sociais|internet|tela|celular|virtual']),
  inedito('in-evasao', 'Os desafios para combater a evasão escolar no Brasil', 'Educação',
    ['evasão|abandono|abandonar|desistência|fora da escola|deixar a escola', 'escol|educa|ensino|estudant|aluno']),
  inedito('in-analfabetismo-funcional', 'O analfabetismo funcional como entrave ao desenvolvimento brasileiro', 'Educação',
    ['analfabet|letramento|compreensão de texto|interpretação|leitura', 'desenvolviment|cidadan|trabalho|econom|desigualdade']),
  inedito('in-educacao-financeira', 'A importância da educação financeira para os jovens brasileiros', 'Educação',
    ['financeir|dinheiro|endivid|dívida|consumo|orçamento|poupança', 'educa|escol|ensino|jovens|aprendiz']),
  inedito('in-ensino-tecnico', 'A valorização do ensino técnico e profissionalizante no Brasil', 'Educação',
    ['técnico|profissionaliz|cursos técnicos|qualificação|capacitação', 'valoriz|preconceito|mercado|trabalho|emprego|desvaloriz']),
  inedito('in-bullying', 'Caminhos para combater o bullying nas escolas brasileiras', 'Educação',
    ['bullying|cyberbullying|intimida|humilha|agressão|violência escolar', 'escol|estudant|aluno|educa|ambiente escolar']),
  inedito('in-obesidade', 'O avanço da obesidade infantil no Brasil', 'Saúde',
    ['obes|sobrepeso|excesso de peso|alimentação|ultraprocessad', 'infantil|criança|infância']),
  inedito('in-vacinacao', 'A queda da cobertura vacinal no Brasil', 'Saúde',
    ['vacina|imuniza|cobertura vacinal|antivacina', 'queda|baixa|redução|hesitação|desinforma|doenças']),
  inedito('in-sus', 'Desafios para a garantia do acesso à saúde pública no Brasil', 'Saúde',
    ['saúde|sus|hospital|atendimento|médic|sistema único', 'acesso|públic|garantia|filas|desigual|financiamento']),
  inedito('in-automedicacao', 'Os riscos da automedicação na sociedade brasileira', 'Saúde',
    ['automedica|medicament|remédio|fármac|farmácia', 'risco|perigo|intoxica|resistência|saúde']),
  inedito('in-suicidio', 'A prevenção ao suicídio entre jovens no Brasil', 'Saúde',
    ['suicíd|tirar a própria vida|autoextermínio|setembro amarelo', 'prevenç|jovens|saúde mental|apoio|acolhimento']),
  inedito('in-doacao-orgaos', 'A doação de órgãos no Brasil e seus desafios', 'Saúde',
    ['doação|doador|transplante|órgãos', 'família|recusa|conscientiza|fila|desafio']),
  inedito('in-alimentos', 'O desperdício de alimentos em um país com fome', 'Trabalho e economia',
    ['desperdíc|descarte|perda de alimentos|jogar fora', 'fome|insegurança alimentar|alimento|comida|miséria']),
  inedito('in-inseguranca-alimentar', 'Os desafios para erradicar a insegurança alimentar no Brasil', 'Trabalho e economia',
    ['fome|insegurança alimentar|desnutri|alimenta|comida', 'erradic|combat|políticas|renda|desigualdade|pobreza']),
  inedito('in-trabalho-plataformas', 'A precarização do trabalho por aplicativos no Brasil', 'Trabalho e economia',
    ['aplicativo|plataforma|entregador|motorista|uber|gig economy|uberiza', 'precariz|direitos trabalhistas|informal|exploraç|jornada|vínculo']),
  inedito('in-trabalho-escravo', 'A persistência do trabalho análogo à escravidão no Brasil', 'Trabalho e economia',
    ['análogo à escravidão|trabalho escravo|escravidão contemporânea|trabalho forçado|escraviz', 'persist|explora|fiscaliz|direitos|resgat']),
  inedito('in-desemprego-jovem', 'O desemprego entre os jovens brasileiros', 'Trabalho e economia',
    ['desemprego|desempregad|emprego|primeiro emprego|mercado de trabalho', 'jovens|juvent|nem-nem|recém-formad']),
  inedito('in-desigualdade', 'A desigualdade social como obstáculo ao desenvolvimento brasileiro', 'Trabalho e economia',
    ['desigualdade|concentração de renda|pobreza|miséria|abismo social', 'desenvolviment|econom|obstáculo|oportunidade|cidadan']),
  inedito('in-endividamento', 'O superendividamento das famílias brasileiras', 'Trabalho e economia',
    ['endivid|dívida|crédito|juros|inadimplên|superendivid', 'famíl|consum|educação financeira|renda']),
  inedito('in-apostas', 'Os impactos das apostas on-line na sociedade brasileira', 'Trabalho e economia',
    ['aposta|bets|jogos de azar|cassino|apostador|bet', 'vício|endivid|saúde mental|regulament|famíl|impact']),
  inedito('in-mobilidade', 'Desafios da mobilidade urbana nas grandes cidades brasileiras', 'Cidadania e direitos',
    ['mobilidade|transporte|trânsito|congestion|ônibus|metrô', 'urban|cidade|metrópole|periferia|deslocamento']),
  inedito('in-moradia', 'O déficit habitacional e o direito à moradia no Brasil', 'Cidadania e direitos',
    ['moradia|habita|casa|favela|sem-teto|situação de rua', 'direito|déficit|desigualdade|urbaniz|políticas']),
  inedito('in-situacao-rua', 'A invisibilidade da população em situação de rua no Brasil', 'Cidadania e direitos',
    ['situação de rua|morador de rua|moradores de rua|sem-teto|população de rua', 'invisi|preconceito|exclus|direitos|dignidade|aporofobia']),
  inedito('in-pessoas-deficiencia', 'A inclusão das pessoas com deficiência no mercado de trabalho', 'Cidadania e direitos',
    ['deficiência|pcd|deficientes|capacitis|acessibilidade', 'trabalho|emprego|mercado|inclus|contrata']),
  inedito('in-acessibilidade', 'Os desafios da acessibilidade nas cidades brasileiras', 'Cidadania e direitos',
    ['acessib|deficiência|mobilidade reduzida|rampa|cadeirante', 'cidade|urban|espaço públic|transporte|inclus']),
  inedito('in-idosos-abandono', 'O abandono de idosos na sociedade brasileira', 'Cidadania e direitos',
    ['idos|velhice|terceira idade|pessoa idosa|envelhec', 'abandono|negligên|solidão|violência|família|cuidado']),
  inedito('in-adocao', 'Os desafios da adoção de crianças e adolescentes no Brasil', 'Cidadania e direitos',
    ['adoç|adotar|adotiv|abrigo|acolhimento institucional', 'criança|adolescen|burocracia|perfil|família']),
  inedito('in-participacao-politica', 'A baixa participação política dos jovens brasileiros', 'Cidadania e direitos',
    ['política|voto|eleiç|participação|cidadania|democracia', 'jovens|juvent|desinteresse|apatia']),
  inedito('in-lgbt', 'O combate à LGBTfobia no Brasil', 'Cultura e diversidade',
    ['lgbt|homofob|transfob|lgbtfob|orientação sexual|identidade de gênero|homossex', 'combat|preconceito|violência|discrimin|direitos|respeito']),
  inedito('in-xenofobia', 'A xenofobia contra imigrantes e refugiados no Brasil', 'Cultura e diversidade',
    ['xenofob|imigrant|refugiad|estrangeir|migrant', 'preconceito|discrimin|acolhi|integra|direitos']),
  inedito('in-patrimonio', 'A preservação do patrimônio histórico e cultural brasileiro', 'Cultura e diversidade',
    ['patrimônio|histórico|museu|monumento|memória|tombamento', 'preserv|conserv|abandono|incêndio|valoriz|cultur']),
  inedito('in-leitura', 'O incentivo à leitura entre os jovens brasileiros', 'Cultura e diversidade',
    ['leitura|ler|leitor|livro|literatura|biblioteca', 'jovens|juvent|incentiv|hábito|estudant']),
  inedito('in-cultura-periferia', 'O acesso à cultura nas periferias brasileiras', 'Cultura e diversidade',
    ['cultur|arte|teatro|museu|cinema|lazer', 'periferi|comunidade|favela|acesso|desigual|democratiz']),
  inedito('in-indigenas-saude', 'A crise humanitária e sanitária dos povos indígenas no Brasil', 'Cultura e diversidade',
    ['indígen|yanomami|povos originários|aldeia|terra indígena', 'saúde|crise|garimpo|desnutri|demarca|direitos']),
  inedito('in-lixo', 'Os desafios da gestão de resíduos sólidos no Brasil', 'Meio ambiente',
    ['resíduo|lixo|reciclag|lixão|aterro|descarte', 'gestão|coleta|ambient|poluiç|sustentáv']),
  inedito('in-agua', 'A crise hídrica e o uso consciente da água no Brasil', 'Meio ambiente',
    ['água|hídric|seca|estiagem|reservatório|abastecimento', 'consum|desperdíc|consciente|crise|sustentáv']),
  inedito('in-clima', 'Os efeitos das mudanças climáticas no Brasil', 'Meio ambiente',
    ['climátic|aquecimento global|clima|efeito estufa|eventos extremos|enchente', 'efeito|impact|consequên|desastre|vulnerab|adapta']),
  inedito('in-saneamento', 'A falta de saneamento básico como problema de saúde pública', 'Meio ambiente',
    ['saneamento|esgoto|água tratada|água potável|coleta', 'saúde|doença|públic|desigual|periferi']),
  inedito('in-queimadas', 'As queimadas no Pantanal e no Cerrado e seus impactos', 'Meio ambiente',
    ['queimada|incêndio|fogo|pantanal|cerrado', 'impact|biodiversidade|fauna|flora|fiscaliz|ambient']),
  inedito('in-consumismo', 'O consumismo e seus impactos ambientais na sociedade contemporânea', 'Meio ambiente',
    ['consum|compras|obsolescência|descartáv|fast fashion', 'ambient|sustentáv|lixo|recurso|natureza|planeta']),
  inedito('in-animais', 'O abandono e os maus-tratos de animais no Brasil', 'Meio ambiente',
    ['animal|animais|pet|cão|cães|gato|maus-tratos|maus tratos', 'abandono|crueldade|proteç|adoção|castração|lei']),
  inedito('in-violencia-escolas', 'A violência nas escolas brasileiras', 'Violência e segurança',
    ['violência|ataque|agress|arma|massacre', 'escol|estudant|aluno|professor|ambiente escolar']),
  inedito('in-feminicidio', 'O feminicídio no Brasil e os caminhos para enfrentá-lo', 'Violência e segurança',
    ['feminicíd|violência contra a mulher|assassinato de mulheres|violência doméstica', 'mulher|gênero|machis|patriarc|lei maria da penha']),
  inedito('in-encarceramento', 'Os desafios do sistema prisional brasileiro', 'Violência e segurança',
    ['prisional|presídio|cadeia|encarcera|detento|presos|penitenciár', 'superlota|ressocializ|reincidência|direitos|facç']),
  inedito('in-golpes-digitais', 'O aumento dos golpes digitais no Brasil', 'Violência e segurança',
    ['golpe|fraude|estelionato|phishing|crime cibernético|crimes virtuais|pix', 'digital|internet|online|virtual|celular|idosos']),
  inedito('in-violencia-policial', 'Letalidade policial e segurança pública no Brasil', 'Violência e segurança',
    ['policial|polícia|letalidade|abordagem|segurança pública', 'violência|morte|racis|periferi|direitos humanos']),
  inedito('in-acidentes-transito', 'A violência no trânsito brasileiro', 'Violência e segurança',
    ['trânsito|acidente|motorista|motociclista|velocidade|rodovia', 'violência|morte|imprudência|fiscaliz|educação no trânsito']),
  inedito('in-exposicao-criancas', 'A exposição de crianças nas redes sociais', 'Tecnologia e comunicação',
    ['criança|infantil|infância|menores|filhos', 'exposição|redes sociais|internet|influenciador|sharenting|adultização']),
  inedito('in-dependencia-digital', 'A dependência tecnológica na sociedade contemporânea', 'Tecnologia e comunicação',
    ['dependência|vício|uso excessivo|nomofobia|compulsiv', 'tecnolog|celular|internet|digital|tela|redes sociais']),
  inedito('in-inclusao-digital', 'A exclusão digital no Brasil', 'Tecnologia e comunicação',
    ['exclusão digital|inclusão digital|acesso à internet|conectividade|internet', 'desigual|periferi|rural|educa|cidadan|acesso']),
  inedito('in-discurso-odio', 'Os limites entre liberdade de expressão e discurso de ódio na internet', 'Tecnologia e comunicação',
    ['discurso de ódio|ódio|ofensa|intolerância|ataque', 'liberdade de expressão|internet|redes sociais|limite|regulament']),
  inedito('in-privacidade', 'A proteção de dados pessoais na era digital', 'Tecnologia e comunicação',
    ['dados pessoais|privacidade|lgpd|vazamento|informações pessoais', 'proteç|segurança|digital|empresa|consentimento']),
  inedito('in-cancelamento', 'A cultura do cancelamento nas redes sociais', 'Tecnologia e comunicação',
    ['cancelamento|cancelad|linchamento virtual|julgamento', 'redes sociais|internet|digital|online|virtual']),
  inedito('in-esporte', 'O esporte como instrumento de inclusão social no Brasil', 'Cultura e diversidade',
    ['esporte|esportiv|atleta|prática esportiva|atividade física', 'inclus|social|jovens|periferi|oportunidade']),
  inedito('in-gravidez-adolescencia', 'A gravidez na adolescência como desafio social no Brasil', 'Saúde',
    ['gravidez|gestação|grávida|maternidade precoce', 'adolescên|adolescente|jovens|educação sexual|evasão']),
  inedito('in-drogas', 'O uso de drogas entre jovens brasileiros', 'Saúde',
    ['drogas|entorpecente|vape|cigarro eletrônico|álcool|dependência química', 'jovens|adolescen|juvent|prevenç|saúde']),
  inedito('in-sedentarismo', 'O sedentarismo como problema de saúde pública', 'Saúde',
    ['sedentar|atividade física|exercício|inatividade', 'saúde|doença|obesidade|públic|qualidade de vida']),
  inedito('in-cotas', 'A importância das políticas de cotas no ensino superior', 'Educação',
    ['cotas|ações afirmativas|ação afirmativa|reserva de vagas', 'ensino superior|universidade|faculdade|educa|acesso|desigual']),
  inedito('in-valorizacao-professor', 'A valorização do professor na educação brasileira', 'Educação',
    ['professor|docente|magistério|educador', 'valoriz|salário|desvaloriz|formação|carreira|respeito']),
  inedito('in-educacao-ambiental', 'A educação ambiental nas escolas brasileiras', 'Meio ambiente',
    ['ambient|sustentáv|ecológ|natureza|preserv', 'educa|escol|ensino|aluno|currículo']),
  inedito('in-turismo', 'Os impactos do turismo predatório no Brasil', 'Meio ambiente',
    ['turismo|turista|turístic', 'predatór|impacto|degrada|ambient|sustentáv|comunidade']),
  inedito('in-voluntariado', 'O papel do voluntariado na sociedade brasileira', 'Cidadania e direitos',
    ['voluntári|voluntariado|solidariedade|trabalho social|ong', 'socied|cidadan|comunidade|engaja|transform']),
]

export const TODOS_TEMAS = [...APOSTAS, ...TEMAS]

export function buscarTema(id) {
  if (!id) return null
  return TODOS_TEMAS.find((x) => x.id === id) || null
}

export function temaAleatorio(lista = TEMAS) {
  return lista[Math.floor(Math.random() * lista.length)]
}

const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Temas do banco relacionados a uma palavra-chave (título, eixo ou palavras do recorte). */
export function temasPorPalavra(chave) {
  const q = semAcento(chave.trim())
  if (q.length < 3) return []
  const raiz = q.length > 5 ? q.slice(0, q.length - 2) : q
  return TODOS_TEMAS.filter((t) => {
    const alvo = semAcento(`${t.titulo} ${t.eixo} ${t.grupos.join(' ')}`)
    return alvo.includes(q) || alvo.includes(raiz)
  })
}

/** Gera um tema no formato do ENEM a partir de uma palavra-chave livre. */
export function gerarTemaLivre(chave) {
  const k = chave.trim().replace(/s+/g, ' ')
  const modelos = [
    `Desafios para o enfrentamento de questões ligadas a ${k} no Brasil`,
    `Os impactos de ${k} na sociedade brasileira`,
    `Caminhos para ampliar o debate sobre ${k} no Brasil`,
    `Perspectivas acerca de ${k} na sociedade brasileira`,
  ]
  const termos = semAcento(k).split(/s+/).filter((w) => w.length > 3).map((w) => (w.length > 6 ? w.slice(0, w.length - 2) : w))
  return { id: null, titulo: modelos[Math.floor(Math.random() * modelos.length)], livre: true, eixo: 'Tema livre', grupos: termos.length ? [termos.join('|')] : undefined }
}
