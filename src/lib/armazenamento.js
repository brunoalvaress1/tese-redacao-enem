// Persistência das correções: navegador (localStorage) e, se logado, Supabase.
import { supabase } from './supabase.js'

const CHAVE = 'tese:correcoes:v1'
const CHAVE_RASCUNHO = 'tese:rascunho:v1'
const LIMITE_LOCAL = 200

function lerLocal() {
  try {
    const bruto = localStorage.getItem(CHAVE)
    const lista = bruto ? JSON.parse(bruto) : []
    return Array.isArray(lista) ? lista : []
  } catch {
    return []
  }
}

function gravarLocal(lista) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(lista.slice(0, LIMITE_LOCAL)))
    return true
  } catch {
    return false
  }
}

function paraLinha(c, userId) {
  return {
    id: c.id,
    user_id: userId,
    tema_id: c.tema?.id || null,
    tema_titulo: c.tema?.titulo || null,
    texto: c.texto,
    nota_total: c.total,
    c1: c.notas.c1, c2: c.notas.c2, c3: c.notas.c3, c4: c.notas.c4, c5: c.notas.c5,
    resultado: c,
    criado_em: c.criadoEm,
  }
}

async function usuarioAtual() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.user || null
}

/** Lista correções (mais recentes primeiro). */
export async function listarCorrecoes() {
  const locais = lerLocal()
  const user = await usuarioAtual()
  if (!user) return locais
  const { data, error } = await supabase
    .from('correcoes')
    .select('resultado')
    .order('criado_em', { ascending: false })
    .limit(500)
  if (error) {
    console.warn('[Supabase] listarCorrecoes:', error.message)
    return locais
  }
  const remotas = data.map((l) => l.resultado)
  const ids = new Set(remotas.map((r) => r.id))
  return [...remotas, ...locais.filter((l) => !ids.has(l.id))].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
}

export async function obterCorrecao(id) {
  const local = lerLocal().find((c) => c.id === id)
  if (local) return local
  const user = await usuarioAtual()
  if (!user) return null
  const { data } = await supabase.from('correcoes').select('resultado').eq('id', id).maybeSingle()
  return data?.resultado || null
}

/** Salva localmente e, se houver sessão, na nuvem. Retorna onde foi salvo. */
export async function salvarCorrecao(c) {
  const lista = lerLocal().filter((x) => x.id !== c.id)
  gravarLocal([c, ...lista])
  const user = await usuarioAtual()
  if (!user) return { nuvem: false }
  const { error } = await supabase.from('correcoes').upsert(paraLinha(c, user.id))
  if (error) console.warn('[Supabase] salvarCorrecao:', error.message)
  return { nuvem: !error }
}

export async function excluirCorrecao(id) {
  gravarLocal(lerLocal().filter((c) => c.id !== id))
  const user = await usuarioAtual()
  if (user) await supabase.from('correcoes').delete().eq('id', id)
}

/** Envia para a nuvem as correções feitas antes do login. */
export async function sincronizarLocais() {
  const user = await usuarioAtual()
  if (!user) return 0
  const locais = lerLocal()
  if (!locais.length) return 0
  const { error } = await supabase.from('correcoes').upsert(locais.map((c) => paraLinha(c, user.id)), { onConflict: 'id', ignoreDuplicates: true })
  if (error) {
    console.warn('[Supabase] sincronizarLocais:', error.message)
    return 0
  }
  return locais.length
}

// ---------- rascunho do editor ----------
export function lerRascunho() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_RASCUNHO) || 'null')
  } catch {
    return null
  }
}
export function salvarRascunho(r) {
  try {
    localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify({ ...r, salvoEm: new Date().toISOString() }))
  } catch {
    /* armazenamento indisponível */
  }
}
export function limparRascunho() {
  try {
    localStorage.removeItem(CHAVE_RASCUNHO)
  } catch {
    /* armazenamento indisponível */
  }
}
