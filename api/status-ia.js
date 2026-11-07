// GET /api/status-ia — informa ao site se os recursos com IA estão ativos (sem expor nada sensível).
import { provedorIA, responder } from '../server/ia.js'

export default function handler(req, res) {
  const provedor = provedorIA()
  responder(res, 200, { ia: !!provedor, provedor })
}
