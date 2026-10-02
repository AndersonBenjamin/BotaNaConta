import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { prisma } from '../utils/prisma.js';
import { unauthorized } from '../utils/httpError.js';

export const publicUserSelect = { id: true, name: true, email: true };

// Hash usado quando o e-mail não existe, para que a resposta demore o mesmo tempo
// e não revele quais e-mails estão cadastrados.
const DUMMY_HASH = await bcrypt.hash('usuario-inexistente', 12);

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !passwordMatches) {
    throw unauthorized('E-mail ou senha inválidos.');
  }

  const token = jwt.sign({}, config.jwtSecret, {
    subject: String(user.id),
    expiresIn: config.jwtExpiresIn,
    algorithm: 'HS256',
  });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
}

export async function getUserFromToken(token) {
  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
  } catch {
    return null;
  }

  const id = Number(payload.sub);
  if (!Number.isInteger(id)) return null;

  return prisma.user.findUnique({ where: { id }, select: publicUserSelect });
}
