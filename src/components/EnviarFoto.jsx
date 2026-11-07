import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Camera, ImagePlus, X, ScanText, Sparkles, TriangleAlert, CircleCheck, RotateCcw, Lightbulb, Trash2, Cpu,
} from 'lucide-react'
import { Botao, Selo, cx } from './ui.jsx'
import { transcreverFotos, iaDisponivel, MAX_FOTOS, TAMANHO_MAX_ARQUIVO } from '../lib/ocr.js'
import { useAuth } from '../lib/auth.jsx'
import { contarPalavras } from '../engine/texto.js'

/** Modal: foto da redação manuscrita → transcrição revisável → texto no editor. */
export default function EnviarFoto({ aberto, onFechar, onConcluir }) {
  const { ativo, usuario } = useAuth()
  const [fotos, setFotos] = useState([]) // { file, url }
  const [fase, setFase] = useState('escolher') // escolher | lendo | revisar
  const [prog, setProg] = useState({ etapa: '', progresso: 0 })
  const [resultado, setResultado] = useState(null)
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState('')
  const [comIA, setComIA] = useState(false)
  const galeriaRef = useRef(null)
  const cameraRef = useRef(null)

  useEffect(() => {
    if (!aberto) return undefined
    iaDisponivel().then(setComIA)
    document.body.style.overflow = 'hidden'
    const esc = (e) => e.key === 'Escape' && fase !== 'lendo' && onFechar()
    window.addEventListener('keydown', esc)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', esc)
    }
  }, [aberto, usuario, fase, onFechar])

  useEffect(() => () => fotos.forEach((f) => URL.revokeObjectURL(f.url)), []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!aberto) return null

  const adicionar = (lista) => {
    setErro('')
    const novas = []
    for (const file of Array.from(lista || [])) {
      if (!file.type.startsWith('image/')) { setErro('Envie apenas imagens (JPG, PNG, HEIC convertido…).'); continue }
      if (file.size > TAMANHO_MAX_ARQUIVO) { setErro('Cada foto pode ter no máximo 15 MB.'); continue }
      novas.push({ file, url: URL.createObjectURL(file) })
    }
    setFotos((f) => [...f, ...novas].slice(0, MAX_FOTOS))
  }
  const remover = (i) => setFotos((f) => {
    URL.revokeObjectURL(f[i].url)
    return f.filter((_, j) => j !== i)
  })

  const ler = async () => {
    setErro('')
    setFase('lendo')
    setProg({ etapa: 'Iniciando…', progresso: 0 })
    try {
      const r = await transcreverFotos(fotos.map((f) => f.file), { aoProgredir: setProg })
      if (!r.texto || contarPalavras(r.texto) < 5) throw new Error('vazio')
      setResultado(r)
      setTexto(r.texto)
      setFase('revisar')
    } catch (e) {
      console.error(e)
      setErro(e.message === 'vazio'
        ? 'Não conseguimos ler texto nesta foto. Tente uma foto mais nítida, com boa luz e a folha inteira enquadrada.'
        : 'Não foi possível ler a foto agora. Verifique sua conexão e tente novamente.')
      setFase('escolher')
    }
  }

  const reiniciar = () => {
    setFase('escolher')
    setResultado(null)
    setTexto('')
  }
  const concluir = () => {
    onConcluir(texto.trim())
    onFechar()
    reiniciar()
    setFotos([])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Enviar foto da redação"
      onMouseDown={(e) => e.target === e.currentTarget && fase !== 'lendo' && onFechar()}>
      <div className={cx('flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl animate-surgir', fase === 'revisar' ? 'max-w-5xl' : 'max-w-xl')}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><ScanText className="h-5 w-5 text-tinta-600" /> {fase === 'revisar' ? 'Confira a transcrição' : 'Foto da redação'}</h2>
          {fase !== 'lendo' && <button onClick={onFechar} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Fechar"><X className="h-5 w-5" /></button>}
        </div>

        {fase === 'escolher' && (
          <div className="space-y-4 overflow-y-auto p-5">
            <p className="text-sm text-slate-600">Tire uma foto da sua redação escrita à mão. Nós transcrevemos o texto e você confere antes de corrigir — sem precisar digitar.</p>
            <input ref={galeriaRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { adicionar(e.target.files); e.target.value = '' }} />
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { adicionar(e.target.files); e.target.value = '' }} />

            {fotos.length === 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <button onClick={() => cameraRef.current?.click()} className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-tinta-200 bg-tinta-50/50 px-4 py-8 text-tinta-700 transition hover:border-tinta-400 hover:bg-tinta-50">
                  <Camera className="h-8 w-8" /><span className="font-semibold">Tirar foto</span><span className="text-xs text-tinta-600/80">Abre a câmera no celular</span>
                </button>
                <button onClick={() => galeriaRef.current?.click()} className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 px-4 py-8 text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); adicionar(e.dataTransfer.files) }}>
                  <ImagePlus className="h-8 w-8" /><span className="font-semibold">Escolher imagem</span><span className="text-xs text-slate-500">ou arraste aqui · até {MAX_FOTOS} fotos</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {fotos.map((f, i) => (
                  <div key={f.url} className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <img src={f.url} alt={`Foto ${i + 1} da redação`} className="h-full w-full object-cover" />
                    <span className="absolute left-2 top-2 rounded-md bg-slate-900/70 px-1.5 py-0.5 text-[11px] font-bold text-white">{i + 1}</span>
                    <button onClick={() => remover(i)} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg bg-white/90 text-rose-600 shadow" aria-label={`Remover foto ${i + 1}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
                {fotos.length < MAX_FOTOS && (
                  <button onClick={() => galeriaRef.current?.click()} className="flex aspect-[3/4] flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-xs font-medium text-slate-500 hover:bg-slate-50">
                    <ImagePlus className="h-6 w-6" /> Adicionar página
                  </button>
                )}
              </div>
            )}

            <div className={cx('flex items-start gap-3 rounded-xl p-3 text-sm', comIA ? 'bg-emerald-50 text-emerald-900' : 'bg-slate-50 text-slate-700')}>
              {comIA ? <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />}
              <div>
                <p className="font-semibold">{comIA ? 'Leitura com IA' : 'Leitura no navegador'}</p>
                <p className="mt-0.5 text-xs leading-relaxed">
                  {comIA
                    ? 'Alta precisão, inclusive para letra cursiva.'
                    : 'Gratuita e feita no seu aparelho. Funciona melhor com letra de forma legível.'}
                  {!comIA && ativo && !usuario && <> <Link to="/entrar" className="font-semibold underline" onClick={onFechar}>Entre na sua conta</Link> para usar a leitura com IA, mais precisa para letra cursiva.</>}
                </p>
              </div>
            </div>

            <details className="rounded-xl border border-slate-200 p-3 text-sm text-slate-600">
              <summary className="flex cursor-pointer items-center gap-2 font-medium text-slate-800"><Lightbulb className="h-4 w-4 text-amber-500" /> Dicas para uma boa foto</summary>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed">
                <li>Fotografe de cima, com a folha inteira enquadrada e reta.</li>
                <li>Use boa iluminação, sem sombras ou reflexos.</li>
                <li>Escreva com caneta escura; evite lápis claro.</li>
                <li>Se a redação ocupar frente e verso, envie uma foto de cada página, na ordem.</li>
              </ul>
            </details>

            {erro && <p className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {erro}</p>}
            <Botao className="w-full" tamanho="lg" icone={ScanText} onClick={ler} disabled={!fotos.length}>Ler redação</Botao>
          </div>
        )}

        {fase === 'lendo' && (
          <div className="flex flex-col items-center px-6 py-14 text-center" role="status" aria-live="polite">
            <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-tinta-50 text-tinta-600">
              <ScanText className="h-8 w-8 animate-pulse" />
            </div>
            <p className="mt-5 font-semibold text-slate-900">{prog.etapa}</p>
            <div className="mt-4 h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-tinta-600 transition-all duration-300" style={{ width: `${Math.round(prog.progresso * 100)}%` }} />
            </div>
            <p className="mt-2 text-xs tabular-nums text-slate-500">{Math.round(prog.progresso * 100)}%</p>
          </div>
        )}

        {fase === 'revisar' && resultado && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-col items-start gap-2 border-b border-slate-100 bg-amber-50 px-5 py-3 text-sm text-amber-900 sm:flex-row sm:items-center">
              <span className="flex flex-1 items-start gap-2"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /><span>Corrija <b>só o que a leitura errou</b>, comparando com a foto. Não melhore o texto, senão a nota deixa de refletir o que você escreveu.</span></span>
              <Selo cor={resultado.fonte === 'ia' ? 'verde' : 'slate'}>{resultado.fonte === 'ia' ? 'Lido com IA' : `Lido no navegador${resultado.confianca != null ? ` · confiança ${resultado.confianca}%` : ''}`}</Selo>
            </div>
            {resultado.aviso && <p className="border-b border-slate-100 px-5 py-2 text-xs text-slate-500">{resultado.aviso}</p>}
            {resultado.fonte === 'navegador' && resultado.confianca != null && resultado.confianca < 70 && (
              <p className="border-b border-slate-100 bg-rose-50 px-5 py-2 text-xs text-rose-700">A leitura teve baixa confiança. Revise com atenção ou tente uma foto mais nítida.</p>
            )}
            <div className="grid min-h-0 flex-1 gap-0 overflow-y-auto md:grid-cols-2 md:overflow-hidden">
              <div className="h-44 shrink-0 overflow-y-auto border-b border-slate-100 bg-slate-100 p-3 md:h-auto md:border-b-0 md:border-r">
                {fotos.map((f, i) => <img key={f.url} src={f.url} alt={`Página ${i + 1}`} className="mb-3 w-full rounded-lg shadow-sm last:mb-0" />)}
              </div>
              <div className="flex min-h-[320px] flex-col">
                <textarea value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Texto transcrito"
                  className="min-h-[300px] flex-1 resize-none bg-papel px-5 py-4 font-serif text-[16px] leading-7 text-slate-800 outline-none md:overflow-y-auto" />
                <p className="border-t border-slate-100 px-5 py-2 text-xs text-slate-500">{contarPalavras(texto)} palavras · {texto.split('\n').filter((l) => l.trim()).length} parágrafo(s) · separe os parágrafos com Enter</p>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
              <Botao variante="secundario" icone={RotateCcw} onClick={reiniciar}>Usar outra foto</Botao>
              <Botao icone={CircleCheck} onClick={concluir} disabled={contarPalavras(texto) < 5}>Usar este texto</Botao>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
