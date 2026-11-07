// Base de repertório sociocultural reconhecido pelo corretor (Competência 2).
// Cada entrada: termo de busca (case-insensitive) → tipo.

const autores = [
  'Zygmunt Bauman', 'Bauman', 'Immanuel Kant', 'Kant', 'Aristóteles', 'Platão', 'Sócrates', 'Michel Foucault',
  'Foucault', 'Hannah Arendt', 'Arendt', 'Émile Durkheim', 'Durkheim', 'Max Weber', 'Weber', 'Karl Marx', 'Marx',
  'Rousseau', 'Thomas Hobbes', 'Hobbes', 'John Locke', 'Locke', 'Montesquieu', 'Paulo Freire', 'Sérgio Buarque de Holanda',
  'Sérgio Buarque', 'Gilberto Freyre', 'Darcy Ribeiro', 'Djamila Ribeiro', 'Simone de Beauvoir', 'Beauvoir', 'Nietzsche',
  'Jean-Paul Sartre', 'Sartre', 'Descartes', 'Maquiavel', 'Habermas', 'Pierre Bourdieu', 'Bourdieu', 'Byung-Chul Han',
  'Milton Santos', 'Florestan Fernandes', 'Machado de Assis', 'Carlos Drummond de Andrade', 'Drummond',
  'Clarice Lispector', 'Graciliano Ramos', 'Guimarães Rosa', 'Monteiro Lobato', 'Lima Barreto', 'Aluísio Azevedo',
  'Jorge Amado', 'Chico Buarque', 'Gandhi', 'Martin Luther King', 'Nelson Mandela', 'Mandela', 'Albert Einstein', 'Einstein',
  'Theodor Adorno', 'Adorno', 'Horkheimer', 'Noam Chomsky', 'Chomsky', 'George Orwell', 'Orwell', 'Aldous Huxley',
  'Huxley', 'Mário Quintana', 'Cecília Meireles', 'Conceição Evaristo', 'Ailton Krenak', 'Krenak', 'Nísia Floresta',
  'Silvio Almeida', 'Lélia Gonzalez', 'Abdias do Nascimento', 'Achille Mbembe', 'Mbembe', 'Frantz Fanon', 'Fanon',
  'Bell Hooks', 'Angela Davis', 'Sueli Carneiro', 'Kabengele Munanga', 'Edgar Morin', 'Morin', 'Jean Piaget', 'Piaget',
  'Vygotsky', 'Freud', 'Sigmund Freud', 'Carl Jung', 'Jung', 'Guy Debord', 'Debord', 'Marshall McLuhan', 'McLuhan',
  'Pierre Lévy', 'Manuel Castells', 'Castells', 'Shoshana Zuboff', 'Zuboff', 'Yuval Harari', 'Harari', 'Bertrand Russell',
  'Voltaire', 'Hegel', 'Schopenhauer', 'Spinoza', 'Santo Agostinho', 'Tomás de Aquino', 'John Rawls', 'Rawls',
  'Amartya Sen', 'Thomas Piketty', 'Piketty', 'Adam Smith', 'Keynes', 'Celso Furtado', 'Josué de Castro',
  'Euclides da Cunha', 'Castro Alves', 'Gonçalves Dias', 'José de Alencar', 'Rachel de Queiroz', 'Carolina Maria de Jesus',
  'Ariano Suassuna', 'Oswald de Andrade', 'Mário de Andrade', 'Cora Coralina', 'Vinicius de Moraes', 'Manuel Bandeira',
  'Fernando Pessoa', 'Camões', 'Saramago', 'José Saramago', 'Shakespeare', 'Kafka', 'Franz Kafka', 'Dostoiévski',
  'Victor Hugo', 'Charles Darwin', 'Darwin', 'Stephen Hawking', 'Carl Sagan', 'Rachel Carson', 'Chico Mendes',
  'Malala', 'Greta Thunberg', 'Anísio Teixeira', 'Dom Pedro II', 'Getúlio Vargas', 'Zumbi dos Palmares', 'Zumbi',
  'Dandara', 'Luiz Gama', 'André Rebouças', 'Hipócrates', 'Oswaldo Cruz', 'Nise da Silveira', 'Pitágoras', 'Heráclito',
  'Bobbio', 'Norberto Bobbio', 'Gramsci', 'Althusser', 'Lipovetsky', 'Gilles Lipovetsky', 'Sêneca', 'Epicuro',
  'Erving Goffman', 'Goffman', 'Boaventura de Sousa Santos', 'Raymundo Faoro', 'Antonio Candido', 'Lilia Schwarcz',
  'Leonardo Boff', 'Rubem Alves', 'Cazuza', 'Racionais MCs', 'Emicida', 'Gonzaguinha', 'Gilberto Gil', 'Caetano Veloso',
  'Raul Seixas', 'Legião Urbana', 'Renato Russo', 'Charles Chaplin', 'Chaplin', 'Michel de Montaigne',
]

const leis = [
  'Constituição Federal', 'Constituição de 1988', 'Constituição Cidadã', 'Carta Magna', 'Carta Constitucional',
  'Estatuto da Criança e do Adolescente', 'ECA', 'Estatuto do Idoso', 'Estatuto da Pessoa Idosa',
  'Estatuto da Pessoa com Deficiência', 'Lei Brasileira de Inclusão', 'Lei Maria da Penha', 'Lei de Diretrizes e Bases',
  'LDB', 'Declaração Universal dos Direitos Humanos', 'DUDH', 'Código de Defesa do Consumidor', 'Código Penal',
  'Código Civil', 'Marco Civil da Internet', 'Lei Geral de Proteção de Dados', 'LGPD', 'Lei de Cotas', 'Lei Áurea',
  'Agenda 2030', 'Objetivos de Desenvolvimento Sustentável', 'ODS', 'Acordo de Paris', 'Protocolo de Kyoto',
  'Lei Seca', 'Lei do Feminicídio', 'Estatuto da Igualdade Racial', 'Lei 10.639', 'Lei 11.645', 'Lei de Libras',
  'Lei Rouanet', 'Base Nacional Comum Curricular', 'BNCC', 'Plano Nacional de Educação', 'Código Florestal',
  'Estatuto das Cidades', 'Estatuto da Cidade', 'Estatuto da Juventude', 'Lei Antirracismo', 'Lei Caó',
  'Convenção sobre os Direitos das Pessoas com Deficiência', 'Lei da Anistia', 'Lei de Acesso à Informação',
  'Lei Berenice Piana', 'Lei Carolina Dieckmann', 'Lei da Ficha Limpa', 'Reforma Psiquiátrica', 'Lei Antimanicomial',
  'Política Nacional', 'Programa Nacional', 'artigo 5º', 'artigo 6º', 'art. 5º', 'art. 6º', 'artigo 196', 'artigo 205',
  'artigo 215', 'artigo 225', 'artigo 227', 'artigo 230',
]

const instituicoes = [
  'IBGE', 'OMS', 'Organização Mundial da Saúde', 'ONU', 'Organização das Nações Unidas', 'UNESCO', 'UNICEF', 'IPEA',
  'Datafolha', 'Fiocruz', 'INEP', 'OCDE', 'PISA', 'Banco Mundial', 'Anistia Internacional', 'Fórum Brasileiro de Segurança Pública',
  'Atlas da Violência', 'Unesco', 'Unicef', 'Ministério da Saúde', 'Ministério da Educação', 'Ibope', 'Instituto Locomotiva',
  'PNAD', 'Censo', 'Censo Demográfico', 'OIT', 'Organização Internacional do Trabalho', 'FAO', 'IPCC', 'INPE', 'Imazon',
  'MapBiomas', 'Human Rights Watch', 'Oxfam', 'Instituto Trata Brasil', 'Cetic', 'TIC Kids Online', 'CNJ', 'STF',
  'Supremo Tribunal Federal', 'Unaids', 'Rede Penssan', 'Instituto Alana', 'Agência Brasil', 'Instituto Sou da Paz',
  'Ipsos', 'Pew Research', 'Universidade de Harvard', 'Universidade de Oxford', 'USP', 'Unicamp', 'Anatel', 'Anvisa',
]

const historicos = [
  'Revolução Industrial', 'Era Vargas', 'ditadura militar', 'Regime Militar', 'Revolução Francesa', 'Segunda Guerra Mundial',
  'Primeira Guerra Mundial', 'Guerra Fria', 'Brasil Colônia', 'período colonial', 'escravidão', 'Abolição da Escravatura',
  'Iluminismo', 'Idade Média', 'Renascimento', 'Grécia Antiga', 'Roma Antiga', 'Holocausto', 'Apartheid',
  'Revolta da Vacina', 'Semana de Arte Moderna', 'Diretas Já', 'Proclamação da República', 'Primeira República',
  'República Velha', 'Revolução Verde', 'Revolução Técnico-Científica', 'Terceira Revolução Industrial',
  'Quarta Revolução Industrial', 'Globalização', 'pandemia de Covid-19', 'pandemia', 'Belle Époque', 'Reforma Pereira Passos',
  'Lei de Terras', 'Quilombo dos Palmares', 'Revolta da Chibata', 'Constituinte', 'Guerra de Canudos', 'Canudos',
  'Massacre do Carandiru', 'Rio-92', 'Eco-92', 'Conferência de Estocolmo', 'Plano Real',
]

const obras = [
  '1984', 'Admirável Mundo Novo', 'Vidas Secas', 'O Cortiço', 'Capitães da Areia', 'Tempos Modernos', 'Black Mirror',
  'O Alienista', 'Dom Casmurro', 'Memórias Póstumas', 'Quarto de Despejo', 'Macunaíma', 'Os Sertões', 'Grande Sertão',
  'O Auto da Compadecida', 'Ensaio sobre a Cegueira', 'A Revolução dos Bichos', 'O Mito da Caverna', 'Alegoria da Caverna',
  'Casa-Grande & Senzala', 'Casa-Grande e Senzala', 'Raízes do Brasil', 'O Povo Brasileiro', 'Modernidade Líquida',
  'Vigiar e Punir', 'Sociedade do Cansaço', 'O Segundo Sexo', 'Pedagogia do Oprimido', 'Pedagogia da Autonomia',
  'O Príncipe', 'Leviatã', 'O Contrato Social', 'Do Contrato Social', 'O Espírito das Leis', 'A Sociedade do Espetáculo',
  'Sapiens', 'O Dilema das Redes', 'Coringa', 'Cidade de Deus', 'Que Horas Ela Volta', 'Bacurau', 'Central do Brasil',
  'Divertida Mente', 'Wall-E', 'Matrix', 'Ilha das Flores', 'Torto Arado', 'Pequeno Manual Antirracista', 'O Quinze',
  'Morte e Vida Severina', 'Os Miseráveis', 'O Pequeno Príncipe', 'A Metamorfose', 'Fahrenheit 451',
  'O Conto da Aia', 'Holocausto Brasileiro', 'Ideias para Adiar o Fim do Mundo', 'Racismo Estrutural',
  'Olhos d’Água', 'Olhos d\'Água', 'Primavera Silenciosa', 'Eles Não Usam Black-Tie', 'Marighella', 'Ainda Estou Aqui',
]

export const REPERTORIO = [
  ...autores.map((t) => ({ t, tipo: 'autor' })),
  ...leis.map((t) => ({ t, tipo: 'legislação' })),
  ...instituicoes.map((t) => ({ t, tipo: 'dado/instituição' })),
  ...historicos.map((t) => ({ t, tipo: 'fato histórico' })),
  ...obras.map((t) => ({ t, tipo: 'obra' })),
]

// Padrões genéricos que indicam repertório (dados, citações, fontes).
export const PADROES_REPERTORIO = [
  { re: /(?<![\p{L}])(?:segundo|conforme|consoante)\s+(?:o|a|os|as)\s+(?:filósof[oa]|sociólog[oa]|pensador[a]?|escritor[a]?|historiador[a]?|antropólog[oa]|geógraf[oa]|psicanalista|economista|educador[a]?|psicólog[oa]|cientista|jurista|poeta|poetisa|autor[a]?|médic[oa]|ativista|biólog[oa]|físic[oa])\s+[\p{Lu}][\p{L}]+(?:\s+(?:de|da|do|dos|das)?\s*[\p{Lu}][\p{L}]+)*/gu, tipo: 'autor' },
  { re: /(?<![\p{L}])(?:o|a)\s+(?:filósof[oa]|sociólog[oa]|pensador[a]?|escritor[a]?|historiador[a]?|antropólog[oa]|geógraf[oa]|psicanalista|economista|educador[a]?|psicólog[oa]|poeta|poetisa|ativista)\s+(?:\p{L}+\s+)?[\p{Lu}][\p{L}]+(?:\s+[\p{Lu}][\p{L}]+)*/gu, tipo: 'autor' },
  { re: /\b\d{1,3}(?:[.,]\d+)?\s?%/gu, tipo: 'dado estatístico' },
  { re: /(?<![\p{L}])(?:segundo|de acordo com|conforme)\s+(?:dados|pesquisa|levantamento|estudo|relatório|estimativa|índice)s?\b/giu, tipo: 'dado estatístico' },
  { re: /(?<![\p{L}])(?:dados|pesquisa|levantamento|relatório|estudo)s?\s+(?:d[oa]s?|realizad[oa]s?\s+pel[oa]s?|divulgad[oa]s?\s+pel[oa]s?)\s+[\p{Lu}][\p{L}\p{Lu}]+/gu, tipo: 'dado estatístico' },
  { re: /(?<![\p{L}])(?:no|o)\s+(?:livro|romance|filme|documentário|série|poema|conto|obra|longa-metragem|álbum)\s+["“«][^"”»]{2,60}["”»]/giu, tipo: 'obra' },
  { re: /(?<![\p{L}])(?:a|na)\s+(?:obra|música|canção|série|novela|peça)\s+["“«][^"”»]{2,60}["”»]/giu, tipo: 'obra' },
  { re: /(?<![\p{L}])(?:no|o)\s+(?:livro|romance|filme|documentário|poema|conto|longa-metragem)\s+[\p{Lu}][\p{L}]+(?:\s+(?:d[aoe]s?|e)?\s*[\p{Lu}][\p{L}]+)*/gu, tipo: 'obra' },
  { re: /(?<![\p{L}])(?:artigo|art\.)\s*\d+º?(?:\s+d[ao]\s+[\p{Lu}][\p{L}]+(?:\s+[\p{Lu}][\p{L}]+)*)?/gu, tipo: 'legislação' },
  { re: /(?<![\p{L}])(?:no|em)\s+(?:século\s+[XVI]+|\d{4})\b/gu, tipo: 'contexto histórico' },
]
