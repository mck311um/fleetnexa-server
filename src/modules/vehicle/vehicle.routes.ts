import express from 'express';
import controller from './vehicle.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getAllTenantVehicles);
router.get('/plate/:plate', auth, controller.getVehicleByLicensePlate);
router.get('/:id', auth, controller.getVehicleById);

router.patch('/status', auth, controller.updateVehicleStatus);

export default router;
