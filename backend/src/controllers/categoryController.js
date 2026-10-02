import { listCategories } from '../services/categoryService.js';

export async function list(req, res) {
  res.json(await listCategories());
}
