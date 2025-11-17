import express from 'express';
import controller from './customer.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getCustomers);
router.get('/:id', auth, controller.getCustomerById);

router.post('/', auth, controller.createCustomer);

router.put('/', auth, controller.updateCustomer);

router.delete('/:id', auth, controller.deleteCustomer);

export default router;
