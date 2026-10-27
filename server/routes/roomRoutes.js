import { Router } from 'express';
import { createRoom, deleteRoom, getRoom, listRooms, updateRoom } from '../controllers/roomController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();
router.get('/', listRooms);
router.get('/:id', getRoom);
router.post('/', protect, requireAdmin, createRoom);
router.patch('/:id', protect, requireAdmin, updateRoom);
router.delete('/:id', protect, requireAdmin, deleteRoom);
export default router;
