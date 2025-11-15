import express from 'express';
import controller from './storefront.controller';
import { storefrontAuth } from '../../../../middleware/storefront.middleware';

const router = express.Router();

router.get('/me', storefrontAuth, controller.getCurrentUser);
router.get('/bookings', storefrontAuth, controller.getPreviousBookings);

router.put('/', storefrontAuth, controller.updateUser);

router.patch('/change-password', storefrontAuth, controller.changePassword);

router.delete('/', storefrontAuth, controller.deleteUser);

export default router;
