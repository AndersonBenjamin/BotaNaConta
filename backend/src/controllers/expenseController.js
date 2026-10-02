import * as expenseService from '../services/expenseService.js';
import {
  parseIdParam,
  validateExpense,
  validateExpenseFilters,
} from '../utils/validation.js';

export async function list(req, res) {
  const filters = validateExpenseFilters(req.query);
  res.json(await expenseService.listExpenses(req.user.id, filters));
}

export async function show(req, res) {
  const id = parseIdParam(req.params.id);
  res.json(await expenseService.getExpense(req.user.id, id));
}

export async function create(req, res) {
  const data = validateExpense(req.body, { requireDate: false });
  res.status(201).json(await expenseService.createExpense(req.user.id, data));
}

export async function update(req, res) {
  const id = parseIdParam(req.params.id);
  const data = validateExpense(req.body, { requireDate: true });
  res.json(await expenseService.updateExpense(req.user.id, id, data));
}

export async function remove(req, res) {
  const id = parseIdParam(req.params.id);
  await expenseService.deleteExpense(req.user.id, id);
  res.status(204).end();
}
