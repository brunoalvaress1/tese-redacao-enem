import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import { AuthProvider } from './lib/auth.jsx'
import { Carregando } from './components/ui.jsx'
import Inicio from './pages/Inicio.jsx'

const Temas = lazy(() => import('./pages/Temas.jsx'))
const Escrever = lazy(() => import('./pages/Escrever.jsx'))
const Correcao = lazy(() => import('./pages/Correcao.jsx'))
const Desempenho = lazy(() => import('./pages/Desempenho.jsx'))
const Guiada = lazy(() => import('./pages/Guiada.jsx'))
const Aprenda = lazy(() => import('./pages/Aprenda.jsx'))
const Aula = lazy(() => import('./pages/Aula.jsx'))
const Entrar = lazy(() => import('./pages/Entrar.jsx'))
const Perfil = lazy(() => import('./pages/Perfil.jsx'))
const NaoEncontrada = lazy(() => import('./pages/NaoEncontrada.jsx'))

const P = (C) => <Suspense fallback={<Carregando />}><C /></Suspense>

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Inicio />} />
          <Route path="temas" element={P(Temas)} />
          <Route path="escrever" element={P(Escrever)} />
          <Route path="escrever/:temaId" element={P(Escrever)} />
          <Route path="correcao/:id" element={P(Correcao)} />
          <Route path="desempenho" element={P(Desempenho)} />
          <Route path="guiada" element={P(Guiada)} />
          <Route path="aprenda" element={P(Aprenda)} />
          <Route path="aprenda/:slug" element={P(Aula)} />
          <Route path="entrar" element={P(Entrar)} />
          <Route path="perfil" element={P(Perfil)} />
          <Route path="*" element={P(NaoEncontrada)} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
