import express from 'express';
import controller from './customer.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/violations', auth, controller.getCustomerViolations);
router.get('/violation/:id', auth, controller.getCustomerViolationById);

router.post('/violation', auth, controller.addCustomerViolation);

router.put('/violation', auth, controller.updateCustomerViolation);

router.delete('/violation/:id', auth, controller.deleteCustomerViolation);

export default router;
