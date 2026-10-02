import { Link } from 'react-router';
import { useFetch } from '../hooks/useFetch.js';
import { getDashboard } from '../services/expenses.js';
import { formatMoney, toCents } from '../utils/money.js';
import { monthName } from '../utils/format.js';
import Loading from '../components/Loading.jsx';
import ErrorState from '../components/ErrorState.jsx';

export default function SummaryPage() {
  const { data, error, loading, reload } = useFetch(getDashboard, []);

  const totalCents = data ? toCents(data.totalMonth) : 0;

  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-header__eyebrow">Resumo</p>
          <h1>Gastos de {data ? monthName(data.month) : '...'}</h1>
        </div>
      </header>

      {error && <ErrorState error={error} onRetry={reload} />}
      {!data && loading && <Loading />}

      {data && data.byCategory.length === 0 && (
        <p className="empty-state">Nenhum gasto neste mês.</p>
      )}

      {data && data.byCategory.length > 0 && (
        <>
          <ul className="card summary-list">
            {data.byCategory.map((item) => {
              const share = Math.round((toCents(item.total) / totalCents) * 100);
              return (
                <li key={item.categoryId}>
                  <Link to={`/gastos?categoria=${item.categoryId}`} className="summary-item">
                    <span className="summary-item__row">
                      <span className="summary-item__name">
                        <span aria-hidden="true">{item.icon}</span> {item.name}
                      </span>
                      <span className="summary-item__total">{formatMoney(item.total)}</span>
                    </span>
                    <span className="summary-item__bar" aria-hidden="true">
                      <span style={{ width: `${share}%` }} />
                    </span>
                    <span className="visually-hidden">{share}% do total</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="card summary-total">
            <span>Total</span>
            <strong>{formatMoney(data.totalMonth)}</strong>
          </div>
        </>
      )}
    </>
  );
}
