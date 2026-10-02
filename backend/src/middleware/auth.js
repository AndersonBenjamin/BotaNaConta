import { getUserFromToken } from '../services/authService.js';
import { unauthorized } from '../utils/httpError.js';

export async function requireAuth(req, res, next) {
  const [scheme, token] = (req.get('authorization') ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw unauthorized();
  }

  const user = await getUserFromToken(token);
  if (!user) {
    throw unauthorized('Sessão expirada ou inválida. Faça login novamente.');
  }

  req.user = user;
  next();
}
