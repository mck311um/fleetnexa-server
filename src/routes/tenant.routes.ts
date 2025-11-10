import express from 'express';
import controller from '../controllers/tenant.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/reminders', auth, controller.getTenantReminders);

router.post('/reminder', auth, controller.addTenantReminder);

router.patch('/reminder/:id', auth, controller.updateTenantReminder);

export default router;
