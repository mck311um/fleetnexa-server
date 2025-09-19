import express from 'express';
import controller from '../controllers/tenant.controller';
import { auth } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/locations', auth, controller.getTenantLocations);
router.get('/services', auth, controller.getServices);
router.get('/equipment', auth, controller.getEquipment);
router.get('/insurance', auth, controller.getInsurance);
router.get('/extras', auth, controller.getTenantExtras);
router.get('/activity', auth, controller.getTenantRentalActivity);
router.get('/reminders', auth, controller.getTenantReminders);
router.get('/roles', auth, controller.getTenantRoles);
router.get('/currency-rates', auth, controller.getTenantCurrencyRates);
router.get('/notifications', auth, controller.getTenantNotifications);
router.get('/roles/:id', auth, controller.getTenantRolesById);
router.get('/:id', auth, controller.getTenantById);

// router.post('/', controller.createTenant);
router.post('/location', auth, controller.createTenantLocation);
router.post('/location/initialize', auth, controller.initializeTenantLocations);
router.post('/service', auth, controller.addService);
router.post('/equipment', auth, controller.addEquipment);
router.post('/insurance', auth, controller.addInsurance);
router.post('/role', auth, controller.addTenantRole);
router.post('/reminder', auth, controller.addTenantReminder);

router.put('/location', auth, controller.updateTenantLocation);
router.put('/service', auth, controller.updateService);
router.put('/equipment', auth, controller.updateEquipment);
router.put('/insurance', auth, controller.updateInsurance);
router.put('/roles/permissions', auth, controller.assignPermissionsToRole);
router.put('/role/:id', auth, controller.updateTenantRole);
router.put('/currency-rate', auth, controller.updateTenantCurrencyRate);

router.patch('/reminder/:id', auth, controller.updateTenantReminder);
router.patch(
  '/notifications/read',
  auth,
  controller.markAllNotificationsAsRead,
);
router.patch('/notification/:id', auth, controller.markNotificationAsRead);

router.delete('/location/:id', auth, controller.deleteTenantLocation);
router.delete('/service/:id', auth, controller.deleteService);
router.delete('/equipment/:id', auth, controller.deleteEquipment);
router.delete('/insurance/:id', auth, controller.deleteInsurance);
router.delete('/role/:id', auth, controller.markNotificationAsRead);
router.delete('/notification/:id', auth, controller.deleteNotification);

export default router;
