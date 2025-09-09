import express from 'express';
import controller from './transaction.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getTransactions);

router.post('/payment', auth, controller.createPayment);

export default router;
