import express from 'express';
import controller from './tenant-location.controller';
import { auth } from '../../../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getAllLocations);

export default router;
