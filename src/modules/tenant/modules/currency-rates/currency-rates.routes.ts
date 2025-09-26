import express from 'express';
import controller from './currency-rates.controller';
import { auth } from '../../../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getTenantCurrencyRates);

router.put('/', auth, controller.updateTenantCurrencyRate);

export default router;
