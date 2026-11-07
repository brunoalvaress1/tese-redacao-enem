// Identidade visual de cada competência (classes Tailwind estáticas para o JIT).
export const COMP = {
  c1: { n: 1, curto: 'C1', titulo: 'Norma-padrão', cor: '#e11d48', bg: 'bg-rose-50', texto: 'text-rose-700', borda: 'border-rose-200', solido: 'bg-rose-500', anel: 'ring-rose-200', marca: 'decoration-rose-500 bg-rose-100/70' },
  c2: { n: 2, curto: 'C2', titulo: 'Proposta e repertório', cor: '#d97706', bg: 'bg-amber-50', texto: 'text-amber-700', borda: 'border-amber-200', solido: 'bg-amber-500', anel: 'ring-amber-200', marca: 'decoration-amber-500 bg-amber-100/80' },
  c3: { n: 3, curto: 'C3', titulo: 'Argumentação', cor: '#0284c7', bg: 'bg-sky-50', texto: 'text-sky-700', borda: 'border-sky-200', solido: 'bg-sky-500', anel: 'ring-sky-200', marca: 'decoration-sky-500 bg-sky-100/80' },
  c4: { n: 4, curto: 'C4', titulo: 'Coesão', cor: '#7c3aed', bg: 'bg-violet-50', texto: 'text-violet-700', borda: 'border-violet-200', solido: 'bg-violet-500', anel: 'ring-violet-200', marca: 'decoration-violet-500 bg-violet-100/80' },
  c5: { n: 5, curto: 'C5', titulo: 'Intervenção', cor: '#059669', bg: 'bg-emerald-50', texto: 'text-emerald-700', borda: 'border-emerald-200', solido: 'bg-emerald-500', anel: 'ring-emerald-200', marca: 'decoration-emerald-500 bg-emerald-100/80' },
}
export const CHAVES = ['c1', 'c2', 'c3', 'c4', 'c5']

export function corNota(total) {
  if (total >= 900) return { texto: 'text-emerald-600', bg: 'bg-emerald-500', hex: '#059669', rotulo: 'Excelente' }
  if (total >= 700) return { texto: 'text-tinta-600', bg: 'bg-tinta-600', hex: '#2149eb', rotulo: 'Muito bom' }
  if (total >= 500) return { texto: 'text-amber-600', bg: 'bg-amber-500', hex: '#d97706', rotulo: 'Regular' }
  if (total > 0) return { texto: 'text-rose-600', bg: 'bg-rose-500', hex: '#e11d48', rotulo: 'Precisa melhorar' }
  return { texto: 'text-rose-600', bg: 'bg-rose-500', hex: '#e11d48', rotulo: 'Nota zero' }
}

export function formatarData(iso) {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}
