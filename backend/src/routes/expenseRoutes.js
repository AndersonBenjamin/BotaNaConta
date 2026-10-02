import { Router } from 'express';
import * as expenseController from '../controllers/expenseController.js';

const router = Router();

router.get('/', expenseController.list);
router.post('/', expenseController.create);
router.get('/:id', expenseController.show);
router.put('/:id', expenseController.update);
router.delete('/:id', expenseController.remove);

export default router;
