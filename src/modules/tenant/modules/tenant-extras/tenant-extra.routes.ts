import express from 'express';
import controller from './tenant-extra.controller';
import { auth } from '../../../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getTenantExtras);

router.post('/', auth, controller.addTenantExtra);

router.put('/', auth, controller.updateTenantExtra);

router.delete('/service/:id', auth, controller.deleteTenantService);
router.delete('/equipment/:id', auth, controller.deleteTenantEquipment);
router.delete('/insurance/:id', auth, controller.deleteTenantInsurance);

export default router;
