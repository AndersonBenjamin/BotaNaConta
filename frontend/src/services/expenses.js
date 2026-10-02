import { api } from './api.js';

export async function getCategories() {
  const { data } = await api.get('/categories');
  return data;
}

export async function getDashboard() {
  const { data } = await api.get('/dashboard');
  return data;
}

export async function listExpenses(filters) {
  const { data } = await api.get('/expenses', { params: filters });
  return data;
}

export async function getExpense(id) {
  const { data } = await api.get(`/expenses/${id}`);
  return data;
}

export async function createExpense(expense) {
  const { data } = await api.post('/expenses', expense);
  return data;
}

export async function updateExpense(id, expense) {
  const { data } = await api.put(`/expenses/${id}`, expense);
  return data;
}

export async function deleteExpense(id) {
  await api.delete(`/expenses/${id}`);
}
