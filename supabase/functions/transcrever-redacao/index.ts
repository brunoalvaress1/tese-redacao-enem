// Supabase Edge Function: transcreve a foto de uma redação manuscrita usando o Claude (visão).
// Deploy:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//          supabase functions deploy transcrever-redacao
// Opcional: supabase secrets set TRANSCRICOES_POR_DIA=20
import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const TIPOS = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_IMAGENS = 3;
const MAX_BASE64 = 7_000_000; // ~5 MB por imagem
const LIMITE_DIARIO = Number(Deno.env.get("TRANSCRICOES_POR_DIA") ?? "20");

const INSTRUCOES = `Você vai transcrever uma redação do ENEM escrita à mão. As imagens são as páginas, na ordem.

Regras:
- Transcreva exatamente o que o estudante escreveu. Não corrija ortografia, acentuação, gramática nem pontuação: os erros fazem parte da avaliação e precisam aparecer como estão.
- Ignore números de linha, cabeçalhos impressos da folha, o título (se houver) e palavras riscadas.
- Separe cada parágrafo com uma linha em branco. Junte as linhas de um mesmo parágrafo em uma só, sem quebras no meio.
- Se uma palavra estiver ilegível, escreva [ilegível] no lugar dela.
- Responda somente com o texto transcrito, sem comentários antes ou depois.`;

const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });

function json(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ erro: "Método não permitido." }, 405);

  // Autenticação: só usuários logados (controle de custo)
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ erro: "Faça login para usar a leitura com IA." }, 401);

  // Limite diário por usuário
  const desde = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("transcricoes")
    .select("id", { count: "exact", head: true })
    .gte("criado_em", desde);
  if ((count ?? 0) >= LIMITE_DIARIO) {
    return json({ erro: `Limite de ${LIMITE_DIARIO} leituras com IA por dia atingido. Use a leitura no navegador ou tente amanhã.` }, 429);
  }

  // Validação da entrada
  let corpo: { imagens?: Array<{ media_type: string; data: string }> };
  try {
    corpo = await req.json();
  } catch {
    return json({ erro: "Corpo da requisição inválido." }, 400);
  }
  const imagens = corpo.imagens ?? [];
  if (!Array.isArray(imagens) || imagens.length === 0 || imagens.length > MAX_IMAGENS) {
    return json({ erro: `Envie de 1 a ${MAX_IMAGENS} imagens.` }, 400);
  }
  for (const img of imagens) {
    if (!TIPOS.has(img?.media_type) || typeof img?.data !== "string" || img.data.length > MAX_BASE64) {
      return json({ erro: "Imagem inválida ou grande demais." }, 400);
    }
  }

  try {
    const resposta = await anthropic.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      output_config: { effort: "medium" },
      // Se o modelo recusar por engano, o próprio servidor tenta de novo em um modelo de reserva.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      messages: [{
        role: "user",
        content: [
          ...imagens.map((img) => ({
            type: "image" as const,
            source: { type: "base64" as const, media_type: img.media_type as "image/jpeg", data: img.data },
          })),
          { type: "text" as const, text: INSTRUCOES },
        ],
      }],
    });

    if (resposta.stop_reason === "refusal") {
      return json({ erro: "Não foi possível ler esta imagem. Tente outra foto." }, 422);
    }
    const texto = resposta.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { text: string }).text)
      .join("\n")
      .trim();
    if (!texto) return json({ erro: "Nenhum texto foi encontrado na imagem." }, 422);

    await supabase.from("transcricoes").insert({ user_id: user.id });
    return json({ texto });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return json({ erro: "Muitas leituras ao mesmo tempo. Tente em instantes." }, 429);
    if (error instanceof Anthropic.BadRequestError) return json({ erro: "A imagem não pôde ser processada." }, 400);
    if (error instanceof Anthropic.AuthenticationError) return json({ erro: "Serviço de IA não configurado." }, 503);
    if (error instanceof Anthropic.APIError) return json({ erro: `Serviço de IA indisponível (${error.status}).` }, 502);
    console.error(error);
    return json({ erro: "Falha inesperada na leitura." }, 500);
  }
});
