import { config } from '../config.js';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Data de hoje (YYYY-MM-DD) no fuso da aplicação, e não no fuso do servidor.
export function today() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: config.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

// Colunas DATE do Postgres chegam ao Prisma como meia-noite UTC.
export function toDbDate(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function fromDbDate(date) {
  return date.toISOString().slice(0, 10);
}

// Rejeita formatos errados e datas inexistentes, como 2026-02-30.
export function isValidDate(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) return false;
  const date = toDbDate(value);
  return !Number.isNaN(date.getTime()) && fromDbDate(date) === value;
}

// Intervalo do mês que contém o dia informado: início inclusivo, fim exclusivo.
export function monthRange(day) {
  const [year, month] = day.split('-').map(Number);
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  };
}
