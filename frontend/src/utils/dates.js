// Mesmo fuso usado pela API para calcular "hoje" e "este mês".
const TIME_ZONE = 'America/Sao_Paulo';

const pad = (number) => String(number).padStart(2, '0');

const toUtcDate = (day) => new Date(`${day}T00:00:00Z`);

const toDay = (date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

export function today() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function addDays(day, amount) {
  const date = toUtcDate(day);
  date.setUTCDate(date.getUTCDate() + amount);
  return toDay(date);
}

export const PERIODS = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'semana', label: 'Esta semana' },
  { id: 'mes', label: 'Este mês' },
  { id: 'mes-anterior', label: 'Mês anterior' },
];

// Intervalo { startDate, endDate } de cada período, com as duas pontas inclusas.
// A semana vai de segunda a domingo.
export function periodRange(periodId, reference = today()) {
  const [year, month] = reference.split('-').map(Number);

  switch (periodId) {
    case 'hoje':
      return { startDate: reference, endDate: reference };
    case 'semana': {
      const daysSinceMonday = (toUtcDate(reference).getUTCDay() + 6) % 7;
      const monday = addDays(reference, -daysSinceMonday);
      return { startDate: monday, endDate: addDays(monday, 6) };
    }
    case 'mes-anterior':
      return {
        startDate: toDay(new Date(Date.UTC(year, month - 2, 1))),
        endDate: toDay(new Date(Date.UTC(year, month - 1, 0))),
      };
    case 'mes':
    default:
      return {
        startDate: toDay(new Date(Date.UTC(year, month - 1, 1))),
        endDate: toDay(new Date(Date.UTC(year, month, 0))),
      };
  }
}
