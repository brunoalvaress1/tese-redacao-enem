import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { LogIn, UserPlus, Mail, KeyRound, CircleCheck, TriangleAlert, CloudOff, Cloud, Database, ChartLine, History } from 'lucide-react'
import { Botao, Cartao, Container, cx } from '../components/ui.jsx'
import { Logo } from '../components/Layout.jsx'
import { useAuth } from '../lib/auth.jsx'

const ERROS = {
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'Email not confirmed': 'Confirme seu e-mail pelo link que enviamos antes de entrar.',
  'User already registered': 'Este e-mail já está cadastrado. Faça login.',
  'Password should be at least 6 characters': 'A senha precisa ter pelo menos 6 caracteres.',
}

function Campo({ icone: Icone, ...props }) {
  return (
    <label className="relative block">
      <Icone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input {...props} className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-tinta-400 focus:ring-4 focus:ring-tinta-100" />
    </label>
  )
}

export default function Entrar() {
  const { ativo, usuario, entrar, cadastrar, recuperar, sair } = useAuth()
  const navigate = useNavigate()
  const [busca] = useSearchParams()
  const [modo, setModo] = useState(busca.get('modo') === 'cadastrar' ? 'cadastrar' : 'entrar')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [msg, setMsg] = useState(null)

  if (!ativo) {
    if (import.meta.env.DEV) {
      return (
        <Container className="max-w-2xl py-12">
          <Cartao className="p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-600"><Database className="h-5 w-5" /></div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Ative as contas com o Supabase</h1>
                <p className="text-sm text-slate-500">Aviso visível só no modo de desenvolvimento.</p>
              </div>
            </div>
            <ol className="mt-6 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-slate-700">
              <li>Crie um projeto grátis em <b>supabase.com</b>.</li>
              <li>Abra <b>SQL Editor → New query</b>, cole todo o arquivo <code className="rounded bg-slate-100 px-1.5 py-0.5">supabase/schema.sql</code> e clique em <b>Run</b>.</li>
              <li>Em <b>Project Settings → API</b>, copie a <i>Project URL</i> e a chave <i>anon public</i>.</li>
              <li>Crie o arquivo <code className="rounded bg-slate-100 px-1.5 py-0.5">.env</code> na raiz do projeto (veja <code className="rounded bg-slate-100 px-1.5 py-0.5">.env.example</code>):
                <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">VITE_SUPABASE_URL=https://xxxx.supabase.co{'\n'}VITE_SUPABASE_ANON_KEY=eyJhbGciOi...</pre>
              </li>
              <li>Reinicie o servidor (<code className="rounded bg-slate-100 px-1.5 py-0.5">npm run dev</code>). Os botões “Entrar” e “Criar conta” passam a funcionar e cada aluno vê só o próprio histórico.</li>
            </ol>
            <p className="mt-6 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">Sem o Supabase, o site continua funcionando: as correções ficam salvas no navegador de cada pessoa.</p>
          </Cartao>
        </Container>
      )
    }
    return (
      <Container className="max-w-lg py-16">
        <Cartao className="p-8 text-center">
          <CloudOff className="mx-auto h-10 w-10 text-slate-400" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">Login indisponível</h1>
          <p className="mt-2 text-sm text-slate-600">Não é preciso conta para usar a plataforma: suas correções ficam salvas neste navegador.</p>
          <Botao to="/escrever" className="mt-6">Corrigir uma redação</Botao>
        </Cartao>
      </Container>
    )
  }

  if (usuario) {
    return (
      <Container className="max-w-lg py-16">
        <Cartao className="p-8 text-center">
          <Cloud className="mx-auto h-10 w-10 text-emerald-500" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">Você está conectado</h1>
          <p className="mt-2 text-sm text-slate-600">{usuario.email} — suas correções são salvas na nuvem.</p>
          <div className="mt-6 flex justify-center gap-2">
            <Botao to="/desempenho">Ver desempenho</Botao>
            <Botao variante="secundario" onClick={sair}>Sair</Botao>
          </div>
        </Cartao>
      </Container>
    )
  }

  const enviar = async (e) => {
    e.preventDefault()
    setMsg(null)
    setCarregando(true)
    try {
      if (modo === 'recuperar') {
        const { error } = await recuperar(email)
        if (error) throw error
        setMsg({ ok: true, texto: 'Enviamos um link de redefinição de senha para o seu e-mail.' })
      } else if (modo === 'cadastrar') {
        const { data, error } = await cadastrar(email, senha, nome)
        if (error) throw error
        if (data.session) navigate('/desempenho')
        else setMsg({ ok: true, texto: 'Conta criada! Confirme seu e-mail pelo link que enviamos e depois faça login.' })
      } else {
        const { error } = await entrar(email, senha)
        if (error) throw error
        navigate('/desempenho')
      }
    } catch (err) {
      setMsg({ ok: false, texto: ERROS[err.message] || err.message || 'Não foi possível concluir. Tente novamente.' })
    } finally {
      setCarregando(false)
    }
  }

  return (
    <Container className="max-w-md py-12 sm:py-16">
      <div className="flex justify-center"><Logo /></div>
      <Cartao className="mt-6 p-6 sm:p-8">
        <h1 className="text-center text-xl font-bold text-slate-900">
          {modo === 'entrar' ? 'Entre na sua conta' : modo === 'cadastrar' ? 'Crie sua conta grátis' : 'Recuperar senha'}
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500">Grátis para sempre. Acesse de qualquer dispositivo.</p>
        {modo === 'cadastrar' && (
          <ul className="mt-5 grid gap-2 rounded-2xl bg-tinta-50/60 p-4 text-sm text-slate-700">
            <li className="flex items-center gap-2"><History className="h-4 w-4 text-tinta-600" /> Todas as suas redações corrigidas guardadas</li>
            <li className="flex items-center gap-2"><ChartLine className="h-4 w-4 text-tinta-600" /> Gráficos da sua evolução por competência</li>
            <li className="flex items-center gap-2"><Cloud className="h-4 w-4 text-tinta-600" /> Leitura de foto com IA, mais precisa para letra cursiva</li>
          </ul>
        )}
        {modo !== 'recuperar' && (
          <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            {[['entrar', 'Entrar'], ['cadastrar', 'Criar conta']].map(([m, r]) => (
              <button key={m} onClick={() => { setModo(m); setMsg(null) }} className={cx('rounded-lg py-2 text-sm font-semibold transition', modo === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500')}>{r}</button>
            ))}
          </div>
        )}
        <form onSubmit={enviar} className="mt-6 space-y-3">
          {modo === 'cadastrar' && <Campo icone={UserPlus} placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" />}
          <Campo icone={Mail} type="email" required placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          {modo !== 'recuperar' && (
            <Campo icone={KeyRound} type="password" required minLength={6} placeholder="Senha (mín. 6 caracteres)" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'} />
          )}
          {msg && (
            <p className={cx('flex items-start gap-2 rounded-xl p-3 text-sm', msg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700')}>
              {msg.ok ? <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" /> : <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />} {msg.texto}
            </p>
          )}
          <Botao type="submit" className="w-full" tamanho="lg" carregando={carregando} icone={modo === 'cadastrar' ? UserPlus : modo === 'entrar' ? LogIn : Mail}>
            {modo === 'entrar' ? 'Entrar' : modo === 'cadastrar' ? 'Criar conta' : 'Enviar link'}
          </Botao>
        </form>
        <p className="mt-5 text-center text-sm">
          {modo === 'entrar'
            ? <button onClick={() => { setModo('recuperar'); setMsg(null) }} className="font-medium text-tinta-700 hover:underline">Esqueci minha senha</button>
            : modo === 'recuperar' && <button onClick={() => { setModo('entrar'); setMsg(null) }} className="font-medium text-tinta-700 hover:underline">Voltar ao login</button>}
        </p>
      </Cartao>
    </Container>
  )
}
