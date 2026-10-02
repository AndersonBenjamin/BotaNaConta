import { prisma } from '../utils/prisma.js';
import { monthRange, toDbDate, today } from '../utils/dates.js';
import { categorySelect } from './categoryService.js';
import { expenseInclude, expenseOrder, formatMoney, serializeExpense } from './expenseService.js';

const RECENT_LIMIT = 10;

export async function getDashboard(userId) {
  const day = today();
  const { start, end } = monthRange(day);
  const monthWhere = { userId, date: { gte: start, lt: end } };

  const [todaySum, monthSum, recent, byCategory, categories] = await Promise.all([
    prisma.expense.aggregate({
      where: { userId, date: toDbDate(day) },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({ where: monthWhere, _sum: { amount: true } }),
    prisma.expense.findMany({
      where: { userId },
      include: expenseInclude,
      orderBy: expenseOrder,
      take: RECENT_LIMIT,
    }),
    prisma.expense.groupBy({
      by: ['categoryId'],
      where: monthWhere,
      _sum: { amount: true },
    }),
    prisma.category.findMany({ select: categorySelect }),
  ]);

  const categoriesById = new Map(categories.map((category) => [category.id, category]));

  return {
    today: day,
    month: day.slice(0, 7),
    totalToday: formatMoney(todaySum._sum.amount),
    totalMonth: formatMoney(monthSum._sum.amount),
    recentExpenses: recent.map(serializeExpense),
    byCategory: byCategory
      .sort((a, b) => b._sum.amount.comparedTo(a._sum.amount))
      .map((group) => {
        const category = categoriesById.get(group.categoryId);
        return {
          categoryId: group.categoryId,
          name: category.name,
          icon: category.icon,
          total: formatMoney(group._sum.amount),
        };
      }),
  };
}
