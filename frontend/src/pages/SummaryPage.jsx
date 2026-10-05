import { Link } from 'react-router';
import { useFetch } from '../hooks/useFetch.js';
import { getDashboard } from '../services/expenses.js';
import { formatMoney, toCents } from '../utils/money.js';
import { monthYear } from '../utils/format.js';
import Loading from '../components/Loading.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Icon, { CategoryIcon } from '../components/Icon.jsx';
import Money from '../components/Money.jsx';

export default function SummaryPage() {
  const { data, error, loading, reload } = useFetch(getDashboard, []);

  const totalCents = data ? toCents(data.totalMonth) : 0;

  return (
    <>
      <header className="page-header">
        <div className="page-header__titles">
          <span className="page-header__eyebrow">Resumo</span>
          <h1>Por categoria</h1>
          <span className="page-header__subtitle">{data ? monthYear(data.month) : ' '}</span>
        </div>
      </header>

      {error && <ErrorState error={error} onRetry={reload} />}
      {!data && loading && <Loading />}

      {data && (
        <article className="card card--highlight">
          <div className="card__label">
            <span className="accent">
              <Icon name="trend" size={16} strokeWidth={2.2} />
            </span>
            Total do mês
          </div>
          <div className="card__value card__value--lg">
            <Money cents={totalCents} />
          </div>
        </article>
      )}

      {data && data.byCategory.length === 0 && (
        <p className="empty-state">Nenhum gasto neste mês.</p>
      )}

      {data && data.byCategory.length > 0 && (
        <ul className="tx-list">
          {data.byCategory.map((item) => {
            const share = Math.round((toCents(item.total) / totalCents) * 100);
            return (
              <li key={item.categoryId}>
                <Link to={`/gastos?categoria=${item.categoryId}`} className="tx tx--summary">
                  <span className="tx__avatar">
                    <CategoryIcon category={item} size={20} />
                  </span>
                  <span className="tx__info">
                    <span className="tx__row">
                      <span className="tx__name">{item.name}</span>
                      <span className="tx__value">{formatMoney(item.total)}</span>
                    </span>
                    <span className="progress" aria-hidden="true">
                      <span className="progress__bar" style={{ width: `${share}%` }} />
                    </span>
                    <span className="tx__meta">{share}% do total</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
