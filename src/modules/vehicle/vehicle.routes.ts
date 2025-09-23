import express from 'express';
import controller from './vehicle.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getAllTenantVehicles);

export default router;
