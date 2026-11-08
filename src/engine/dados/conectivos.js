// Conectivos (operadores argumentativos) agrupados por relação lógica.
// Usados na Competência 4 (coesão) e no material de estudo.

export const GRUPOS_CONECTIVOS = {
  adição: [
    'além disso', 'ademais', 'outrossim', 'também', 'não só', 'mas também', 'bem como', 'somado a isso',
    'soma-se a isso', 'além de', 'sobretudo', 'inclusive', 'de mais a mais', 'acrescenta-se a isso',
    'aliado a isso', 'paralelo a isso', 'concomitantemente',
  ],
  oposição: [
    'contudo', 'entretanto', 'no entanto', 'todavia', 'porém', 'mas', 'embora', 'apesar de', 'apesar disso',
    'não obstante', 'ainda que', 'mesmo que', 'conquanto', 'em contrapartida', 'por outro lado', 'ao passo que',
    'enquanto', 'em oposição a', 'ao contrário', 'em detrimento de',
  ],
  causa: [
    'porque', 'pois', 'visto que', 'uma vez que', 'já que', 'dado que', 'posto que', 'haja vista', 'devido a',
    'devido à', 'em virtude de', 'em razão de', 'por causa de', 'graças a', 'tendo em vista', 'porquanto',
    'isso ocorre porque', 'isso se deve', 'em decorrência de', 'em função de', 'decorrente de',
  ],
  conclusão: [
    'portanto', 'logo', 'dessa forma', 'desse modo', 'dessa maneira', 'destarte', 'dessarte', 'por conseguinte',
    'consequentemente', 'em suma', 'em síntese', 'enfim', 'por fim', 'diante disso', 'diante do exposto',
    'diante dessa realidade', 'diante desse cenário', 'sendo assim', 'assim sendo', 'nesse sentido',
    'nessa perspectiva', 'sob esse viés', 'sob essa ótica', 'nesse contexto', 'nesse cenário', 'com isso',
    'por isso', 'de modo que', 'de forma que', 'à vista disso', 'em vista disso', 'assim', 'urge, portanto',
    'infere-se', 'conclui-se', 'depreende-se', 'nessa lógica', 'nessa conjuntura', 'por essa razão', 'por esse motivo',
    'nesse âmbito', 'sob essa perspectiva', 'sob esse prisma', 'nessa ótica', 'à luz disso', 'diante desse quadro',
  ],
  explicação: [
    'por exemplo', 'isto é', 'ou seja', 'a exemplo de', 'de fato', 'com efeito', 'efetivamente', 'a saber',
    'vale ressaltar', 'convém ressaltar', 'cabe ressaltar', 'é válido ressaltar', 'é importante salientar',
    'evidentemente', 'nota-se', 'percebe-se', 'observa-se', 'evidencia-se', 'é notório', 'é inegável',
  ],
  comparação: [
    'conforme', 'de acordo com', 'consoante', 'assim como', 'da mesma forma', 'analogamente', 'similarmente',
    'tal qual', 'à semelhança de', 'do mesmo modo',
  ],
  ordem: [
    'em primeiro lugar', 'em segundo lugar', 'em terceiro lugar', 'em primeiro plano', 'em segundo plano', 'primeiramente', 'inicialmente',
    'a princípio', 'em primeira análise', 'em segunda análise', 'posteriormente', 'finalmente',
    'por último', 'em seguida', 'paralelamente', 'de início',
  ],
  finalidade: [
    'a fim de', 'para que', 'com o objetivo de', 'com o intuito de', 'no intuito de', 'com a finalidade de',
    'visando', 'com o propósito de',
  ],
  condição: ['caso', 'desde que', 'contanto que', 'a menos que', 'salvo se'],
}

export const CONECTIVOS = Object.entries(GRUPOS_CONECTIVOS).flatMap(([tipo, lista]) =>
  lista.map((t) => ({ t, tipo })),
)

// Elementos de coesão referencial (retomada de termos).
export const REFERENCIAIS = [
  'esse', 'essa', 'esses', 'essas', 'isso', 'tal', 'tais', 'o qual', 'a qual', 'os quais', 'as quais',
  'cujo', 'cuja', 'cujos', 'cujas', 'este', 'esta', 'estes', 'estas', 'aquele', 'aquela', 'aqueles',
  'aquelas', 'tal cenário', 'tal problemática', 'essa conjuntura', 'esse quadro', 'tal situação',
  'esse cenário', 'essa realidade', 'tal realidade', 'esse problema', 'tal entrave', 'esse entrave',
]
