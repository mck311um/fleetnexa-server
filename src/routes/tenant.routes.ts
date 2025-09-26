import express from 'express';
import controller from '../controllers/tenant.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/activity', auth, controller.getTenantRentalActivity);
router.get('/reminders', auth, controller.getTenantReminders);
router.get('/roles', auth, controller.getTenantRoles);
router.get('/notifications', auth, controller.getTenantNotifications);
router.get('/roles/:id', auth, controller.getTenantRolesById);

router.post('/role', auth, controller.addTenantRole);
router.post('/reminder', auth, controller.addTenantReminder);

router.put('/roles/permissions', auth, controller.assignPermissionsToRole);
router.put('/role/:id', auth, controller.updateTenantRole);

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
