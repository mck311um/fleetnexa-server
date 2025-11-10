import express from 'express';
import controller from './email.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.post('/', controller.setupTemplates);
router.post('/booking/documents', auth, controller.sendBookingDocumentsEmail);

export default router;
