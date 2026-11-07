import { Link } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'

const cx = (...c) => c.filter(Boolean).join(' ')
export { cx }

const VARIANTES = {
  primario: 'bg-tinta-600 text-white hover:bg-tinta-700 shadow-sm shadow-tinta-600/20 focus-visible:ring-tinta-300',
  secundario: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-slate-200',
  fantasma: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-200',
  perigo: 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 focus-visible:ring-rose-200',
  claro: 'bg-white text-tinta-700 hover:bg-tinta-50 shadow-sm focus-visible:ring-white/50',
}
const TAMANHOS = {
  sm: 'h-9 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl',
}

export function Botao({ as, to, href, variante = 'primario', tamanho = 'md', carregando, icone: Icone, iconeDireita: IconeD, className, children, disabled, ...props }) {
  const classes = cx(
    'inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-4 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[.98] whitespace-nowrap',
    VARIANTES[variante], TAMANHOS[tamanho], className,
  )
  const conteudo = (
    <>
      {carregando ? <LoaderCircle className="h-4 w-4 animate-spin" /> : Icone && <Icone className="h-4 w-4 shrink-0" />}
      {children}
      {IconeD && <IconeD className="h-4 w-4 shrink-0" />}
    </>
  )
  if (to) return <Link to={to} className={classes} {...props}>{conteudo}</Link>
  if (href) return <a href={href} className={classes} {...props}>{conteudo}</a>
  const Comp = as || 'button'
  return <Comp className={classes} disabled={disabled || carregando} {...props}>{conteudo}</Comp>
}

export function Cartao({ className, children, ...props }) {
  return <div className={cx('rounded-2xl border border-slate-200/80 bg-white shadow-suave', className)} {...props}>{children}</div>
}

export function Selo({ className, children, cor = 'slate' }) {
  const cores = {
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
    tinta: 'bg-tinta-50 text-tinta-700 ring-tinta-200',
    verde: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    ambar: 'bg-amber-50 text-amber-800 ring-amber-200',
    rosa: 'bg-rose-50 text-rose-700 ring-rose-200',
    violeta: 'bg-violet-50 text-violet-700 ring-violet-200',
    vidro: 'bg-white/15 text-white ring-white/25',
  }
  return <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', cores[cor], className)}>{children}</span>
}

export function Container({ className, children }) {
  return <div className={cx('mx-auto w-full max-w-6xl px-4 sm:px-6', className)}>{children}</div>
}

export function Titulo({ sobretitulo, titulo, descricao, centro, className, acao }) {
  return (
    <div className={cx(centro ? 'text-center mx-auto max-w-2xl' : 'flex flex-wrap items-end justify-between gap-3 sm:gap-4', className)}>
      <div className={centro ? '' : 'max-w-2xl'}>
        {sobretitulo && <p className="text-xs font-semibold uppercase tracking-wider text-tinta-600 sm:text-sm">{sobretitulo}</p>}
        <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900 sm:mt-1 sm:text-3xl">{titulo}</h1>
        {descricao && <p className="mt-1 text-sm text-slate-600 sm:mt-2 sm:text-base">{descricao}</p>}
      </div>
      {acao}
    </div>
  )
}

export function Vazio({ icone: Icone, titulo, texto, acao }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
      {Icone && <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-tinta-50 text-tinta-600"><Icone className="h-6 w-6" /></div>}
      <h3 className="text-lg font-semibold text-slate-900">{titulo}</h3>
      {texto && <p className="mt-1 max-w-md text-sm text-slate-500">{texto}</p>}
      {acao && <div className="mt-5">{acao}</div>}
    </div>
  )
}

export function Carregando({ texto = 'Carregando…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-20 text-slate-500">
      <LoaderCircle className="h-5 w-5 animate-spin" /> {texto}
    </div>
  )
}

export function BarraNota({ nota, max = 200, cor, className }) {
  return (
    <div className={cx('h-2 w-full overflow-hidden rounded-full bg-slate-100', className)}>
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(nota / max) * 100}%`, background: cor }} />
    </div>
  )
}
