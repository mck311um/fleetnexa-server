import express from 'express';
import controller from './tenant-extra.controller';
import { auth } from '../../../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getTenantExtras);

export default router;
