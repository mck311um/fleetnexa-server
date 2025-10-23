import express from 'express';
import controller from './storage.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.post('/', auth, controller.uploadFile);
router.post('/multiple', auth, controller.uploadMultipleFiles);

export default router;
