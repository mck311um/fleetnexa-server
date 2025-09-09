import express from 'express';
import controller from '../controllers/twillio.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

router.post(
  '/whatsapp/notification',
  auth,
  controller.sendWhatsAppNotification,
);
router.post('/send-documents', auth, controller.sendDocuments);

export default router;
