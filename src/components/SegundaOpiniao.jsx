import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, LogIn, TriangleAlert, ArrowRight, Lightbulb, ChevronDown, Bot } from 'lucide-react'
import { Botao, Cartao, Selo, cx } from './ui.jsx'
import { COMP, CHAVES, corNota } from '../lib/competencias.js'
import { corrigirComIA } from '../lib/ia.js'
import { iaAtivaNoSite } from '../lib/ocr.js'
import { salvarCorrecao } from '../lib/armazenamento.js'
import { useAuth } from '../lib/auth.jsx'

/** Cartão de "segunda opinião" com IA na tela de resultado. */
export default function SegundaOpiniao({ correcao, onAtualizar }) {
  const { ativo, usuario } = useAuth()
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [aberto, setAberto] = useState('c1')
  const ia = correcao.ia
  const [iaSite, setIaSite] = useState(false)
  useEffect(() => { iaAtivaNoSite().then(setIaSite) }, [])

  if (!ativo || (!iaSite && !ia)) return null

  const pedir = async () => {
    setErro('')
    setCarregando(true)
    try {
      const resultado = await corrigirComIA({ texto: correcao.texto, tema: correcao.tema })
      const nova = { ...correcao, ia: resultado }
      await salvarCorrecao(nova)
      onAtualizar(nova)
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }

  if (!ia) {
    return (
      <Cartao className="overflow-hidden print:hidden">
        <div className="flex flex-col gap-4 bg-gradient-to-br from-violet-50 via-white to-white p-5 sm:flex-row sm:items-center">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-600 text-white shadow-md shadow-violet-600/30"><Bot className="h-6 w-6" /></div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">Quer uma segunda opinião?</h3>
            <p className="mt-0.5 text-sm text-slate-600">A IA lê a redação como um corretor do ENEM e avalia a qualidade dos argumentos, além das regras.</p>
            {erro && <p className="mt-2 flex items-start gap-1.5 text-sm text-rose-600"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {erro}</p>}
          </div>
          {usuario
            ? <Botao icone={Sparkles} onClick={pedir} carregando={carregando} className="bg-violet-600 hover:bg-violet-700 shadow-violet-600/20">{carregando ? 'Corrigindo…' : 'Corrigir com IA'}</Botao>
            : <Botao to="/entrar" icone={LogIn} variante="secundario">Entrar para usar</Botao>}
        </div>
      </Cartao>
    )
  }

  const cor = corNota(ia.total)
  return (
    <Cartao className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-violet-50/60 px-5 py-4">
        <Bot className="h-5 w-5 text-violet-600" />
        <h3 className="flex-1 font-semibold text-slate-900">Segunda opinião com IA</h3>
        <span className={cx('text-2xl font-extrabold tabular-nums', cor.texto)}>{ia.total}</span>
      </div>
      <div className="space-y-4 p-5">
        {ia.anulacao && <p className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> Nota zero: {ia.anulacao}</p>}
        <p className="text-sm leading-relaxed text-slate-700">{ia.resumo}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] text-center text-sm">
            <thead><tr className="text-xs text-slate-400"><th className="py-1 text-left font-semibold">Correção</th>{CHAVES.map((k) => <th key={k} className={cx('py-1 font-bold', COMP[k].texto)}>{COMP[k].curto}</th>)}<th className="py-1 font-semibold">Total</th></tr></thead>
            <tbody className="tabular-nums">
              <tr className="border-t border-slate-100"><td className="py-2 text-left text-xs font-medium text-slate-500">Automática</td>{CHAVES.map((k) => <td key={k} className="py-2 text-slate-600">{correcao.notas[k]}</td>)}<td className="py-2 font-bold text-slate-700">{correcao.total}</td></tr>
              <tr className="border-t border-slate-100"><td className="py-2 text-left text-xs font-medium text-violet-700">IA</td>{CHAVES.map((k) => <td key={k} className="py-2 font-semibold text-slate-900">{ia.notas[k]}</td>)}<td className={cx('py-2 font-extrabold', cor.texto)}>{ia.total}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {CHAVES.map((k) => (
            <div key={k}>
              <button onClick={() => setAberto(aberto === k ? '' : k)} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm" aria-expanded={aberto === k}>
                <Selo className={cx(COMP[k].bg, COMP[k].texto, 'ring-0')}>{COMP[k].curto}</Selo>
                <span className="flex-1 font-medium text-slate-800">{COMP[k].titulo}</span>
                <span className="font-bold tabular-nums text-slate-900">{ia.notas[k]}</span>
                <ChevronDown className={cx('h-4 w-4 text-slate-400 transition', aberto === k && 'rotate-180')} />
              </button>
              {aberto === k && <p className="px-4 pb-4 text-sm leading-relaxed text-slate-600 animate-surgir">{ia.comentarios?.[k]}</p>}
            </div>
          ))}
        </div>
        {ia.melhorias?.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Prioridades para subir a nota</h4>
            <ul className="space-y-2">{ia.melhorias.map((m) => <li key={m} className="flex gap-2 text-sm text-slate-700"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /> {m}</li>)}</ul>
          </div>
        )}
        {ia.desvios?.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Problemas apontados pela IA</h4>
            <ul className="space-y-2">
              {ia.desvios.map((d, i) => (
                <li key={i} className="rounded-xl bg-slate-50 p-3 text-sm">
                  <p className="flex flex-wrap items-center gap-1.5">
                    <span className={cx('rounded px-1.5 py-0.5 text-[10px] font-bold', COMP[`c${d.competencia}`]?.bg, COMP[`c${d.competencia}`]?.texto)}>C{d.competencia}</span>
                    <span className="text-rose-700 line-through decoration-rose-300">{d.trecho}</span>
                    {d.correcao && <><ArrowRight className="h-3 w-3 text-slate-400" /><span className="font-semibold text-emerald-700">{d.correcao}</span></>}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{d.explicacao}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="text-xs text-slate-400">Correção gerada por IA{ia.provedor === 'gemini' ? ' (Google Gemini)' : ia.provedor === 'claude' ? ' (Claude)' : ''}. Use junto da correção automática; a nota oficial é dada por corretores humanos.</p>
      </div>
    </Cartao>
  )
}
