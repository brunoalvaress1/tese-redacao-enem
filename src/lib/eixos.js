import { Scale, GraduationCap, HeartPulse, Cpu, Leaf, Palette, Briefcase, ShieldAlert, PenLine } from 'lucide-react'

// Ícone e cor de cada eixo temático (classes estáticas para o Tailwind).
export const EIXO = {
  'Cidadania e direitos': { icone: Scale, cor: 'bg-sky-50 text-sky-600' },
  Educação: { icone: GraduationCap, cor: 'bg-indigo-50 text-indigo-600' },
  Saúde: { icone: HeartPulse, cor: 'bg-rose-50 text-rose-600' },
  'Tecnologia e comunicação': { icone: Cpu, cor: 'bg-violet-50 text-violet-600' },
  'Meio ambiente': { icone: Leaf, cor: 'bg-emerald-50 text-emerald-600' },
  'Cultura e diversidade': { icone: Palette, cor: 'bg-amber-50 text-amber-600' },
  'Trabalho e economia': { icone: Briefcase, cor: 'bg-teal-50 text-teal-600' },
  'Violência e segurança': { icone: ShieldAlert, cor: 'bg-orange-50 text-orange-600' },
  'Tema livre': { icone: PenLine, cor: 'bg-slate-100 text-slate-600' },
}
export const eixoDe = (nome) => EIXO[nome] || EIXO['Tema livre']
