import { addDays } from './dates.js';

const MONTHS = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

// "2026-10" → "outubro"
export function monthName(yearMonth) {
  return MONTHS[Number(yearMonth.slice(5, 7)) - 1];
}

// Cabeçalho dos grupos da lista: "Hoje", "Ontem", "02 OUT" ou "02 OUT 2025".
export function formatDayHeader(day, reference) {
  if (day === reference) return 'Hoje';
  if (day === addDays(reference, -1)) return 'Ontem';

  const [year, month, date] = day.split('-');
  const label = `${date} ${MONTHS[Number(month) - 1].slice(0, 3).toUpperCase()}`;
  return year === reference.slice(0, 4) ? label : `${label} ${year}`;
}

export function firstName(name = '') {
  return name.trim().split(/\s+/)[0];
}

// Data curta usada nas listas: "hoje", "ontem", "03 out" ou "03 out 2025".
export function formatShortDay(day, reference) {
  if (day === reference) return 'hoje';
  if (day === addDays(reference, -1)) return 'ontem';

  const [year, month, date] = day.split('-');
  const label = `${date} ${MONTHS[Number(month) - 1].slice(0, 3)}`;
  return year === reference.slice(0, 4) ? label : `${label} ${year}`;
}

// "2026-10" → "Outubro de 2026"
export function monthYear(yearMonth) {
  const name = monthName(yearMonth);
  return `${name[0].toUpperCase()}${name.slice(1)} de ${yearMonth.slice(0, 4)}`;
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}
