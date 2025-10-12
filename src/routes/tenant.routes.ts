import express from 'express';
import controller from '../controllers/tenant.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/reminders', auth, controller.getTenantReminders);
router.get('/notifications', auth, controller.getTenantNotifications);

router.post('/reminder', auth, controller.addTenantReminder);

router.patch('/reminder/:id', auth, controller.updateTenantReminder);
router.patch(
  '/notifications/read',
  auth,
  controller.markAllNotificationsAsRead,
);
router.patch('/notification/:id', auth, controller.markNotificationAsRead);

router.delete('/role/:id', auth, controller.markNotificationAsRead);
router.delete('/notification/:id', auth, controller.deleteNotification);

export default router;
