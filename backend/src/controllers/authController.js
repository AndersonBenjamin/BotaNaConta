import * as authService from '../services/authService.js';
import { validateLogin } from '../utils/validation.js';

export async function login(req, res) {
  const result = await authService.login(validateLogin(req.body));
  res.json(result);
}

export function me(req, res) {
  res.json(req.user);
}
