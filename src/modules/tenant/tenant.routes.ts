import express from 'express';
import controller from './tenant.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.post('/', controller.createTenant);

export default router;
