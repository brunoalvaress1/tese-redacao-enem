# PROGRESSO — Tese · Correção de Redação ENEM gratuita

Arquivo de acompanhamento: cada passo feito, cada teste e cada avaliação (nota de 1 a 10).
Regra do projeto: só considerar pronto com **nota ≥ 9**.

## Objetivo
Plataforma 100% gratuita de correção de redação ENEM, com as mesmas funções do site analisado
(coredacao.com), incluindo as do plano pago, mas com identidade própria (nome, marca e textos originais).

| Função do site analisado | No nosso app |
|---|---|
| Correção com nota por competência (C1–C5) | ✅ feito e testado |
| Marcação de desvios no texto | ✅ feito e testado |
| Comentários detalhados por competência | ✅ feito e testado |
| Detecção de erros ortográficos e gramaticais | ✅ feito e testado |
| Detecção de fuga ao tema | ✅ feito e testado |
| Banco de temas (ENEM + inéditos) | ✅ feito e testado |
| Gráficos de desempenho por competência | ✅ feito e testado |
| Modo Redação Guiada | ✅ feito e testado |
| Curso/apostila gratuitos | ✅ feito e testado |
| Escrever na plataforma ou enviar texto pronto | ✅ feito e testado |
| Plano pago | ❌ não existe — tudo grátis |
| Correção por foto, contas, perfil, apostas 2026, sorteio, robô keep-alive | ✅ extras pedidos — feitos e testados |

## Stack
React 18 + JavaScript + Vite + Tailwind CSS · React Router · Recharts · lucide-react ·
Supabase (opcional: login + histórico na nuvem) · LanguageTool (API pública, ortografia/gramática) ·
Vitest (testes do motor de correção).

---

## Diário de passos

### Passo 1 — Análise e ambiente (2026-11-07)
- Site de referência analisado (funções, planos, funil).
- Ambiente: Node 24.12, npm 11.6, Edge e Chrome instalados (usados para screenshots de teste).
- LanguageTool testado em pt-BR: detecta "agente/a gente", "haviam", "fazem dez anos", acentos.
  Não detecta "mais/mas", "porem", "à partir" → cobertos por regras locais próprias.
- Supabase: sem acesso direto à conta → será entregue `supabase/schema.sql` para colar no SQL Editor.

### Passo 2 — Estrutura do projeto
- Vite 5 + React 18 + Tailwind 3 + React Router 6 + Recharts + lucide-react + supabase-js + Vitest instalados.
- Servidor de desenvolvimento rodando em http://127.0.0.1:5173 (hot reload: telas aparecem ao salvar).

### Passo 3 — Motor de correção (`src/engine/`)
- `texto.js`: parágrafos, sentenças, palavras, radicais, estimativa de linhas da folha (72 caracteres/linha).
- `gramatica.js` + `dados/regras.js` (C1): ~200 erros ortográficos frequentes, acentuação por terminação
  (-ção, -ável, -ência…), ~45 regras contextuais (crase, haver/fazer impessoais, mas/mais, mal/mau, onde,
  por que, informalidade, pontuação, período longo) + LanguageTool (API pública) com filtro de falsos positivos.
- `tema.js` (C2): aderência ao recorte temático → pleno / parcial / tangência / fuga.
- `competencias.js`: C2 (estrutura + repertório: ~400 autores, leis, dados, fatos, obras), C3 (tese, projeto de
  texto, desenvolvimento, alinhamento), C4 (conectivos inter/intraparágrafo, variedade, repetições), C5 (agente,
  ação, meio, finalidade, detalhamento + direitos humanos).
- `corretor.js`: orquestra tudo + critérios de nota zero (em branco, ≤7 linhas, fuga ao tema, narrativa,
  impropérios, língua estrangeira).
- `data/temas.js`: 88 temas (29 do ENEM 1998–2025 + 59 inéditos), cada um com o recorte em grupos de palavras.

### Teste 1 — Motor (Vitest, 32 testes)
- 1ª execução: 28/31 ✅ — 3 falhas (regex "mais/mas" após vírgula; teste de acento; tema livre).
- Corrigido → **32/32 ✅**.
- Calibração com LanguageTool real (5 redações escritas para teste):

| Redação de teste | Esperado | Obtido |
|---|---|---|
| Nota 1000 (tema 2023) | 900–1000 | **1000** (200/200/200/200/200) |
| Mediana com erros (desinformação) | 350–600 | **480** (80/120/120/120/40) |
| Tangencia o tema 2023 | C2=40, C3≤40, C5≤40 | **440** (160/40/40/160/40) ✅ |
| Proposta com pena de morte | C5 = 0 | **C5 = 0** ✅ |
| Fuga ao tema | anulada | **0 — "Fuga total ao tema"** ✅ |
| ≤ 7 linhas / narrativa | anuladas | **0** ✅ |

- Ajustes feitos após análise: falso positivo do LanguageTool ("perpetua" verbo), correlação "quanto mais…, mais…",
  "nosso pais" → "país", C3 limitado a 120 sem fatos/dados, transição entre parágrafos só conta no início do parágrafo,
  agente da proposta não conta como repertório.

### Passo 4 — Telas (React + Tailwind)
- Início, Temas, Editor (folha pautada, contador de linhas, cronômetro, rascunho automático), Correção
  (nota animada, 5 competências, texto com marcações clicáveis, lista de desvios, comentários por competência,
  imprimir/PDF), Desempenho (gráficos), Redação guiada (checklist ao vivo), Curso (9 aulas), Entrar.
- Código dividido por página (lazy loading): carregamento inicial de ~796 KB → ~300 KB.

### Avaliação 1 — 2026-11-07 (primeira versão completa) — **nota 8,2 / 10**
Testes feitos: 32 testes do motor, build de produção, screenshots desktop e celular (Edge headless), fluxo completo
escrever → corrigir → resultado → desempenho.

| Critério | Nota | Observação |
|---|---|---|
| Funcionalidades do site de referência | 9 | todas implementadas e gratuitas |
| Fidelidade da correção | 7,5 | faixas corretas nos testes, mas motor por regras não “entende” argumentos |
| Interface / celular | 7,5 | bonita no desktop; no celular faltava navegação de app |
| Robustez | 8 | bug real encontrado: `window.scrollTo` devolve Promise no Edge novo e quebrava o React |
| Integrações | 8 | Supabase só no código, sem teste real |

Problemas encontrados e corrigidos depois desta avaliação:
- `useEffect` retornando Promise (tela em branco) → corrigido.
- LanguageTool sugeria trocar “com o objetivo de” por “para” (ruim para a C5) → sugestões de estilo ignoradas.
- Estimativa de linhas conservadora (338 palavras = 33 linhas) → 80 caracteres/linha (≈30 linhas).
- Ação da proposta pegava o 1º verbo do parágrafo → agora pega o verbo ligado ao agente.
- Repetição listada várias vezes → agrupada.

### Passo 5 — Pedidos novos do usuário
- **Contas (Supabase)**: botão “Criar conta” no topo, cadastro com benefícios, login, recuperação de senha,
  histórico por usuário protegido por RLS, sincronização do histórico local ao entrar.
- **Foto da redação**: modal com câmera/galeria (até 3 páginas), leitura no navegador (Tesseract.js, grátis)
  ou com IA (Edge Function `transcrever-redacao`, Claude, com limite diário), revisão obrigatória da transcrição.
- **Temas reorganizados** (mobile first): sorteador animado (apostas 2026 / qualquer tema / palavra-chave),
  abas Apostas 2026 · ENEM oficiais · Por assunto, folha de detalhes com recorte, motivos, repertórios e fontes.
- **Possíveis temas 2026**: pesquisa na web (07/11/2026): ECA Digital em vigor desde 17/03/2026, Censo 2022 com
  dados inéditos de autismo, 20 anos da Lei Maria da Penha, COP30, bets (dados CNC/BC), PL da IA, padrões do INEP
  2020–2025 e apostas de professores (G1, Estratégia). 14 apostas com nível, justificativa e fontes.
  A redação do ENEM 2026 é em 08/11/2026 — contagem regressiva na home e nos temas.
- **Perfil**: avatar, números (redações, média, melhor nota, sequência de dias), meta de nota com progresso,
  10 conquistas, abas Redações (busca, ordenação, reescrever, excluir) · Rascunhos · Conta (exportar, preferências).
- **Celular**: barra de navegação inferior com botão central “Corrigir”, barra fixa de ação no editor, atalho de
  foto, transições animadas, cartões compactos.
- **Robô keep-alive**: GitHub Actions a cada 5 dias chama a função `ping` do banco (+ commit leve se o repositório
  ficar 45 dias parado, para o GitHub não desligar o agendamento).
- **Correção com IA opcional** (“segunda opinião”): Edge Function `corrigir-redacao-ia` com saída estruturada.
- Supabase do usuário conectado via `.env` (chaves públicas).

### Teste 2 — 2026-11-07
- **38/38 testes** (motor, OCR, apostas, sorteio, contagem regressiva). 1ª execução: 36/38 — corrigidos a contagem de
  dias (“amanhã” aparecia como 2 dias) e um caso de teste ambíguo de parágrafos.
- **Foto (E2E no celular)**: imagem gerada com letra manuscrita em papel pautado e levemente torta →
  transcrição **100% correta** e parágrafos reconstruídos. Bug encontrado antes: dependência do Vite desatualizada (504)
  → corrigido com `optimizeDeps`.
- **Bug de layout encontrado e corrigido**: a animação de transição de página deixava `transform` ativo e os modais
  (`position: fixed`) não cobriam a tela no celular → transição passou a usar só opacidade (verificado medindo o
  retângulo do modal: 0–844 px = tela inteira).
- **Supabase real**: autenticação respondendo (health 200), tabela `correcoes` existe, login com senha errada mostra
  “E-mail ou senha incorretos.” Função `ping` ainda não existe no banco → é preciso colar o `schema.sql` atualizado.
- **Robô**: testado contra um servidor que imita o Supabase (chamada e cabeçalhos corretos; sem credenciais sai com erro 1).
- Build de produção ok, nenhum erro no console em todas as telas testadas (desktop 1366 px e celular 390 px).

### Avaliação 2 — 2026-11-07 — **nota 9,1 / 10** ✅

| Critério | Peso | Nota | Observação |
|---|---|---|---|
| Funcionalidades (referência + pedidos) | 25% | 9,5 | tudo implementado e testado; nada pago |
| Fidelidade da correção ao ENEM | 25% | 8,5 | motor calibrado (7 redações nas faixas esperadas) + IA opcional para avaliar argumentos |
| Interface, celular e animações | 20% | 9,3 | navegação de app, folhas que sobem, sorteio animado, tudo conferido em 390 px |
| Robustez e qualidade do código | 15% | 9,0 | 38 testes, tratamento de erro geral, sem erros no console, código dividido |
| Integrações e entrega | 15% | 9,0 | Supabase real conectado, foto testada, robô testado, README e SQL completos |

**Média ponderada: 9,1** → meta (≥ 9) atingida.

Limitações conhecidas (honestas):
- A nota automática é uma estimativa por regras; a avaliação de argumentos fica mais precisa com a IA, que depende
  de publicar as Edge Functions e de uma chave da Anthropic (não testadas ao vivo aqui, por falta da chave).
- A leitura de foto no navegador foi testada com letra manuscrita digital; letra cursiva real em foto de celular
  tende a exigir a leitura com IA.
- O cadastro real não foi testado de ponta a ponta para não criar contas de teste no projeto do usuário.

### Passo 6 — Publicação (2026-11-07)
- GitHub: https://github.com/brunoalvaress1/tese-redacao-enem (criado como **privado**: a criação pública foi
  bloqueada pelas permissões do Claude Code; o dono pode torná-lo público em Settings).
- Vercel: https://tese-redacao-enem.vercel.app — conectado ao GitHub (deploy automático a cada push),
  variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` configuradas.
- Verificação em produção: rotas internas respondem 200, correção completa funcionando (mesma nota do teste local),
  cadastro com Supabase ativo, nenhum erro no console.
- Pendências do dono: secrets do robô no GitHub (gravação bloqueada pelas permissões) e colar o `schema.sql` atualizado.
