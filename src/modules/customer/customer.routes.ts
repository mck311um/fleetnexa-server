import express from 'express';
import controller from './customer.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/violations', auth, controller.getCustomerViolations);

export default router;
