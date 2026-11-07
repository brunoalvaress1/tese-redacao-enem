import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, LabelList,
} from 'recharts'
import { ChartLine, PenLine, Trophy, Target, TrendingUp, TrendingDown, FileText, Trash2, ArrowRight, Lightbulb, Cloud } from 'lucide-react'
import { Botao, Cartao, Container, Titulo, Vazio, Carregando, Selo, cx } from '../components/ui.jsx'
import { listarCorrecoes, excluirCorrecao } from '../lib/armazenamento.js'
import { COMP, CHAVES, corNota, formatarData } from '../lib/competencias.js'
import { useAuth } from '../lib/auth.jsx'

const AULA = { c1: 'norma-padrao', c2: 'repertorio', c3: 'argumentacao', c4: 'conectivos', c5: 'proposta-de-intervencao' }

function Tile({ icone: Icone, rotulo, valor, detalhe }) {
  return (
    <Cartao className="p-4 sm:p-5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 sm:gap-2 sm:text-sm"><Icone className="h-4 w-4 shrink-0" /> {rotulo}</div>
      <p className="mt-1.5 text-2xl font-extrabold tabular-nums tracking-tight text-slate-900 sm:mt-2 sm:text-3xl">{valor}</p>
      {detalhe && <p className="mt-1 text-xs text-slate-500">{detalhe}</p>}
    </Cartao>
  )
}

function DicaTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-slate-900">{d.rotulo}</p>
      <p className="mt-0.5 max-w-[220px] truncate text-slate-500">{d.tema}</p>
      <p className="mt-1 text-sm font-bold tabular-nums text-slate-900">{d.total} pontos</p>
    </div>
  )
}

function DicaCompetencias({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-slate-900">{d.rotulo}</p>
      <ul className="mt-1.5 space-y-1">
        {CHAVES.map((k) => (
          <li key={k} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-600"><span className="h-2 w-2 rounded-full" style={{ background: COMP[k].cor }} />{COMP[k].curto}</span>
            <b className="tabular-nums text-slate-900">{d[k]}</b>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DicaBarra({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-slate-900">{d.nome}</p>
      <p className="mt-1 tabular-nums text-slate-700">Média: <b>{d.media}</b> / 200</p>
    </div>
  )
}

export default function Desempenho() {
  const [lista, setLista] = useState(null)
  const { usuario, ativo } = useAuth()

  useEffect(() => {
    let vivo = true
    listarCorrecoes().then((l) => vivo && setLista(l))
    return () => { vivo = false }
  }, [usuario])

  const dados = useMemo(() => {
    if (!lista?.length) return null
    const cron = [...lista].reverse()
    const serie = cron.map((c, i) => ({ i: i + 1, rotulo: `${i + 1}ª · ${formatarData(c.criadoEm)}`, total: c.total, tema: c.tema?.titulo || 'Sem tema', ...c.notas }))
    const medias = CHAVES.map((k) => ({
      k, nome: `${COMP[k].curto} · ${COMP[k].titulo}`,
      media: Math.round(lista.reduce((s, c) => s + c.notas[k], 0) / lista.length),
    }))
    const media = Math.round(lista.reduce((s, c) => s + c.total, 0) / lista.length)
    const melhor = Math.max(...lista.map((c) => c.total))
    const evolucao = cron.length >= 2 ? cron[cron.length - 1].total - cron[0].total : null
    const fraca = [...medias].sort((a, b) => a.media - b.media)[0]
    return { serie, medias, media, melhor, evolucao, fraca }
  }, [lista])

  const remover = async (id) => {
    if (!confirm('Excluir esta correção do histórico?')) return
    await excluirCorrecao(id)
    setLista((l) => l.filter((c) => c.id !== id))
  }

  if (lista === null) return <Carregando texto="Carregando seu desempenho…" />

  return (
    <Container className="py-5 sm:py-10">
      <Titulo sobretitulo="Desempenho" titulo={usuario ? `Olá, ${(usuario.user_metadata?.nome || usuario.email).split(' ')[0]}! Esta é sua evolução` : 'Sua evolução na redação'}
        descricao={usuario ? `Histórico da conta ${usuario.email}, disponível em qualquer dispositivo.` : 'Histórico salvo neste navegador.' }
        acao={<Botao to="/escrever" icone={PenLine}>Nova redação</Botao>} />
      {ativo && !usuario && lista.length > 0 && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-tinta-50 px-4 py-3 text-sm text-tinta-800">
          <Cloud className="h-4 w-4 shrink-0" /> <span><Link to="/entrar" className="font-semibold underline">Entre ou crie uma conta</Link> para guardar seu histórico na nuvem e acessá-lo em qualquer dispositivo.</span>
        </p>
      )}

      {!dados ? (
        <div className="mt-8">
          <Vazio icone={ChartLine} titulo="Nenhuma redação corrigida ainda" texto="Corrija sua primeira redação para ver gráficos de evolução e a média por competência."
            acao={<Botao to="/escrever" icone={PenLine}>Corrigir minha primeira redação</Botao>} />
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-4">
            <Tile icone={FileText} rotulo="Redações corrigidas" valor={lista.length} />
            <Tile icone={Target} rotulo="Média geral" valor={dados.media} detalhe={corNota(dados.media).rotulo} />
            <Tile icone={Trophy} rotulo="Melhor nota" valor={dados.melhor} />
            <Tile icone={dados.evolucao !== null && dados.evolucao < 0 ? TrendingDown : TrendingUp} rotulo="Evolução"
              valor={dados.evolucao === null ? '—' : `${dados.evolucao > 0 ? '+' : ''}${dados.evolucao}`}
              detalhe={dados.evolucao === null ? 'Corrija mais redações para comparar' : 'da primeira para a última redação'} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Cartao className="p-5">
              <h2 className="font-semibold text-slate-900">Nota total por redação</h2>
              <p className="text-xs text-slate-500">Da mais antiga para a mais recente</p>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dados.serie} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#eef2f6" />
                    <XAxis dataKey="i" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `${v}ª`} />
                    <YAxis domain={[0, 1000]} ticks={[0, 200, 400, 600, 800, 1000]} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip content={<DicaTooltip />} cursor={{ stroke: '#94a3b8', strokeDasharray: '4 4' }} />
                    <Line type="monotone" dataKey="total" stroke="#2149eb" strokeWidth={2} dot={{ r: 4, fill: '#2149eb', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Cartao>

            <Cartao className="p-5">
              <h2 className="font-semibold text-slate-900">Média por competência</h2>
              <p className="text-xs text-slate-500">Escala de 0 a 200 pontos</p>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dados.medias} layout="vertical" margin={{ top: 0, right: 36, left: 0, bottom: 0 }} barCategoryGap={10}>
                    <CartesianGrid horizontal={false} stroke="#eef2f6" />
                    <XAxis type="number" domain={[0, 200]} ticks={[0, 40, 80, 120, 160, 200]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis type="category" dataKey="nome" width={130} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#334155' }} />
                    <Tooltip content={<DicaBarra />} cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="media" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                      {dados.medias.map((m) => <Cell key={m.k} fill={COMP[m.k].cor} />)}
                      <LabelList dataKey="media" position="right" style={{ fontSize: 12, fontWeight: 700, fill: '#0f172a' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Cartao>
          </div>

          <Cartao className="mt-6 p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">Evolução por competência</h2>
                <p className="text-xs text-slate-500">Nota de cada competência (0 a 200) em cada redação</p>
              </div>
              <ul className="flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Legenda">
                {CHAVES.map((k) => (
                  <li key={k} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="h-0.5 w-4 rounded-full" style={{ background: COMP[k].cor }} /> {COMP[k].curto} · {COMP[k].titulo}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dados.serie} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#eef2f6" />
                  <XAxis dataKey="i" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(v) => `${v}ª`} />
                  <YAxis domain={[0, 200]} ticks={[0, 40, 80, 120, 160, 200]} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip content={<DicaCompetencias />} cursor={{ stroke: '#94a3b8', strokeDasharray: '4 4' }} />
                  {CHAVES.map((k) => (
                    <Line key={k} type="monotone" dataKey={k} name={COMP[k].curto} stroke={COMP[k].cor} strokeWidth={2}
                      dot={{ r: 4, fill: COMP[k].cor, stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} isAnimationActive={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Cartao>

          <Cartao className={cx('mt-6 flex flex-col gap-4 border p-5 sm:flex-row sm:items-center sm:justify-between', COMP[dados.fraca.k].borda, COMP[dados.fraca.k].bg)}>
            <div className="flex gap-3">
              <Lightbulb className={cx('mt-0.5 h-5 w-5 shrink-0', COMP[dados.fraca.k].texto)} />
              <div>
                <p className="font-semibold text-slate-900">Foco recomendado: {COMP[dados.fraca.k].curto} — {COMP[dados.fraca.k].titulo}</p>
                <p className="mt-0.5 text-sm text-slate-600">É a competência com a menor média ({dados.fraca.media}/200). Estudar esse ponto tende a dar o maior ganho de nota.</p>
              </div>
            </div>
            <Botao to={`/aprenda/${AULA[dados.fraca.k]}`} variante="secundario" tamanho="sm" iconeDireita={ArrowRight}>Estudar agora</Botao>
          </Cartao>

          <Cartao className="mt-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900">Histórico de correções</h2>
              <Selo>{lista.length}</Selo>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3">Data</th>
                    <th className="px-3 py-3">Tema</th>
                    {CHAVES.map((k) => <th key={k} className="px-2 py-3 text-center">{COMP[k].curto}</th>)}
                    <th className="px-3 py-3 text-right">Total</th>
                    <th className="px-5 py-3"><span className="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lista.map((c) => (
                    <tr key={c.id} className="transition hover:bg-slate-50">
                      <td className="whitespace-nowrap px-5 py-3 text-slate-500">{formatarData(c.criadoEm)}</td>
                      <td className="max-w-[280px] px-3 py-3"><Link to={`/correcao/${c.id}`} className="line-clamp-1 font-medium text-slate-800 hover:text-tinta-700">{c.tema?.titulo || 'Sem tema'}</Link></td>
                      {CHAVES.map((k) => <td key={k} className="px-2 py-3 text-center tabular-nums text-slate-600">{c.notas[k]}</td>)}
                      <td className={cx('px-3 py-3 text-right font-bold tabular-nums', corNota(c.total).texto)}>{c.total}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-right">
                        <Link to={`/correcao/${c.id}`} className="mr-1 inline-grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Abrir correção"><ArrowRight className="h-4 w-4" /></Link>
                        <button onClick={() => remover(c.id)} className="inline-grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Excluir correção"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Cartao>
        </>
      )}
    </Container>
  )
}
