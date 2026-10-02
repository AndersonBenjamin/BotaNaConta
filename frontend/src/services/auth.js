import { api } from './api.js';

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password }, { skipAuthHandler: true });
  return data;
}

export async function getMe() {
  const { data } = await api.get('/me');
  return data;
}
