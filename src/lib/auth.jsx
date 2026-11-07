import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseAtivo } from './supabase.js'
import { sincronizarLocais } from './armazenamento.js'

const AuthCtx = createContext({ usuario: null, carregando: false, ativo: false })

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(supabaseAtivo)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setUsuario(data.session?.user || null)
      setCarregando(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((evento, sessao) => {
      setUsuario(sessao?.user || null)
      if (evento === 'SIGNED_IN') sincronizarLocais()
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const valor = {
    usuario,
    carregando,
    ativo: supabaseAtivo,
    entrar: (email, senha) => supabase.auth.signInWithPassword({ email, password: senha }),
    cadastrar: (email, senha, nome) =>
      supabase.auth.signUp({ email, password: senha, options: { data: { nome }, emailRedirectTo: window.location.origin } }),
    recuperar: (email) => supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/entrar' }),
    sair: () => supabase.auth.signOut(),
    atualizarNome: async (nome) => {
      const r = await supabase.auth.updateUser({ data: { nome } })
      if (!r.error) {
        setUsuario(r.data.user)
        await supabase.from('perfis').update({ nome }).eq('id', r.data.user.id)
      }
      return r
    },
  }
  return <AuthCtx.Provider value={valor}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
