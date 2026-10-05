import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useCategories } from '../hooks/useCategories.js';
import { getDashboard } from '../services/expenses.js';
import { formatCents, toCents } from '../utils/money.js';
import { firstName, greeting, monthName, monthYear } from '../utils/format.js';
import { today } from '../utils/dates.js';
import ExpenseList from '../components/ExpenseList.jsx';
import Loading from '../components/Loading.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Icon, { CategoryIcon } from '../components/Icon.jsx';
import Money from '../components/Money.jsx';
import Sparkline from '../components/Sparkline.jsx';

const SHORTCUTS = 4;

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { data, error, loading, reload } = useFetch(getDashboard, []);
  const categories = useCategories();

  return (
    <>
      <header className="page-header">
        <div className="page-header__titles">
          <span className="page-header__eyebrow">
            {greeting()}, {firstName(user.name)}
          </span>
          <h1>Meus Gastos</h1>
          <span className="page-header__subtitle">{monthYear((data?.today ?? today()).slice(0, 7))}</span>
        </div>
        <div className="page-header__actions">
          <button type="button" className="icon-button" onClick={logout} aria-label="Sair">
            <Icon name="logout" size={20} />
          </button>
          <Link to="/novo" className="icon-button icon-button--accent" aria-label="Novo gasto">
            <Icon name="plus" strokeWidth={2.4} />
          </Link>
        </div>
      </header>

      {error && <ErrorState error={error} onRetry={reload} />}
      {!data && loading && <Loading />}

      {data && (
        <>
          <Shortcuts byCategory={data.byCategory} categories={categories.data ?? []} />
          <SummaryCards data={data} />

          <section className="section" aria-labelledby="recent-title">
            <div className="section__header">
              <h2 id="recent-title">Últimos gastos</h2>
              {data.recentExpenses.length > 0 && <Link to="/gastos">Ver todos</Link>}
            </div>

            {data.recentExpenses.length > 0 ? (
              <ExpenseList expenses={data.recentExpenses} grouped={false} />
            ) : (
              <p className="empty-state">Nenhum gasto registrado ainda.</p>
            )}
          </section>
        </>
      )}
    </>
  );
}

// As categorias com mais gastos no mês, completadas pela ordem padrão. Abrem a lista filtrada.
function Shortcuts({ byCategory, categories }) {
  const top = byCategory.map((item) => ({ id: item.categoryId, name: item.name, icon: item.icon }));
  const rest = categories.filter((category) => !top.some((item) => item.id === category.id));
  const shortcuts = [...top, ...rest].slice(0, SHORTCUTS);

  if (shortcuts.length === 0) return null;

  return (
    <nav className="cats cats--row" aria-label="Gastos por categoria">
      {shortcuts.map((category) => (
        <Link key={category.id} to={`/gastos?categoria=${category.id}`} className="cat">
          <CategoryIcon category={category} />
          <span className="cat__label">{category.name}</span>
        </Link>
      ))}
    </nav>
  );
}

function SummaryCards({ data }) {
  const [year, month, day] = data.today.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthCents = toCents(data.totalMonth);
  const todayCents = toCents(data.totalToday);

  // Gasto de cada dia do mês até hoje, para o mini-gráfico.
  const totalsByDay = new Map(data.byDay.map((item) => [item.date, toCents(item.total)]));
  const daily = Array.from({ length: day }, (_, index) =>
    totalsByDay.get(`${data.today.slice(0, 8)}${String(index + 1).padStart(2, '0')}`) ?? 0,
  );

  const averageCents = Math.round(monthCents / day);
  const todayShare = monthCents ? Math.round((todayCents / monthCents) * 100) : 0;
  const top = data.byCategory[0];
  const topShare = top ? Math.round((toCents(top.total) / monthCents) * 100) : 0;

  return (
    <section className="summary-grid" aria-label="Resumo do mês">
      <article className="card card--chart">
        <div className="card__label">
          <span className="accent">
            <Icon name="trend" size={16} strokeWidth={2.2} />
          </span>
          Gasto no mês
        </div>
        <div className="card__value">
          <Money cents={monthCents} />
        </div>
        <span className="card__hint">até hoje, dia {day}</span>
        <Sparkline points={daily} />
      </article>

      <article className="card card--highlight">
        <div className="card__label">
          <span className="accent">
            <Icon name="calendar" size={16} strokeWidth={2.2} />
          </span>
          Hoje
        </div>
        <div className="card__value">
          <Money cents={todayCents} />
        </div>
        <span className="pill">{todayShare}% do mês</span>
        <span className="card__hint">do total de {monthName(data.month)}</span>
      </article>

      <article className="card">
        <div className="card__label">
          <Icon name="wallet" size={16} />
          Maior categoria
        </div>
        <div className="card__value">{top ? <Money cents={toCents(top.total)} showCents={false} /> : '—'}</div>
        <div
          className="progress"
          role="progressbar"
          aria-valuenow={topShare}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Parte do total do mês"
        >
          <div className="progress__bar" style={{ width: `${topShare}%` }} />
        </div>
        <span className="card__status">{top ? `${top.name} · ${topShare}%` : 'Nenhum gasto'}</span>
      </article>

      <article className="card">
        <div className="card__label">
          <Icon name="clock" size={16} />
          Média por dia
        </div>
        <div className="card__value">
          <Money cents={averageCents} />
        </div>
        <span className="card__hint card__hint--lg">
          em {day} {day === 1 ? 'dia' : 'dias'}
        </span>
        <span className="card__status card__status--warn">
          Projeção: {formatCents(averageCents * daysInMonth)}
        </span>
      </article>
    </section>
  );
}
