import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  PenLine, Search, Trash2, RotateCcw, ChevronRight, Flame, Trophy, Target, FileText, Award, Lock, Camera, Download,
  LogOut, UserPlus, LogIn, Pencil, Check, X, SpellCheck, Compass, FileClock, ChartLine, Cloud, Smartphone,
} from 'lucide-react'
import { Botao, Cartao, Container, Selo, Carregando, cx } from '../components/ui.jsx'
import { listarCorrecoes, excluirCorrecao, lerRascunho, salvarRascunho } from '../lib/armazenamento.js'
import { COMP, CHAVES, corNota, formatarData } from '../lib/competencias.js'
import { useAuth } from '../lib/auth.jsx'
import { buscarTema } from '../data/temas.js'
import { contarPalavras } from '../engine/texto.js'

const CHAVE_META = 'tese:meta'
const ler = (k, padrao) => { try { return localStorage.getItem(k) ?? padrao } catch { return padrao } }
const gravar = (k, v) => { try { localStorage.setItem(k, v) } catch { /* sem armazenamento */ } }

function diaLocal(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}
function sequenciaDias(lista) {
  const dias = new Set(lista.map((c) => diaLocal(c.criadoEm)))
  let n = 0
  const d = new Date()
  if (!dias.has(diaLocal(d.toISOString()))) d.setDate(d.getDate() - 1)
  while (dias.has(diaLocal(d.toISOString()))) { n++; d.setDate(d.getDate() - 1) }
  return n
}

function conquistas(lista, seq) {
  const melhor = Math.max(0, ...lista.map((c) => c.total))
  return [
    { id: 'primeira', titulo: 'Primeira redação', ok: lista.length >= 1, icone: PenLine },
    { id: 'cinco', titulo: '5 redações', ok: lista.length >= 5, icone: FileText },
    { id: 'dez', titulo: '10 redações', ok: lista.length >= 10, icone: FileText },
    { id: 'n700', titulo: 'Nota 700+', ok: melhor >= 700, icone: Target },
    { id: 'n900', titulo: 'Nota 900+', ok: melhor >= 900, icone: Trophy },
    { id: 'n1000', titulo: 'Nota 1000', ok: melhor >= 1000, icone: Award },
    { id: 'c5', titulo: 'Proposta completa', ok: lista.some((c) => c.notas.c5 === 200), icone: Check },
    { id: 'c1', titulo: 'Norma impecável', ok: lista.some((c) => c.notas.c1 === 200), icone: SpellCheck },
    { id: 'seq3', titulo: '3 dias seguidos', ok: seq >= 3, icone: Flame },
    { id: 'foto', titulo: 'Corrigiu por foto', ok: lista.some((c) => c.origem === 'foto'), icone: Camera },
  ]
}

function Avatar({ nome }) {
  const iniciais = (nome || 'Visitante').split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-tinta-500 to-tinta-700 text-xl font-bold text-white shadow-md shadow-tinta-600/30">{iniciais}</div>
  )
}

function CartaoRedacao({ c, onExcluir, onReescrever }) {
  const cor = corNota(c.total)
  return (
    <Cartao className="overflow-hidden transition hover:shadow-md">
      <Link to={`/correcao/${c.id}`} className="flex items-center gap-3 p-4">
        <div className={cx('grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-lg font-extrabold tabular-nums text-white', cor.bg)}>{c.total}</div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900">{c.tema?.titulo || 'Redação sem tema'}</p>
          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            {formatarData(c.criadoEm)} {c.origem === 'foto' && <span className="inline-flex items-center gap-0.5 text-tinta-600"><Camera className="h-3 w-3" /> foto</span>}
          </p>
          <div className="mt-2 flex gap-1" aria-label="Notas por competência">
            {CHAVES.map((k) => (
              <div key={k} className="flex-1" title={`${COMP[k].curto}: ${c.notas[k]}`}>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${c.notas[k] / 2}%`, background: COMP[k].cor }} /></div>
                <p className="mt-0.5 text-center text-[9px] font-semibold tabular-nums text-slate-400">{c.notas[k]}</p>
              </div>
            ))}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
      </Link>
      <div className="flex border-t border-slate-100 text-xs font-semibold">
        <button onClick={() => onReescrever(c)} className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-slate-600 hover:bg-slate-50"><RotateCcw className="h-3.5 w-3.5" /> Reescrever</button>
        <button onClick={() => onExcluir(c.id)} className="flex flex-1 items-center justify-center gap-1.5 border-l border-slate-100 py-2.5 text-rose-600 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /> Excluir</button>
      </div>
    </Cartao>
  )
}

const ABAS = [
  { id: 'redacoes', rotulo: 'Redações', icone: FileText },
  { id: 'rascunhos', rotulo: 'Rascunhos', icone: FileClock },
  { id: 'conta', rotulo: 'Conta', icone: SpellCheck },
]

export default function Perfil() {
  const { usuario, ativo, sair, atualizarNome } = useAuth()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const aba = ABAS.some((a) => a.id === params.get('aba')) ? params.get('aba') : 'redacoes'
  const [lista, setLista] = useState(null)
  const [busca, setBusca] = useState('')
  const [ordem, setOrdem] = useState('recentes')
  const [meta, setMeta] = useState(() => Number(ler(CHAVE_META, '900')))
  const [editandoNome, setEditandoNome] = useState(false)
  const [nome, setNome] = useState('')
  const [lt, setLt] = useState(() => ler('tese:lt', '1') !== '0')
  const mostrarConta = ativo || import.meta.env.DEV

  useEffect(() => {
    let vivo = true
    listarCorrecoes().then((l) => vivo && setLista(l))
    return () => { vivo = false }
  }, [usuario])
  useEffect(() => gravar(CHAVE_META, String(meta)), [meta])
  useEffect(() => gravar('tese:lt', lt ? '1' : '0'), [lt])

  const nomeExibido = usuario ? (usuario.user_metadata?.nome || usuario.email.split('@')[0]) : 'Visitante'

  const resumo = useMemo(() => {
    if (!lista) return null
    const seq = sequenciaDias(lista)
    const media = lista.length ? Math.round(lista.reduce((s, c) => s + c.total, 0) / lista.length) : 0
    const ultimas = lista.slice(0, 3)
    const mediaRecente = ultimas.length ? Math.round(ultimas.reduce((s, c) => s + c.total, 0) / ultimas.length) : 0
    return { seq, media, mediaRecente, melhor: Math.max(0, ...lista.map((c) => c.total)), conquistas: conquistas(lista, seq) }
  }, [lista])

  const filtradas = useMemo(() => {
    if (!lista) return []
    const q = busca.trim().toLowerCase()
    const l = lista.filter((c) => !q || (c.tema?.titulo || '').toLowerCase().includes(q))
    if (ordem === 'maior') return [...l].sort((a, b) => b.total - a.total)
    if (ordem === 'menor') return [...l].sort((a, b) => a.total - b.total)
    return l
  }, [lista, busca, ordem])

  const rascunho = lerRascunho()
  const guiada = (() => { try { return JSON.parse(localStorage.getItem('tese:guiada:v1') || 'null') } catch { return null } })()
  const palavrasGuiada = guiada?.partes ? Object.values(guiada.partes).reduce((s, t) => s + contarPalavras(t || ''), 0) : 0

  const excluir = async (id) => {
    if (!confirm('Excluir esta correção?')) return
    await excluirCorrecao(id)
    setLista((l) => l.filter((c) => c.id !== id))
  }
  const reescrever = (c) => {
    salvarRascunho({ texto: c.texto, temaId: c.tema?.id || null, temaLivre: c.tema && !c.tema.id ? c.tema.titulo : null, origem: c.origem })
    navigate(c.tema?.id ? `/escrever/${c.tema.id}` : '/escrever')
  }
  const exportar = () => {
    const blob = new Blob([JSON.stringify(lista, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `minhas-redacoes-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }
  const apagarLocal = () => {
    if (!confirm('Apagar o histórico salvo neste aparelho? (As correções da sua conta na nuvem não são afetadas.)')) return
    try { localStorage.removeItem('tese:correcoes:v1') } catch { /* sem armazenamento */ }
    listarCorrecoes().then(setLista)
  }
  const salvarNome = async () => {
    if (!nome.trim()) return
    const { error } = await atualizarNome(nome.trim())
    if (!error) setEditandoNome(false)
  }

  if (!lista || !resumo) return <Carregando texto="Carregando seu perfil…" />
  const progressoMeta = Math.min(100, Math.round((resumo.mediaRecente / meta) * 100))
  const feitas = resumo.conquistas.filter((x) => x.ok).length

  return (
    <Container className="max-w-3xl py-4 sm:py-10">
      {/* CABEÇALHO */}
      <Cartao className="p-5">
        <div className="flex items-center gap-4">
          <Avatar nome={nomeExibido} />
          <div className="min-w-0 flex-1">
            {editandoNome ? (
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); salvarNome() }}>
                <input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-tinta-400 focus:ring-4 focus:ring-tinta-100" aria-label="Seu nome" />
                <button type="submit" className="grid h-10 w-10 place-items-center rounded-xl bg-tinta-600 text-white" aria-label="Salvar nome"><Check className="h-4 w-4" /></button>
                <button type="button" onClick={() => setEditandoNome(false)} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600" aria-label="Cancelar"><X className="h-4 w-4" /></button>
              </form>
            ) : (
              <h1 className="flex items-center gap-2 truncate text-xl font-bold text-slate-900">
                {nomeExibido}
                {usuario && <button onClick={() => { setNome(nomeExibido); setEditandoNome(true) }} className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100" aria-label="Editar nome"><Pencil className="h-3.5 w-3.5" /></button>}
              </h1>
            )}
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-slate-500">
              {usuario ? <><Cloud className="h-3.5 w-3.5 text-emerald-500" /> {usuario.email}</> : <><Smartphone className="h-3.5 w-3.5" /> Histórico salvo neste aparelho</>}
            </p>
          </div>
        </div>
        {!usuario && mostrarConta && (
          <div className="mt-4 rounded-2xl bg-tinta-50 p-4">
            <p className="text-sm font-semibold text-tinta-900">Crie sua conta grátis</p>
            <p className="mt-0.5 text-xs text-tinta-800/80">Guarde todas as redações, veja sua evolução em qualquer celular ou computador e use a leitura de foto com IA.</p>
            <div className="mt-3 flex gap-2">
              <Botao to="/entrar?modo=cadastrar" tamanho="sm" icone={UserPlus}>Criar conta</Botao>
              <Botao to="/entrar" tamanho="sm" variante="secundario" icone={LogIn}>Já tenho conta</Botao>
            </div>
          </div>
        )}
      </Cartao>

      {/* NÚMEROS */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          [FileText, 'Redações', lista.length, 'text-tinta-600'],
          [Target, 'Média', resumo.media || '—', 'text-sky-600'],
          [Trophy, 'Melhor nota', resumo.melhor || '—', 'text-amber-500'],
          [Flame, 'Sequência', `${resumo.seq} ${resumo.seq === 1 ? 'dia' : 'dias'}`, 'text-orange-500'],
        ].map(([I, r, v, c]) => (
          <Cartao key={r} className="p-4">
            <I className={cx('h-5 w-5', c)} />
            <p className="mt-2 text-2xl font-extrabold tabular-nums tracking-tight text-slate-900">{v}</p>
            <p className="text-xs font-medium text-slate-500">{r}</p>
          </Cartao>
        ))}
      </div>

      {/* META */}
      <Cartao className="mt-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-900">Minha meta</h2>
            <p className="text-xs text-slate-500">Média das últimas 3 redações: <b className="text-slate-700">{resumo.mediaRecente || '—'}</b></p>
          </div>
          <select value={meta} onChange={(e) => setMeta(Number(e.target.value))} aria-label="Meta de nota"
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:ring-4 focus:ring-tinta-100">
            {[600, 700, 800, 900, 960, 1000].map((v) => <option key={v} value={v}>{v} pontos</option>)}
          </select>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-tinta-500 to-emerald-500 transition-all duration-700" style={{ width: `${progressoMeta}%` }} />
        </div>
        <p className="mt-2 text-sm text-slate-600">
          {!lista.length ? 'Corrija uma redação para começar a acompanhar sua meta.'
            : resumo.mediaRecente >= meta ? '🎉 Meta alcançada! Que tal subir o desafio?'
              : `Faltam ${meta - resumo.mediaRecente} pontos para a sua meta.`}
        </p>
        {lista.length > 0 && <Link to="/desempenho" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-tinta-700 hover:underline"><ChartLine className="h-4 w-4" /> Ver gráficos de evolução</Link>}
      </Cartao>

      {/* CONQUISTAS */}
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="font-semibold text-slate-900">Conquistas</h2>
          <span className="text-xs font-medium text-slate-500">{feitas}/{resumo.conquistas.length}</span>
        </div>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {resumo.conquistas.map((q, i) => (
            <div key={q.id} className={cx('flex w-24 shrink-0 flex-col items-center rounded-2xl border p-3 text-center animate-surgir', q.ok ? 'border-amber-200 bg-gradient-to-b from-amber-50 to-white' : 'border-slate-200 bg-white opacity-60')}
              style={{ animationDelay: `${i * 40}ms` }}>
              <div className={cx('grid h-10 w-10 place-items-center rounded-full', q.ok ? 'bg-amber-400 text-white shadow-md shadow-amber-400/40' : 'bg-slate-100 text-slate-400')}>
                {q.ok ? <q.icone className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
              </div>
              <p className="mt-2 text-[11px] font-semibold leading-tight text-slate-700">{q.titulo}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ABAS */}
      <div className="mt-6 grid grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm" role="tablist">
        {ABAS.map((a) => (
          <button key={a.id} role="tab" aria-selected={aba === a.id} onClick={() => setParams({ aba: a.id }, { replace: true })}
            className={cx('flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition', aba === a.id ? 'bg-tinta-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100')}>
            <a.icone className="h-4 w-4" /> {a.rotulo}
          </button>
        ))}
      </div>

      <div key={aba} className="mt-4 animate-surgir">
        {aba === 'redacoes' && (
          lista.length ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar pelo tema…" aria-label="Buscar redação"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-tinta-400 focus:ring-4 focus:ring-tinta-100" />
                </div>
                <select value={ordem} onChange={(e) => setOrdem(e.target.value)} aria-label="Ordenar"
                  className="h-10 rounded-xl border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-tinta-100">
                  <option value="recentes">Recentes</option>
                  <option value="maior">Maior nota</option>
                  <option value="menor">Menor nota</option>
                </select>
              </div>
              {filtradas.map((c) => <CartaoRedacao key={c.id} c={c} onExcluir={excluir} onReescrever={reescrever} />)}
              {!filtradas.length && <p className="py-6 text-center text-sm text-slate-500">Nenhuma redação com “{busca}”.</p>}
            </div>
          ) : (
            <Cartao className="p-8 text-center">
              <FileText className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 font-semibold text-slate-800">Você ainda não corrigiu nenhuma redação</p>
              <p className="mt-1 text-sm text-slate-500">Suas redações corrigidas aparecem aqui, com nota e competências.</p>
              <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                <Botao to="/escrever" icone={PenLine}>Escrever redação</Botao>
                <Botao to="/escrever?foto=1" variante="secundario" icone={Camera}>Enviar foto</Botao>
              </div>
            </Cartao>
          )
        )}

        {aba === 'rascunhos' && (
          <div className="space-y-3">
            <Cartao className="flex items-center gap-3 p-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-tinta-50 text-tinta-600"><PenLine className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">Rascunho do editor</p>
                <p className="truncate text-xs text-slate-500">
                  {rascunho?.texto?.trim() ? `${contarPalavras(rascunho.texto)} palavras · ${buscarTema(rascunho.temaId)?.titulo || rascunho.temaLivre || 'sem tema'}` : 'Nenhum rascunho em andamento'}
                </p>
              </div>
              <Botao to={rascunho?.temaId ? `/escrever/${rascunho.temaId}` : '/escrever'} tamanho="sm" variante={rascunho?.texto?.trim() ? 'primario' : 'secundario'}>{rascunho?.texto?.trim() ? 'Continuar' : 'Começar'}</Botao>
            </Cartao>
            <Cartao className="flex items-center gap-3 p-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Compass className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">Redação guiada</p>
                <p className="truncate text-xs text-slate-500">{palavrasGuiada ? `${palavrasGuiada} palavras · etapa ${(guiada?.passo || 0) + 1} de 5` : 'Nenhuma redação guiada em andamento'}</p>
              </div>
              <Botao to="/guiada" tamanho="sm" variante={palavrasGuiada ? 'primario' : 'secundario'}>{palavrasGuiada ? 'Continuar' : 'Começar'}</Botao>
            </Cartao>
          </div>
        )}

        {aba === 'conta' && (
          <Cartao className="divide-y divide-slate-100">
            <label className="flex cursor-pointer items-center justify-between gap-3 p-4">
              <span>
                <span className="block text-sm font-semibold text-slate-900">Verificação ortográfica avançada</span>
                <span className="text-xs text-slate-500">Usa o LanguageTool para checar gramática com mais precisão.</span>
              </span>
              <input type="checkbox" className="peer sr-only" checked={lt} onChange={(e) => setLt(e.target.checked)} />
              <span className="relative h-6 w-11 shrink-0 rounded-full bg-slate-200 transition peer-checked:bg-tinta-600 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
            </label>
            <button onClick={exportar} disabled={!lista.length} className="flex w-full items-center gap-3 p-4 text-left text-sm hover:bg-slate-50 disabled:opacity-50">
              <Download className="h-5 w-5 text-slate-500" /> <span className="flex-1"><b className="block font-semibold text-slate-900">Exportar minhas redações</b><span className="text-xs text-slate-500">Baixe um arquivo com todo o histórico.</span></span>
            </button>
            <Link to="/aprenda/competencias" className="flex items-center gap-3 p-4 text-sm hover:bg-slate-50">
              <Award className="h-5 w-5 text-slate-500" /> <span className="flex-1"><b className="block font-semibold text-slate-900">Como a nota é calculada</b><span className="text-xs text-slate-500">Entenda as 5 competências do ENEM.</span></span>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </Link>
            <button onClick={apagarLocal} className="flex w-full items-center gap-3 p-4 text-left text-sm hover:bg-rose-50">
              <Trash2 className="h-5 w-5 text-rose-500" /> <span className="flex-1"><b className="block font-semibold text-rose-600">Apagar histórico deste aparelho</b><span className="text-xs text-slate-500">Não afeta as correções salvas na sua conta.</span></span>
            </button>
            {usuario && (
              <button onClick={sair} className="flex w-full items-center gap-3 p-4 text-left text-sm hover:bg-slate-50">
                <LogOut className="h-5 w-5 text-slate-500" /> <b className="font-semibold text-slate-900">Sair da conta</b>
              </button>
            )}
          </Cartao>
        )}
      </div>
    </Container>
  )
}
