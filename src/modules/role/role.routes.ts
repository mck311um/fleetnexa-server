import express from 'express';
import controller from './role.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getUserRole);

export default router;
