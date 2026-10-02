import { Link } from 'react-router';
import { formatMoney } from '../utils/money.js';
import { formatDayHeader } from '../utils/format.js';
import { today } from '../utils/dates.js';

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

export default function ExpenseList({ expenses }) {
  const reference = today();

  return (
    <div className="expense-groups">
      {groupByDay(expenses).map((group) => (
        <section key={group.date} className="expense-group">
          <h3 className="expense-group__title">{formatDayHeader(group.date, reference)}</h3>
          <ul className="card expense-list">
            {group.items.map((expense) => (
              <li key={expense.id}>
                <ExpenseItem expense={expense} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ExpenseItem({ expense }) {
  const { category, description } = expense;

  return (
    <Link to={`/gastos/${expense.id}`} className="expense-item">
      <span className="expense-item__icon" aria-hidden="true">{category.icon}</span>
      <span className="expense-item__text">
        <span className="expense-item__title">{description || category.name}</span>
        {description && <span className="expense-item__subtitle">{category.name}</span>}
      </span>
      <span className="expense-item__amount">{formatMoney(expense.amount)}</span>
    </Link>
  );
}
