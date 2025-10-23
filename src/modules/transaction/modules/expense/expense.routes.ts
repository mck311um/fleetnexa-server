import express from 'express';
import controller from './expense.controller';
import { auth } from '../../../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getExpenses);

router.post('/', auth, controller.createExpense);

router.put('/', auth, controller.updateExpense);

router.delete('/:id', auth, controller.deleteExpense);

export default router;
