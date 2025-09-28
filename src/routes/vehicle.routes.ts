import express from 'express';
import controller from '../controllers/vehicle.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', auth, controller.addVehicle);

router.put('/', auth, controller.updateVehicle);

router.delete('/:id', auth, controller.deleteVehicle);

export default router;
