import { useSearchParams } from 'react-router';
import { useFetch } from '../hooks/useFetch.js';
import { useCategories } from '../hooks/useCategories.js';
import { listExpenses } from '../services/expenses.js';
import { PERIODS, periodRange } from '../utils/dates.js';
import { formatCents, toCents } from '../utils/money.js';
import ExpenseList from '../components/ExpenseList.jsx';
import Loading from '../components/Loading.jsx';
import ErrorState from '../components/ErrorState.jsx';

const DEFAULT_PERIOD = 'mes';

export default function ExpensesPage() {
  // Os filtros ficam na URL para continuarem aplicados ao voltar da edição de um gasto.
  const [searchParams, setSearchParams] = useSearchParams();
  const period = PERIODS.some((p) => p.id === searchParams.get('periodo'))
    ? searchParams.get('periodo')
    : DEFAULT_PERIOD;
  const categoryId = searchParams.get('categoria') ?? '';

  const categories = useCategories();
  const { data, error, loading, reload } = useFetch(
    () => listExpenses({ ...periodRange(period), categoryId: categoryId || undefined }),
    [period, categoryId],
  );

  function setFilter(name, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(name, value);
    else next.delete(name);
    setSearchParams(next, { replace: true });
  }

  const totalCents = data?.reduce((sum, expense) => sum + toCents(expense.amount), 0) ?? 0;

  return (
    <>
      <header className="page-header">
        <h1>Gastos</h1>
      </header>

      <div className="filters">
        <div className="chips" role="group" aria-label="Período">
          {PERIODS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`chip${option.id === period ? ' is-selected' : ''}`}
              aria-pressed={option.id === period}
              onClick={() => setFilter('periodo', option.id === DEFAULT_PERIOD ? '' : option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className="visually-hidden" htmlFor="category-filter">
          Categoria
        </label>
        <select
          id="category-filter"
          value={categoryId}
          onChange={(event) => setFilter('categoria', event.target.value)}
        >
          <option value="">Todas as categorias</option>
          {categories.data?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorState error={error} onRetry={reload} />}
      {!data && loading && <Loading />}

      {data && (
        <div className={`results${loading ? ' is-refreshing' : ''}`}>
          <p className="list-summary">
            {data.length} {data.length === 1 ? 'gasto' : 'gastos'} ·{' '}
            <strong>{formatCents(totalCents)}</strong>
          </p>
          {data.length > 0 ? (
            <ExpenseList expenses={data} />
          ) : (
            <p className="empty-state">Nenhum gasto neste período.</p>
          )}
        </div>
      )}
    </>
  );
}
