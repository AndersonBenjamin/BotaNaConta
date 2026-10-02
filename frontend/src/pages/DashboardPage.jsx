import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { getDashboard } from '../services/expenses.js';
import { formatMoney } from '../utils/money.js';
import { firstName, monthName } from '../utils/format.js';
import ExpenseList from '../components/ExpenseList.jsx';
import Loading from '../components/Loading.jsx';
import ErrorState from '../components/ErrorState.jsx';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { data, error, loading, reload } = useFetch(getDashboard, []);

  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-header__eyebrow">{data ? monthName(data.month) : ' '}</p>
          <h1>Olá, {firstName(user.name)}</h1>
        </div>
        <button type="button" className="button button--ghost" onClick={logout}>
          Sair
        </button>
      </header>

      {error && <ErrorState error={error} onRetry={reload} />}
      {!data && loading && <Loading />}

      {data && (
        <>
          <div className="stats">
            <div className="card stat">
              <span className="stat__label">Hoje</span>
              <strong className="stat__value">{formatMoney(data.totalToday)}</strong>
            </div>
            <div className="card stat stat--highlight">
              <span className="stat__label">Este mês</span>
              <strong className="stat__value">{formatMoney(data.totalMonth)}</strong>
            </div>
          </div>

          <Link to="/novo" className="button button--primary button--block button--large">
            + Novo gasto
          </Link>

          <section className="section">
            <div className="section__header">
              <h2>Gastos recentes</h2>
              {data.recentExpenses.length > 0 && <Link to="/gastos">Ver todos</Link>}
            </div>

            {data.recentExpenses.length > 0 ? (
              <ExpenseList expenses={data.recentExpenses} />
            ) : (
              <p className="empty-state">Nenhum gasto registrado ainda.</p>
            )}
          </section>
        </>
      )}
    </>
  );
}
