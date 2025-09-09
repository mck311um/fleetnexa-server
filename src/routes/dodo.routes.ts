import express from 'express';
import controller from '../controllers/dodo.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/invoice/:paymentId', auth, controller.getInvoice);

router.post('/payment', auth, controller.createDodoPayment);
router.post('/webhook', controller.dodoPaymentWebhook);

export default router;
