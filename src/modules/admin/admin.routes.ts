import express from 'express';
import controller from './admin.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/', controller.getAdminData);

export default router;
