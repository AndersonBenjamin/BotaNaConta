import axios from 'axios';

const TOKEN_KEY = 'botanaconta.token';

// localStorage pode lançar erro (modo privado, armazenamento bloqueado).
export const tokenStorage = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Sem armazenamento, a sessão dura até a página ser recarregada.
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Nada a limpar.
    }
  },
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

let unauthorizedHandler = null;

// O AuthContext registra aqui o que fazer quando a API responder 401 (token expirado).
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.skipAuthHandler) {
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error, fallback = 'Algo deu errado. Tente novamente.') {
  const response = error?.response;
  if (response?.data?.error) return response.data.error;
  if (response?.status === 429) return 'Muitas tentativas. Aguarde um minuto e tente novamente.';
  if (response) return fallback;
  if (error?.request) return 'Sem conexão com o servidor. Verifique sua internet.';
  return fallback;
}

// Converte os "details" da API em { campo: mensagem }.
export function getFieldErrors(error) {
  const details = error?.response?.data?.details;
  if (!Array.isArray(details)) return {};
  return Object.fromEntries(details.map((detail) => [detail.field, detail.message]));
}
