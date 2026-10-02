import { prisma } from '../utils/prisma.js';
import { badRequest, notFound } from '../utils/httpError.js';
import { fromDbDate, toDbDate } from '../utils/dates.js';
import { categorySelect } from './categoryService.js';

export const expenseInclude = { category: { select: categorySelect } };

export const expenseOrder = [{ date: 'desc' }, { createdAt: 'desc' }];

export const formatMoney = (decimal) => (decimal ? decimal.toFixed(2) : '0.00');

export function serializeExpense(expense) {
  return {
    id: expense.id,
    amount: formatMoney(expense.amount),
    description: expense.description,
    date: fromDbDate(expense.date),
    category: expense.category,
    createdAt: expense.createdAt,
    updatedAt: expense.updatedAt,
  };
}

async function ensureCategoryExists(categoryId) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });
  if (!category) {
    throw badRequest('Dados inválidos.', [
      { field: 'categoryId', message: 'Categoria não encontrada.' },
    ]);
  }
}

// Sempre filtra pelo usuário: um gasto de outro usuário é tratado como inexistente.
async function findOwnExpense(userId, id) {
  const expense = await prisma.expense.findFirst({
    where: { id, userId },
    include: expenseInclude,
  });
  if (!expense) {
    throw notFound('Gasto não encontrado.');
  }
  return expense;
}

function toDbData(data) {
  return { ...data, date: toDbDate(data.date) };
}

export async function listExpenses(userId, { startDate, endDate, categoryId }) {
  const where = { userId };
  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = toDbDate(startDate);
    if (endDate) where.date.lte = toDbDate(endDate);
  }
  if (categoryId) where.categoryId = categoryId;

  const expenses = await prisma.expense.findMany({
    where,
    include: expenseInclude,
    orderBy: expenseOrder,
  });
  return expenses.map(serializeExpense);
}

export async function getExpense(userId, id) {
  return serializeExpense(await findOwnExpense(userId, id));
}

export async function createExpense(userId, data) {
  await ensureCategoryExists(data.categoryId);
  const expense = await prisma.expense.create({
    data: { ...toDbData(data), userId },
    include: expenseInclude,
  });
  return serializeExpense(expense);
}

export async function updateExpense(userId, id, data) {
  await findOwnExpense(userId, id);
  await ensureCategoryExists(data.categoryId);
  const expense = await prisma.expense.update({
    where: { id },
    data: toDbData(data),
    include: expenseInclude,
  });
  return serializeExpense(expense);
}

export async function deleteExpense(userId, id) {
  await findOwnExpense(userId, id);
  await prisma.expense.delete({ where: { id } });
}
