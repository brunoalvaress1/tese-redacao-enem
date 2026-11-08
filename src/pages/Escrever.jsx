import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  PenLine, Upload, Trash2, Timer, Play, Pause, RotateCcw, Sparkles, Library, Shuffle, CircleCheck, Circle,
  SpellCheck, Info, TriangleAlert, LoaderCircle, Camera, ScanText,
} from 'lucide-react'
import { Botao, Cartao, Container, Selo, cx } from '../components/ui.jsx'
import SeletorTema from '../components/SeletorTema.jsx'
import EnviarFoto from '../components/EnviarFoto.jsx'
import { buscarTema, temaAleatorio } from '../data/temas.js'
import { estatisticas, corrigirRedacao } from '../engine/corretor.js'
import { MAX_LINHAS, MIN_LINHAS } from '../engine/texto.js'
import { lerRascunho, salvarRascunho, limparRascunho, salvarCorrecao } from '../lib/armazenamento.js'

const ETAPAS = ['Lendo sua redação…', 'Verificando ortografia e gramática…', 'Avaliando tema e repertório…', 'Analisando argumentação e coesão…', 'Conferindo a proposta de intervenção…', 'Calculando sua nota…']

function Cronometro() {
  const [seg, setSeg] = useState(0)
  const [rodando, setRodando] = useState(false)
  useEffect(() => {
    if (!rodando) return undefined
    const id = setInterval(() => setSeg((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [rodando])
  const mm = String(Math.floor(seg / 60)).padStart(2, '0')
  const ss = String(seg % 60).padStart(2, '0')
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Timer className="h-4 w-4 text-slate-400" />
        <span className={cx('font-mono text-lg font-semibold tabular-nums', seg > 3600 ? 'text-rose-600' : 'text-slate-800')}>{mm}:{ss}</span>
      </div>
      <div className="flex gap-1">
        <button onClick={() => setRodando((r) => !r)} className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200" aria-label={rodando ? 'Pausar' : 'Iniciar'}>
          {rodando ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button onClick={() => { setRodando(false); setSeg(0) }} className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200" aria-label="Zerar">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function Item({ ok, children }) {
  return (
    <li className={cx('flex items-start gap-2 text-sm', ok ? 'text-slate-700' : 'text-slate-500')}>
      {ok ? <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />}
      <span>{children}</span>
    </li>
  )
}

export default function Escrever() {
  const { temaId } = useParams()
  const [busca] = useSearchParams()
  const navigate = useNavigate()
  const rascunho = useMemo(() => lerRascunho(), [])

  const [tema, setTema] = useState(() => {
    if (temaId) return buscarTema(temaId)
    if (rascunho?.temaId) return buscarTema(rascunho.temaId)
    if (rascunho?.temaLivre) return { id: null, titulo: rascunho.temaLivre, livre: true }
    return null
  })
  const [texto, setTexto] = useState(rascunho?.texto || '')
  const [seletor, setSeletor] = useState(false)
  const [usarLT, setUsarLT] = useState(() => {
    try { return localStorage.getItem('tese:lt') !== '0' } catch { return true }
  })
  const [corrigindo, setCorrigindo] = useState(false)
  const [etapa, setEtapa] = useState(0)
  const [erro, setErro] = useState('')
  const arquivoRef = useRef(null)
  const destacarEnvio = busca.get('enviar') === '1'
  const [fotoAberta, setFotoAberta] = useState(busca.get('foto') === '1')
  const [origem, setOrigem] = useState(rascunho?.origem || 'digitado')
  const [linhasFolha, setLinhasFolha] = useState(rascunho?.linhasFolha || null)

  useEffect(() => {
    if (temaId) setTema(buscarTema(temaId))
  }, [temaId])

  // salva rascunho automaticamente
  useEffect(() => {
    const id = setTimeout(() => salvarRascunho({ texto, temaId: tema?.id || null, temaLivre: tema?.livre ? tema.titulo : null, origem, linhasFolha }), 400)
    return () => clearTimeout(id)
  }, [texto, tema, origem])

  useEffect(() => {
    if (!texto.trim()) {
      setOrigem('digitado')
      setLinhasFolha(null)
    }
  }, [texto])

  useEffect(() => {
    try { localStorage.setItem('tese:lt', usarLT ? '1' : '0') } catch { /* sem armazenamento */ }
  }, [usarLT])

  const statsTexto = useMemo(() => estatisticas(texto), [texto])
  // linhas contadas na foto da folha valem mais que a estimativa
  const stats = linhasFolha ? { ...statsTexto, linhas: linhasFolha } : statsTexto
  const pctLinhas = Math.min(100, (stats.linhas / MAX_LINHAS) * 100)
  const curto = stats.linhas < MIN_LINHAS
  const longo = stats.linhas > MAX_LINHAS

  const abrirArquivo = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 200_000) return setErro('Arquivo muito grande. Envie um .txt com até 200 KB.')
    const leitor = new FileReader()
    leitor.onload = () => {
      setTexto(String(leitor.result).replace(/\r\n?/g, '\n').trim())
      setErro('')
    }
    leitor.readAsText(f, 'utf-8')
    e.target.value = ''
  }

  const corrigir = useCallback(async () => {
    setErro('')
    if (stats.palavras < 5) return setErro('Escreva sua redação antes de corrigir.')
    setCorrigindo(true)
    setEtapa(0)
    const timer = setInterval(() => setEtapa((e) => Math.min(e + 1, ETAPAS.length - 1)), 450)
    try {
      const [resultado] = await Promise.all([
        corrigirRedacao({ texto, tema, usarLanguageTool: usarLT, origem, linhasFolha }),
        new Promise((r) => setTimeout(r, 1800)),
      ])
      await salvarCorrecao(resultado)
      limparRascunho()
      navigate(`/correcao/${resultado.id}`)
    } catch (e) {
      console.error(e)
      setErro('Não foi possível corrigir agora. Tente novamente.')
      setCorrigindo(false)
    } finally {
      clearInterval(timer)
    }
  }, [texto, tema, usarLT, origem, linhasFolha, stats.palavras, navigate])

  return (
    <Container className="pb-40 pt-4 sm:pt-10 lg:pb-10">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2 sm:mb-6 sm:gap-4">
        <div>
          <p className="hidden text-sm font-semibold uppercase tracking-wider text-tinta-600 sm:block">Corrigir redação</p>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:mt-1 sm:text-3xl">Escreva sua redação</h1>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-slate-500"><CircleCheck className="h-3.5 w-3.5 text-emerald-500" /> <span className="sm:hidden">Salvo</span><span className="hidden sm:inline">Rascunho salvo automaticamente</span></p>
      </div>

      {/* atalho de foto no celular */}
      <button onClick={() => setFotoAberta(true)} className="mb-3 flex w-full items-center gap-3 rounded-2xl border border-tinta-200 bg-gradient-to-r from-tinta-50 to-white px-3 py-2.5 text-left transition active:scale-[.99] lg:hidden">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-tinta-600 text-white shadow-sm"><Camera className="h-4 w-4" /></span>
        <span className="flex-1">
          <span className="block text-sm font-bold text-slate-900">Escreveu no papel?</span>
          <span className="text-xs text-slate-600">Envie uma foto e corrija sem digitar</span>
        </span>
        <ScanText className="h-5 w-5 text-tinta-500" />
      </button>

      {/* TEMA */}
      <Cartao className="mb-4 flex flex-col gap-3 p-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tema</p>
          {tema ? (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h2 className="text-[15px] font-semibold leading-snug text-slate-900 sm:text-lg">{tema.titulo}</h2>
              {tema.origem === 'ENEM' && <Selo cor="tinta">ENEM {tema.ano}</Selo>}
              {tema.livre && <Selo>Tema livre</Selo>}
            </div>
          ) : (
            <p className="mt-1 text-sm text-slate-500 sm:text-base">Nenhum tema escolhido<span className="hidden sm:inline"> — escolha um para verificar a aderência ao tema</span>.</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Botao variante="secundario" tamanho="sm" icone={Library} onClick={() => setSeletor(true)}>{tema ? 'Trocar tema' : 'Escolher tema'}</Botao>
          <Botao variante="fantasma" tamanho="sm" icone={Shuffle} onClick={() => setTema(temaAleatorio())}>Sortear</Botao>
        </div>
      </Cartao>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* FOLHA */}
        <div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-papel shadow-suave">
            <div className="flex items-center justify-between border-b border-slate-200/80 bg-white/70 px-4 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Folha de redação</span>
              <span className={cx('text-xs font-semibold tabular-nums', longo ? 'text-rose-600' : curto ? 'text-amber-600' : 'text-emerald-600')}>
                {linhasFolha ? '' : '≈ '}{stats.linhas}/{MAX_LINHAS} linhas{linhasFolha ? ' na folha' : ''}
              </span>
            </div>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={'Comece sua redação aqui…\n\nDica: separe os parágrafos com Enter. Uma boa redação tem 4 ou 5 parágrafos: introdução, dois de desenvolvimento e conclusão com proposta de intervenção.'}
              spellCheck={false}
              aria-label="Texto da redação"
              className="block min-h-[560px] w-full resize-y bg-transparent px-6 py-[6px] font-serif text-[17px] leading-8 text-slate-800 outline-none placeholder:text-slate-400"
              style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 31px, #e2e8f0 31px, #e2e8f0 32px)', backgroundAttachment: 'local', backgroundPositionY: '6px' }}
            />
          </div>
          <div className={cx('mt-3 flex flex-wrap items-center gap-2 rounded-xl p-2', destacarEnvio && 'bg-tinta-50 ring-2 ring-tinta-200')}>
            <input ref={arquivoRef} type="file" accept=".txt,text/plain" className="hidden" onChange={abrirArquivo} />
            <Botao tamanho="sm" icone={Camera} onClick={() => setFotoAberta(true)}>Enviar foto da redação</Botao>
            <Botao variante="secundario" tamanho="sm" icone={Upload} onClick={() => arquivoRef.current?.click()}>Enviar arquivo .txt</Botao>
            <Botao variante="fantasma" tamanho="sm" icone={Trash2} onClick={() => { if (!texto || confirm('Apagar todo o texto?')) setTexto('') }} disabled={!texto}>Limpar</Botao>
            {destacarEnvio && <span className="text-xs text-tinta-700">Cole seu texto na folha ou envie um arquivo .txt.</span>}
          </div>
        </div>

        {/* LATERAL */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Cartao className="p-5">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[['Palavras', stats.palavras], ['Parágrafos', stats.paragrafos], ['Frases', stats.sentencas]].map(([r, v]) => (
                <div key={r} className="rounded-xl bg-slate-50 py-2.5">
                  <p className="text-xl font-bold tabular-nums text-slate-900">{v}</p>
                  <p className="text-[11px] font-medium text-slate-500">{r}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5">{linhasFolha ? 'Linhas na folha (foto)' : 'Linhas estimadas'}
                  {linhasFolha && <button onClick={() => setLinhasFolha(null)} className="rounded px-1 text-[11px] font-semibold text-tinta-700 hover:bg-tinta-50" title="Voltar a estimar pelo tamanho do texto">usar estimativa</button>}
                </span><span className="tabular-nums">{stats.linhas} de {MAX_LINHAS}</span>
              </div>
              <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className={cx('h-full rounded-full transition-all', longo ? 'bg-rose-500' : curto ? 'bg-amber-400' : 'bg-emerald-500')} style={{ width: `${pctLinhas}%` }} />
                <div className="absolute inset-y-0 w-px bg-slate-400" style={{ left: `${(MIN_LINHAS / MAX_LINHAS) * 100}%` }} title="Mínimo: 8 linhas" />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">Mínimo de 8 linhas · máximo de 30 na folha oficial</p>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-4"><Cronometro /></div>
          </Cartao>

          <Cartao className="p-5">
            <h3 className="text-sm font-semibold text-slate-900">Checklist da estrutura</h3>
            <ul className="mt-3 space-y-2">
              <Item ok={!!tema}>Tema escolhido</Item>
              <Item ok={stats.paragrafos >= 4 && stats.paragrafos <= 5}>4 ou 5 parágrafos</Item>
              <Item ok={!curto && !longo}>Entre 8 e 30 linhas</Item>
              <Item ok={stats.palavras >= 250}>Pelo menos 250 palavras</Item>
              <Item ok={stats.mediaPalavrasFrase > 0 && stats.mediaPalavrasFrase <= 35}>Frases com tamanho adequado</Item>
            </ul>
          </Cartao>

          <Cartao className="p-5">
            <label className="flex cursor-pointer items-start justify-between gap-3">
              <span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900"><SpellCheck className="h-4 w-4 text-tinta-600" /> Verificação avançada</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">Usa o LanguageTool (gratuito) para checar ortografia e gramática com mais precisão.</span>
              </span>
              <input type="checkbox" className="peer sr-only" checked={usarLT} onChange={(e) => setUsarLT(e.target.checked)} />
              <span className="relative mt-1 h-6 w-11 shrink-0 rounded-full bg-slate-200 transition peer-checked:bg-tinta-600 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5 peer-focus-visible:ring-4 peer-focus-visible:ring-tinta-100" />
            </label>
          </Cartao>

          {erro && <p className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {erro}</p>}
          {curto && stats.palavras > 0 && (
            <p className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800"><Info className="mt-0.5 h-4 w-4 shrink-0" /> Redações com até 7 linhas recebem nota zero no ENEM. Você ainda pode corrigir para ver o resultado.</p>
          )}
          <Botao tamanho="lg" className="w-full" icone={Sparkles} onClick={corrigir} carregando={corrigindo} disabled={!texto.trim()}>
            Corrigir redação
          </Botao>
        </aside>
      </div>

      {/* barra fixa de ação no celular */}
      <div className="fixed inset-x-0 bottom-[calc(78px+env(safe-area-inset-bottom))] z-30 border-t border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="min-w-0 flex-1 text-xs leading-tight text-slate-500">
            <p className="font-semibold tabular-nums text-slate-800">{stats.palavras} palavras · {linhasFolha ? '' : '≈'}{stats.linhas}/{MAX_LINHAS} linhas</p>
            <p className="truncate">{tema ? tema.titulo : 'Sem tema escolhido'}</p>
          </div>
          <Botao tamanho="sm" icone={Sparkles} onClick={corrigir} carregando={corrigindo} disabled={!texto.trim()}>Corrigir</Botao>
        </div>
      </div>
      <SeletorTema aberto={seletor} onFechar={() => setSeletor(false)} onEscolher={setTema} />
      <EnviarFoto aberto={fotoAberta} onFechar={() => setFotoAberta(false)} temaAtual={tema}
        onConcluir={(t, novoTema, linhas) => { setTexto(t); setOrigem('foto'); setLinhasFolha(linhas || null); if (novoTema) setTema(novoTema) }}
        onDigitar={() => setTimeout(() => document.querySelector('textarea[aria-label="Texto da redação"]')?.focus(), 100)} />

      {corrigindo && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-white/80 p-4 backdrop-blur-sm" role="status" aria-live="polite">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-2xl animate-surgir">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-tinta-50 text-tinta-600">
              <PenLine className="h-7 w-7 animate-pulse" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">Corrigindo sua redação</h2>
            <ul className="mt-5 space-y-2 text-left">
              {ETAPAS.map((t, i) => (
                <li key={t} className={cx('flex items-center gap-2 text-sm transition', i < etapa ? 'text-slate-500' : i === etapa ? 'font-medium text-slate-900' : 'text-slate-300')}>
                  {i < etapa ? <CircleCheck className="h-4 w-4 text-emerald-500" /> : i === etapa ? <LoaderCircle className="h-4 w-4 animate-spin text-tinta-600" /> : <Circle className="h-4 w-4" />}
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Container>
  )
}
