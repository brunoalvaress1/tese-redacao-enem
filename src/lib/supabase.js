import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY

/** Cliente Supabase — null quando as variáveis de ambiente não estão configuradas. */
export const supabase = url && chave ? createClient(url, chave, { auth: { persistSession: true, autoRefreshToken: true } }) : null
export const supabaseAtivo = !!supabase
