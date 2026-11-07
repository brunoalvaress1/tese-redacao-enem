import { Link } from 'react-router-dom'
import { GraduationCap, Clock, ArrowRight, BookOpen, PenLine, Compass } from 'lucide-react'
import { Botao, Cartao, Container, Titulo, Selo } from '../components/ui.jsx'
import { AULAS, MODULOS } from '../data/aulas.js'

export default function Aprenda() {
  return (
    <Container className="py-5 sm:py-10">
      <Titulo sobretitulo="Curso gratuito" titulo="Redação nota 1000, do zero"
        descricao="Aulas curtas e diretas sobre estrutura, as 5 competências, repertório, conectivos e proposta de intervenção — com uma redação modelo comentada." />
      <div className="mt-5 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-4">
        {[[BookOpen, `${AULAS.length} aulas`, 'Conteúdo completo e gratuito'], [Clock, `${AULAS.reduce((s, a) => s + parseInt(a.duracao, 10), 0)} minutos`, 'Para estudar no seu ritmo'], [PenLine, 'Prática integrada', 'Corrija sua redação a cada aula']].map(([I, t, d]) => (
          <Cartao key={t} className="flex flex-col items-center gap-2 p-3 text-center sm:flex-row sm:gap-4 sm:p-5 sm:text-left">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-tinta-50 text-tinta-600 sm:h-11 sm:w-11"><I className="h-5 w-5" /></div>
            <div><p className="text-xs font-bold text-slate-900 sm:text-base">{t}</p><p className="hidden text-sm text-slate-500 sm:block">{d}</p></div>
          </Cartao>
        ))}
      </div>
      {MODULOS.map((mod) => (
        <section key={mod} className="mt-10">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><GraduationCap className="h-5 w-5 text-tinta-600" /> {mod}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AULAS.filter((a) => a.modulo === mod).map((a) => (
              <Link key={a.slug} to={`/aprenda/${a.slug}`} className="group">
                <Cartao className="flex h-full flex-col p-5 transition group-hover:-translate-y-0.5 group-hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <Selo cor="tinta">Aula {AULAS.indexOf(a) + 1}</Selo>
                    <span className="flex items-center gap-1 text-xs text-slate-500"><Clock className="h-3.5 w-3.5" /> {a.duracao}</span>
                  </div>
                  <h3 className="mt-3 font-semibold text-slate-900 group-hover:text-tinta-700">{a.titulo}</h3>
                  <p className="mt-1 flex-1 text-sm text-slate-600">{a.resumo}</p>
                  <span className="mt-4 flex items-center gap-1 text-sm font-semibold text-tinta-700">Começar aula <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
                </Cartao>
              </Link>
            ))}
          </div>
        </section>
      ))}
      <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-3xl bg-slate-900 p-8 text-white sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold">Pronto para praticar?</h2>
          <p className="mt-1 text-slate-300">Use a redação guiada para aplicar a estrutura parágrafo por parágrafo.</p>
        </div>
        <Botao to="/guiada" variante="claro" icone={Compass}>Abrir redação guiada</Botao>
      </div>
    </Container>
  )
}
