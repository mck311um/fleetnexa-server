import express from 'express';
import controller from './booking.controller';
import { auth } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/', auth, controller.getBookings);
router.get('/code/:bookingCode', auth, controller.getBookingByCode);
router.get('/:id', auth, controller.getBookingById);

router.post('/', auth, controller.createSystemBooking);
router.post('/confirm', auth, controller.confirmBooking);
router.post('/decline/:id', auth, controller.declineBooking);
router.post('/cancel/:id', auth, controller.cancelBooking);
router.post('/start', auth, controller.startBooking);
router.post('/end', auth, controller.endBooking);
router.post('/invoice/:id', auth, controller.generateInvoice);
router.post('/agreement/:id', auth, controller.generateBookingAgreement);

router.put('/:id', auth, controller.updateBooking);

router.delete('/:id', auth, controller.deleteBooking);

export default router;
