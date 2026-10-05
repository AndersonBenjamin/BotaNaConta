import { formatCents } from '../utils/money.js';

// "R$ 2.348" em destaque e ",90" menor.
export default function Money({ cents, showCents = true }) {
  const text = formatCents(showCents ? cents : Math.round(cents / 100) * 100);
  const comma = text.lastIndexOf(',');
  return (
    <span className="money">
      {text.slice(0, comma)}
      {showCents && <span className="money__cents">{text.slice(comma)}</span>}
    </span>
  );
}
