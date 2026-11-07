// Mantém o projeto Supabase ativo (o plano grátis pausa após 7 dias sem atividade).
// Uso: SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/manter-supabase-ativo.mjs
const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const chave = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!url || !chave) {
  console.error('Defina SUPABASE_URL e SUPABASE_ANON_KEY (secrets do repositório no GitHub).')
  process.exit(1)
}

const cabecalhos = { apikey: chave, Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' }

async function tentar(n = 3) {
  for (let i = 1; i <= n; i++) {
    try {
      const res = await fetch(`${url}/rest/v1/rpc/ping`, {
        method: 'POST', headers: cabecalhos, body: JSON.stringify({ origem: process.env.GITHUB_ACTIONS ? 'github-actions' : 'manual' }),
      })
      const corpo = await res.text()
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${corpo}`)
      console.log(`✅ Supabase ativo — ${corpo}`)
      return
    } catch (e) {
      console.warn(`Tentativa ${i}/${n} falhou: ${e.message}`)
      if (i < n) await new Promise((r) => setTimeout(r, 5000 * i))
    }
  }
  console.error('❌ Não foi possível alcançar o Supabase. O projeto pode estar pausado — reative-o no painel do Supabase.')
  process.exit(1)
}

await tentar()
