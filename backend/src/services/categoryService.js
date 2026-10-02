import { prisma } from '../utils/prisma.js';

export const categorySelect = { id: true, name: true, icon: true };

export function listCategories() {
  return prisma.category.findMany({ select: categorySelect, orderBy: { id: 'asc' } });
}
