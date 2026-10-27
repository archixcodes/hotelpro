import User from '../models/User.js';
import { issueToken } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function sendAuth(res, user, status) {
  res.status(status || 200).json({ token: issueToken(user), user: user.toSafeJSON() });
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
    throw new HttpError(400, 'Name must be between 2 and 80 characters.', 'INVALID_INPUT');
  }
  if (typeof email !== 'string' || !emailPattern.test(email.trim()) || email.length > 254) {
    throw new HttpError(400, 'Enter a valid email address.', 'INVALID_INPUT');
  }
  if (typeof password !== 'string' || password.length < 10 || password.length > 128) {
    throw new HttpError(400, 'Password must be between 10 and 128 characters.', 'INVALID_INPUT');
  }
  // Public sign-up always creates a customer, even if a client submits a role field.
  const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), password, role: 'customer' });
  sendAuth(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new HttpError(400, 'Email and password are required.', 'INVALID_INPUT');
  }
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password +tokenVersion');
  if (!user || !user.isActive || !(await user.comparePassword(password))) {
    throw new HttpError(401, 'Email or password is incorrect.', 'INVALID_CREDENTIALS');
  }
  sendAuth(res, user);
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});
