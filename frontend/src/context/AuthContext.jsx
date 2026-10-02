import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setUnauthorizedHandler, tokenStorage } from '../services/api.js';
import * as authService from '../services/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Com token salvo, confere na API se ele ainda vale antes de mostrar o app.
  const [status, setStatus] = useState(() => (tokenStorage.get() ? 'checking' : 'ready'));

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    if (status !== 'checking') return;
    let cancelled = false;

    authService
      .getMe()
      .then((me) => {
        if (!cancelled) setUser(me);
      })
      .catch(() => {
        // 401 já limpa o token pelo handler; outros erros levam ao login.
      })
      .finally(() => {
        if (!cancelled) setStatus('ready');
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  const login = useCallback(async (email, password) => {
    const { token, user: loggedUser } = await authService.login(email, password);
    tokenStorage.set(token);
    setUser(loggedUser);
  }, []);

  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
