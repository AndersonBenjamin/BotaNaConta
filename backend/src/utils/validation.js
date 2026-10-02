import { badRequest } from './httpError.js';
import { isValidDate, today } from './dates.js';

// Até 99.999.999,99, que é o limite de Decimal(10, 2).
const AMOUNT_PATTERN = /^\d{1,8}(\.\d{1,2})?$/;
const MAX_DESCRIPTION_LENGTH = 255;
const MAX_INT = 2147483647;

function toPositiveInt(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !/^\d+$/.test(value.trim())) return null;
  const number = Number(value);
  return Number.isInteger(number) && number > 0 && number <= MAX_INT ? number : null;
}

function fail(errors) {
  if (errors.length > 0) {
    throw badRequest('Dados inválidos.', errors);
  }
}

export function parseIdParam(value) {
  const id = toPositiveInt(value);
  if (id === null) {
    throw badRequest('ID inválido.');
  }
  return id;
}

export function validateLogin(body) {
  const errors = [];
  const { email, password } = body ?? {};

  if (typeof email !== 'string' || !email.trim()) {
    errors.push({ field: 'email', message: 'Informe o e-mail.' });
  }
  if (typeof password !== 'string' || !password || password.length > 200) {
    errors.push({ field: 'password', message: 'Informe a senha.' });
  }
  fail(errors);

  return { email: email.trim().toLowerCase(), password };
}

// Usado no POST e no PUT. No POST a data é opcional (padrão: hoje); no PUT é obrigatória.
export function validateExpense(body, { requireDate }) {
  const errors = [];
  const data = {};
  const { amount, categoryId, description, date } = body ?? {};

  const amountText =
    typeof amount === 'number' || typeof amount === 'string' ? String(amount).trim() : '';
  if (!AMOUNT_PATTERN.test(amountText) || Number(amountText) <= 0) {
    errors.push({
      field: 'amount',
      message: 'Informe um valor maior que zero, com até 2 casas decimais.',
    });
  } else {
    data.amount = amountText;
  }

  const parsedCategoryId = toPositiveInt(categoryId);
  if (parsedCategoryId === null) {
    errors.push({ field: 'categoryId', message: 'Selecione uma categoria.' });
  } else {
    data.categoryId = parsedCategoryId;
  }

  if (description === undefined || description === null) {
    data.description = null;
  } else if (typeof description !== 'string') {
    errors.push({ field: 'description', message: 'Descrição inválida.' });
  } else if (description.trim().length > MAX_DESCRIPTION_LENGTH) {
    errors.push({
      field: 'description',
      message: `A descrição deve ter até ${MAX_DESCRIPTION_LENGTH} caracteres.`,
    });
  } else {
    data.description = description.trim() || null;
  }

  if (date === undefined && !requireDate) {
    data.date = today();
  } else if (!isValidDate(date)) {
    errors.push({ field: 'date', message: 'Informe uma data válida (AAAA-MM-DD).' });
  } else {
    data.date = date;
  }

  fail(errors);
  return data;
}

export function validateExpenseFilters(query) {
  const errors = [];
  const filters = {};
  const { startDate, endDate, categoryId } = query;

  if (startDate !== undefined) {
    if (isValidDate(startDate)) filters.startDate = startDate;
    else errors.push({ field: 'startDate', message: 'Data inicial inválida (AAAA-MM-DD).' });
  }
  if (endDate !== undefined) {
    if (isValidDate(endDate)) filters.endDate = endDate;
    else errors.push({ field: 'endDate', message: 'Data final inválida (AAAA-MM-DD).' });
  }
  if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
    errors.push({ field: 'endDate', message: 'A data final deve ser igual ou posterior à inicial.' });
  }
  if (categoryId !== undefined) {
    const parsed = toPositiveInt(categoryId);
    if (parsed === null) errors.push({ field: 'categoryId', message: 'Categoria inválida.' });
    else filters.categoryId = parsed;
  }

  fail(errors);
  return filters;
}
