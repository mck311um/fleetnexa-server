import express from 'express';
import controller from './tenant-location.controller';
import { auth } from '../../../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getAllLocations);

router.post('/', auth, controller.addTenantLocation);
router.post('/:id', auth, controller.initializeTenantLocations);

router.put('/', auth, controller.updateTenantLocation);

router.delete('/:id', auth, controller.deleteTenantLocation);

export default router;
