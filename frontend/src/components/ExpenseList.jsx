import { Link } from 'react-router';
import { formatMoney } from '../utils/money.js';
import { formatDayHeader, formatShortDay } from '../utils/format.js';
import { today } from '../utils/dates.js';
import { CategoryIcon } from './Icon.jsx';

// Agrupa gastos consecutivos do mesmo dia (a API já envia ordenado por data).
function groupByDay(expenses) {
  const groups = [];
  for (const expense of expenses) {
    const last = groups.at(-1);
    if (last?.date === expense.date) last.items.push(expense);
    else groups.push({ date: expense.date, items: [expense] });
  }
  return groups;
}

// Agrupada por dia (lista completa) ou corrida, com a data em cada item (início).
export default function ExpenseList({ expenses, grouped = true }) {
  const reference = today();

  if (!grouped) {
    return <ExpenseItems expenses={expenses} reference={reference} showDate />;
  }

  return (
    <div className="expense-groups">
      {groupByDay(expenses).map((group) => (
        <section key={group.date} className="expense-group">
          <h3 className="expense-group__title">{formatDayHeader(group.date, reference)}</h3>
          <ExpenseItems expenses={group.items} reference={reference} />
        </section>
      ))}
    </div>
  );
}

function ExpenseItems({ expenses, reference, showDate = false }) {
  return (
    <ul className="tx-list">
      {expenses.map((expense) => {
        const { category, description } = expense;
        const meta = [
          description && category.name,
          showDate && formatShortDay(expense.date, reference),
        ].filter(Boolean);

        return (
          <li key={expense.id}>
            <Link to={`/gastos/${expense.id}`} className="tx">
              <span className="tx__avatar">
                <CategoryIcon category={category} size={20} />
              </span>
              <span className="tx__info">
                <span className="tx__name">{description || category.name}</span>
                {meta.length > 0 && <span className="tx__meta">{meta.join(' · ')}</span>}
              </span>
              <span className="tx__value">− {formatMoney(expense.amount)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
