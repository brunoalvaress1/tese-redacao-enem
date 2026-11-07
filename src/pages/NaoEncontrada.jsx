import { Compass } from 'lucide-react'
import { Botao, Container, Vazio } from '../components/ui.jsx'

export default function NaoEncontrada() {
  return (
    <Container className="py-20">
      <Vazio icone={Compass} titulo="Página não encontrada" texto="O endereço acessado não existe ou foi removido."
        acao={<Botao to="/">Voltar ao início</Botao>} />
    </Container>
  )
}
