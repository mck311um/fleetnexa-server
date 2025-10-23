import express from 'express';
import controller from './tenant.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getCurrentTenant);
router.get('/:id', auth, controller.getTenantById);

router.post('/', controller.createTenant);

router.put('/', auth, controller.updateTenant);

router.patch('/storefront', auth, controller.updateStorefrontSettings);

export default router;
