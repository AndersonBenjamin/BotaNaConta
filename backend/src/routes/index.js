import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';
import * as categoryController from '../controllers/categoryController.js';
import * as dashboardController from '../controllers/dashboardController.js';
import expenseRoutes from './expenseRoutes.js';

const router = Router();

// Rotas públicas
router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.post('/auth/login', authController.login);

// Daqui para baixo, todas as rotas exigem autenticação.
router.use(requireAuth);

router.get('/me', authController.me);
router.get('/categories', categoryController.list);
router.get('/dashboard', dashboardController.show);
router.use('/expenses', expenseRoutes);

export default router;
