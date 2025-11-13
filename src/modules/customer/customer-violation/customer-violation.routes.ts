import express from 'express';
import controller from './customer-violation.controller';
import { auth } from '../../../middleware/auth.middleware';

const router = express.Router();

router.get('', auth, controller.getCustomerViolations);
router.get('/:id', auth, controller.getCustomerViolationById);

router.post('/', auth, controller.addCustomerViolation);

router.put('/', auth, controller.updateCustomerViolation);

router.delete('/:id', auth, controller.deleteCustomerViolation);

export default router;
