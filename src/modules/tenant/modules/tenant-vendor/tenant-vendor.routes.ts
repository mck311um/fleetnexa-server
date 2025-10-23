import express from 'express';
import controller from './tenant-vendor.controller';
import { auth } from '../../../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getTenantVendors);

router.post('/', auth, controller.addTenantVendor);

router.put('/', auth, controller.updateTenantVendor);

router.delete('/:id', auth, controller.deleteTenantVendor);

export default router;
