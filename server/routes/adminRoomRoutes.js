import { Router } from 'express';
import Room from '../models/Room.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/manage', protect, requireAdmin, asyncHandler(async (_req, res) => {
  const rooms = await Room.find().sort({ isActive: -1, updatedAt: -1 }).limit(300).lean();
  res.json({ rooms });
}));
export default router;
