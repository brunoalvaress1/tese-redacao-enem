// Supabase Edge Function: "segunda opinião" — corrige a redação com o Claude seguindo a matriz do ENEM.
// Deploy:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//          supabase functions deploy corrigir-redacao-ia
// Opcional: supabase secrets set CORRECOES_IA_POR_DIA=10
import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const LIMITE_DIARIO = Number(Deno.env.get("CORRECOES_IA_POR_DIA") ?? "10");
const NIVEIS = [0, 40, 80, 120, 160, 200];

const SISTEMA = `Você é um corretor experiente da redação do ENEM e avalia textos dissertativo-argumentativos pela matriz de referência oficial do INEP.

Cada competência vale 0, 40, 80, 120, 160 ou 200 pontos:
- C1 (norma-padrão): 200 = no máximo desvios excepcionais e sem reincidência, com boa estrutura sintática; 160 = poucos desvios; 120 = alguns desvios; 80 = muitos desvios; 40 = desvios sistemáticos.
- C2 (proposta, tipo textual e repertório): 200 = tema completo, repertório legitimado, pertinente e produtivo e excelente domínio do tipo dissertativo-argumentativo; 160 = repertório pertinente e bom domínio; 120 = argumentação previsível ou repertório pouco produtivo; 80 = estrutura incompleta ou cópia dos textos motivadores; 40 = tangencia o tema.
- C3 (argumentação): 200 = projeto de texto estratégico e argumentos consistentes, com autoria; 160 = organizado, com indícios de autoria; 120 = limitado ou previsível; 80 = desorganizado; 40 = pouco relacionado ao tema.
- C4 (coesão): 200 = conectivos variados entre e dentro dos parágrafos, sem repetições ou inadequações; 160 = poucas inadequações; 120 = regular; 80 = pontual; 40 = rara.
- C5 (proposta de intervenção): conte os elementos válidos (agente, ação, meio/modo, finalidade, detalhamento); 5 = 200, 4 = 160, 3 = 120, 2 = 80, 1 ou proposta vaga = 40; ausência = 0. Proposta que desrespeita os direitos humanos recebe 0.

Nota zero total quando houver fuga completa ao tema, texto que não é dissertativo-argumentativo, até 7 linhas, impropérios ou língua estrangeira.

Seja calibrado como os corretores oficiais: não infle notas e não seja punitivo sem motivo. Escreva os comentários em português, falando diretamente com o estudante, de forma concreta e construtiva.
Em "desvios", liste no máximo 15 problemas reais, copiando o "trecho" exatamente como aparece no texto do estudante (mesmas letras, acentos e pontuação), para que ele possa ser destacado.`;

const ESQUEMA = {
  type: "object",
  additionalProperties: false,
  required: ["notas", "anulacao", "resumo", "comentarios", "melhorias", "desvios"],
  properties: {
    notas: {
      type: "object",
      additionalProperties: false,
      required: ["c1", "c2", "c3", "c4", "c5"],
      properties: Object.fromEntries(["c1", "c2", "c3", "c4", "c5"].map((k) => [k, { type: "integer", enum: NIVEIS }])),
    },
    anulacao: { type: "string", description: "Motivo da nota zero total, ou string vazia se não houver." },
    resumo: { type: "string", description: "Avaliação geral em 2 a 3 frases." },
    comentarios: {
      type: "object",
      additionalProperties: false,
      required: ["c1", "c2", "c3", "c4", "c5"],
      properties: Object.fromEntries(["c1", "c2", "c3", "c4", "c5"].map((k) => [k, { type: "string" }])),
    },
    melhorias: { type: "array", items: { type: "string" }, description: "As 3 a 5 ações mais importantes para subir a nota." },
    desvios: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["trecho", "correcao", "explicacao", "competencia"],
        properties: {
          trecho: { type: "string" },
          correcao: { type: "string" },
          explicacao: { type: "string" },
          competencia: { type: "integer", enum: [1, 2, 3, 4, 5] },
        },
      },
    },
  },
};

const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });

function json(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ erro: "Método não permitido." }, 405);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ erro: "Faça login para usar a correção com IA." }, 401);

  const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase.from("transcricoes").select("id", { count: "exact", head: true })
    .eq("tipo", "correcao").gte("criado_em", desde);
  if ((count ?? 0) >= LIMITE_DIARIO) {
    return json({ erro: `Limite de ${LIMITE_DIARIO} correções com IA por dia atingido. A correção automática gratuita continua disponível.` }, 429);
  }

  let corpo: { texto?: string; tema?: string };
  try {
    corpo = await req.json();
  } catch {
    return json({ erro: "Corpo da requisição inválido." }, 400);
  }
  const texto = (corpo.texto ?? "").trim();
  const tema = (corpo.tema ?? "").trim();
  if (texto.length < 30 || texto.length > 12000) return json({ erro: "Envie uma redação entre 30 e 12.000 caracteres." }, 400);

  try {
    const resposta = await anthropic.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      system: SISTEMA,
      output_config: { effort: "high", format: { type: "json_schema", schema: ESQUEMA } },
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      messages: [{
        role: "user",
        content: `Tema proposto: ${tema || "(não informado — avalie a estrutura e a argumentação sem julgar aderência ao tema)"}\n\nRedação do estudante:\n<redacao>\n${texto}\n</redacao>`,
      }],
    });

    if (resposta.stop_reason === "refusal") return json({ erro: "Não foi possível corrigir este texto com IA." }, 422);
    if (resposta.stop_reason === "max_tokens") return json({ erro: "A resposta da IA ficou incompleta. Tente novamente." }, 502);
    const bruto = resposta.content.filter((b) => b.type === "text").map((b) => (b as { text: string }).text).join("");
    const resultado = JSON.parse(bruto);
    for (const k of ["c1", "c2", "c3", "c4", "c5"]) {
      if (!NIVEIS.includes(resultado.notas?.[k])) return json({ erro: "Resposta da IA fora do formato esperado." }, 502);
    }
    if (resultado.anulacao) for (const k of Object.keys(resultado.notas)) resultado.notas[k] = 0;
    resultado.total = Object.values(resultado.notas as Record<string, number>).reduce((a, b) => a + b, 0);

    await supabase.from("transcricoes").insert({ user_id: user.id, tipo: "correcao" });
    return json(resultado);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return json({ erro: "Muitas correções ao mesmo tempo. Tente em instantes." }, 429);
    if (error instanceof Anthropic.BadRequestError) return json({ erro: "Requisição inválida para a IA." }, 400);
    if (error instanceof Anthropic.AuthenticationError) return json({ erro: "Serviço de IA não configurado." }, 503);
    if (error instanceof Anthropic.APIError) return json({ erro: `Serviço de IA indisponível (${error.status}).` }, 502);
    if (error instanceof SyntaxError) return json({ erro: "Resposta da IA fora do formato esperado." }, 502);
    console.error(error);
    return json({ erro: "Falha inesperada na correção com IA." }, 500);
  }
});
