import { HttpError } from '../utils/httpError.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Rota não encontrada.' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    const body = { error: err.message };
    if (err.details) body.details = err.details;
    return res.status(err.status).json(body);
  }

  // Erros do express.json(): corpo malformado ou grande demais.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Requisição grande demais.' });
  }

  // Loga só método, rota e erro; nunca o corpo da requisição (pode conter senha).
  console.error(`[${req.method} ${req.originalUrl}]`, err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
}
