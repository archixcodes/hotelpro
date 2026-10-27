import { Router } from 'express';
import { cancelBooking, createBooking, getAllBookings, getMyBookings } from '../controllers/bookingController.js';
import { protect, requireAdmin, requireCustomer } from '../middleware/authMiddleware.js';

const router = Router();
router.use(protect);
router.post('/', requireCustomer, createBooking);
router.get('/mine', requireCustomer, getMyBookings);
router.get('/', requireAdmin, getAllBookings);
router.patch('/:id/cancel', requireCustomer, cancelBooking);
export default router;
