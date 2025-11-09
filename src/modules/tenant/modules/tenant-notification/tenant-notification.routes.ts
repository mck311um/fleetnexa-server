import express from 'express';
import controller from './tenant-notification.controller';
import { auth } from '../../../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getNotifications);

router.post('/', auth, controller.markAllNotificationsAsRead);
router.post('/:id', auth, controller.markNotificationAsRead);

router.delete('/:id', auth, controller.deleteNotification);

export default router;
