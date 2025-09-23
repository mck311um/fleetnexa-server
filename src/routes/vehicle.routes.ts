import express from 'express';
import controller from '../controllers/vehicle.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/damages/:id', auth, controller.getVehicleDamages);
router.get('/:id', auth, controller.getVehicleById);

router.post('/', auth, controller.addVehicle);
router.post('/damage', auth, controller.addVehicleDamage);

router.patch('/:id/status', auth, controller.updateVehicleStatus);

router.put('/', auth, controller.updateVehicle);
router.put('/damage', auth, controller.updateVehicleDamage);

router.delete('/damage/:id', auth, controller.deleteVehicleDamage);
router.delete('/:id', auth, controller.deleteVehicle);

export default router;
