import express from 'express';
import controller from './damage.controller';
import { auth } from '../../../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getVehicleDamages);

router.post('/', auth, controller.addVehicleDamage);

router.put('/:id', auth, controller.updateVehicleDamage);

router.delete('/:id', auth, controller.deleteVehicleDamage);

export default router;
