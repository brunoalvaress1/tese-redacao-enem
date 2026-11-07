import { Component } from 'react'

/** Captura erros inesperados e mostra uma tela amigável em vez de uma página em branco. */
export default class ErroGeral extends Component {
  constructor(props) {
    super(props)
    this.state = { erro: null }
  }
  static getDerivedStateFromError(erro) {
    return { erro }
  }
  componentDidCatch(erro, info) {
    console.error('[Tese] erro inesperado:', erro, info?.componentStack)
  }
  render() {
    if (!this.state.erro) return this.props.children
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-suave">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-2xl">😕</div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Algo deu errado</h1>
          <p className="mt-2 text-sm text-slate-600">Seu rascunho e suas correções continuam salvos. Recarregue a página para continuar.</p>
          <div className="mt-6 flex justify-center gap-2">
            <button onClick={() => window.location.reload()} className="h-11 rounded-xl bg-tinta-600 px-5 text-sm font-semibold text-white hover:bg-tinta-700">Recarregar</button>
            <a href="/" className="grid h-11 place-items-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Ir para o início</a>
          </div>
        </div>
      </div>
    )
  }
}
