// GET /api/status-ia — informa ao site se os recursos com IA estão ativos (sem expor nada sensível).
import { iaConfigurada, responder } from '../server/ia.js'

export default function handler(req, res) {
  responder(res, 200, { ia: iaConfigurada() })
}
