import express from 'express';
import controller from './tenant-activity.controller';
import { auth } from '../../../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getTenantActivities);

export default router;
