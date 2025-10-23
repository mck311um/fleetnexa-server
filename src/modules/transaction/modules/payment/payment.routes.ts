import express from 'express';
import controller from './payment.controller';
import { auth } from '../../../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getPayments);

router.post('/', auth, controller.createPayment);

router.put('/', auth, controller.updatePayment);

router.delete('/:id', auth, controller.deletePayment);

export default router;
