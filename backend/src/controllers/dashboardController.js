import { getDashboard } from '../services/dashboardService.js';

export async function show(req, res) {
  res.json(await getDashboard(req.user.id));
}
