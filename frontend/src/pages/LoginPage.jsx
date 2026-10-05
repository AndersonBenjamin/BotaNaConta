import { useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../services/api.js';

export default function LoginPage() {
  const { user, login } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to={location.state?.from || '/'} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <main className="login">
      <div className="login__brand">
        <span className="login__logo" aria-hidden="true">R$</span>
        <span className="page-header__eyebrow">Bem-vindo de volta</span>
        <h1>BotaNaConta</h1>
        <p>Seus gastos, anotados em segundos.</p>
      </div>

      <form className="card form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="button button--primary button--block"
          disabled={submitting || !email || !password}
        >
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
