import express from 'express';
import controller from './transaction.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getTransactions);

export default router;
