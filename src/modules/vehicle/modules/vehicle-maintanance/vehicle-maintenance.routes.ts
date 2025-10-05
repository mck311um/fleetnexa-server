import express from 'express';
import controller from './vehicle-maintenance.controller';
import { auth } from '../../../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getScheduledMaintenances);
router.get('/:id', auth, controller.getVehicleMaintenances);

router.post('/', auth, controller.addVehicleMaintenance);

router.put('/', auth, controller.updateVehicleMaintenance);

router.delete(
  '/:vehicleId/:maintenanceId',
  auth,
  controller.deleteVehicleMaintenance,
);

export default router;
