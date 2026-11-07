import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, X, PenLine, LogIn, CircleUser, UserPlus, House, Library, ChartLine, Compass, GraduationCap } from 'lucide-react'
import { Botao, Container, cx } from './ui.jsx'
import { useAuth } from '../lib/auth.jsx'

const LINKS = [
  { to: '/temas', rotulo: 'Temas' },
  { to: '/guiada', rotulo: 'Redação guiada' },
  { to: '/aprenda', rotulo: 'Aprenda' },
  { to: '/desempenho', rotulo: 'Desempenho' },
]

export function Logo({ claro }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight" aria-label="Tese — página inicial">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-tinta-600 text-white shadow-sm shadow-tinta-600/30">
        <span className="text-lg leading-none">T</span>
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
      </span>
      <span className={cx('text-xl', claro ? 'text-white' : 'text-slate-900')}>Tese</span>
    </Link>
  )
}

function Iniciais({ usuario, className }) {
  const nome = usuario?.user_metadata?.nome || usuario?.email || ''
  const ini = nome ? nome.split(/[\s@]+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase() : null
  return (
    <span className={cx('grid place-items-center rounded-full font-bold', ini ? 'bg-gradient-to-br from-tinta-500 to-tinta-700 text-white' : 'bg-slate-100 text-slate-500', className)}>
      {ini || <CircleUser className="h-5 w-5" />}
    </span>
  )
}

function Cabecalho() {
  const [aberto, setAberto] = useState(false)
  const { pathname } = useLocation()
  const { ativo, usuario } = useAuth()
  const mostrarConta = ativo || import.meta.env.DEV
  useEffect(() => {
    setAberto(false)
  }, [pathname])

  const classeLink = ({ isActive }) =>
    cx('rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive ? 'bg-tinta-50 text-tinta-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md print:hidden">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {LINKS.map((l) => <NavLink key={l.to} to={l.to} className={classeLink}>{l.rotulo}</NavLink>)}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {usuario ? (
            <Link to="/perfil" className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-medium text-slate-700 hover:bg-slate-100" title="Meu perfil">
              <Iniciais usuario={usuario} className="h-8 w-8 text-xs" />
              <span className="max-w-[120px] truncate">{usuario.user_metadata?.nome || usuario.email.split('@')[0]}</span>
            </Link>
          ) : (
            <>
              <Botao to="/perfil" variante="fantasma" tamanho="sm" icone={CircleUser}>Perfil</Botao>
              {mostrarConta && <Botao to="/entrar?modo=cadastrar" variante="secundario" tamanho="sm" icone={UserPlus}>Criar conta</Botao>}
            </>
          )}
          <Botao to="/escrever" tamanho="sm" icone={PenLine}>Corrigir redação</Botao>
        </div>
        <div className="flex items-center gap-1 md:hidden">
          {mostrarConta && !usuario && (
            <Link to="/entrar?modo=cadastrar" className="rounded-lg px-3 py-2 text-sm font-semibold text-tinta-700 hover:bg-tinta-50">Criar conta</Link>
          )}
          <button className="grid h-10 w-10 place-items-center rounded-lg text-slate-700 hover:bg-slate-100" onClick={() => setAberto((a) => !a)} aria-label={aberto ? 'Fechar menu' : 'Abrir menu'} aria-expanded={aberto}>
            {aberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>
      {aberto && (
        <div className="border-t border-slate-200 bg-white md:hidden animate-surgir">
          <Container className="grid grid-cols-2 gap-2 py-3">
            {[
              { to: '/guiada', rotulo: 'Redação guiada', icone: Compass },
              { to: '/aprenda', rotulo: 'Curso grátis', icone: GraduationCap },
              { to: '/temas?aba=apostas', rotulo: 'Apostas 2026', icone: Library },
              ...(mostrarConta && !usuario ? [{ to: '/entrar', rotulo: 'Entrar', icone: LogIn }] : []),
            ].map((l) => (
              <Link key={l.to} to={l.to} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-700 active:bg-slate-50">
                <l.icone className="h-4 w-4 text-tinta-600" /> {l.rotulo}
              </Link>
            ))}
          </Container>
        </div>
      )}
    </header>
  )
}

/** Barra de navegação inferior (celular), no estilo de aplicativo. */
function NavInferior() {
  const { usuario } = useAuth()
  const item = ({ isActive }) => cx('flex flex-col items-center gap-0.5 pt-2 pb-1 text-[11px] font-semibold transition-colors', isActive ? 'text-tinta-600' : 'text-slate-500')
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden print:hidden" aria-label="Navegação">
      <div className="mx-auto grid max-w-md grid-cols-5 items-end">
        <NavLink to="/" end className={item}><House className="h-5 w-5" /> Início</NavLink>
        <NavLink to="/temas" className={item}><Library className="h-5 w-5" /> Temas</NavLink>
        <NavLink to="/escrever" className="flex flex-col items-center pb-1" aria-label="Corrigir redação">
          {({ isActive }) => (
            <>
              <span className={cx('-mt-5 grid h-14 w-14 place-items-center rounded-2xl text-white shadow-lg shadow-tinta-600/40 ring-4 ring-white transition active:scale-95', isActive ? 'bg-tinta-700' : 'bg-tinta-600')}>
                <PenLine className="h-6 w-6" />
              </span>
              <span className={cx('mt-0.5 text-[11px] font-semibold', isActive ? 'text-tinta-600' : 'text-slate-500')}>Corrigir</span>
            </>
          )}
        </NavLink>
        <NavLink to="/desempenho" className={item}><ChartLine className="h-5 w-5" /> Evolução</NavLink>
        <NavLink to="/perfil" className={item}>
          {usuario ? <Iniciais usuario={usuario} className="h-5 w-5 text-[9px]" /> : <CircleUser className="h-5 w-5" />} Perfil
        </NavLink>
      </div>
    </nav>
  )
}

function Rodape() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white pb-20 md:mt-24 md:pb-0 print:hidden">
      <Container className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4 md:py-12">
        <div className="sm:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-slate-500">
            Correção de redação no modelo ENEM, 100% gratuita: nota por competência, erros marcados no texto,
            comentários detalhados, correção por foto, banco de temas, redação guiada e curso completo.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Plataforma</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link className="hover:text-tinta-700" to="/escrever">Corrigir redação</Link></li>
            <li><Link className="hover:text-tinta-700" to="/temas">Banco de temas</Link></li>
            <li><Link className="hover:text-tinta-700" to="/guiada">Redação guiada</Link></li>
            <li><Link className="hover:text-tinta-700" to="/perfil">Meu perfil</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Aprenda</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-500">
            <li><Link className="hover:text-tinta-700" to="/aprenda">Curso de redação</Link></li>
            <li><Link className="hover:text-tinta-700" to="/aprenda/competencias">As 5 competências</Link></li>
            <li><Link className="hover:text-tinta-700" to="/aprenda/conectivos">Lista de conectivos</Link></li>
            <li><Link className="hover:text-tinta-700" to="/aprenda/modelo-nota-1000">Redação modelo</Link></li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-slate-100">
        <Container className="flex flex-col gap-2 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Tese. Projeto educacional gratuito, sem vínculo com o INEP ou o MEC.</p>
          <p>A nota é uma estimativa automática baseada nos critérios oficiais de correção.</p>
        </Container>
      </div>
    </footer>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow">Pular para o conteúdo</a>
      <Cabecalho />
      <main id="conteudo" className="flex-1">
        <div key={pathname} className="animate-aparecer">
          <Outlet />
        </div>
      </main>
      <Rodape />
      <NavInferior />
    </div>
  )
}
