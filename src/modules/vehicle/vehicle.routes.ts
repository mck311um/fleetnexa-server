import express from 'express';
import controller from './vehicle.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getAllTenantVehicles);
router.get('/plate/:plate', auth, controller.getVehicleByLicensePlate);
router.get('/:id', auth, controller.getVehicleById);

router.post('/', auth, controller.addVehicle);

router.put('/', auth, controller.updateVehicle);

router.patch('/status', auth, controller.updateVehicleStatus);
router.patch('/:id/storefront', auth, controller.updateVehicleStorefrontStatus);

router.delete('/:id', auth, controller.deleteVehicle);

export default router;
