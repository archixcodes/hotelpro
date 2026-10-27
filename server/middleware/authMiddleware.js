import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.get('authorization');
  if (!header || !header.startsWith('Bearer ')) throw new HttpError(401, 'Sign in to continue.', 'UNAUTHORIZED');
  if (!process.env.JWT_SECRET) throw new HttpError(500, 'Authentication is not configured.');

  let payload;
  try {
    payload = jwt.verify(header.slice(7), process.env.JWT_SECRET, {
      issuer: 'hotelpro-api', audience: 'hotelpro-client'
    });
  } catch {
    throw new HttpError(401, 'Your session is invalid or has expired. Please sign in again.', 'INVALID_TOKEN');
  }
  const user = await User.findById(payload.sub).select('+tokenVersion');
  if (!user || !user.isActive || user.tokenVersion !== payload.ver) {
    throw new HttpError(401, 'Your session is no longer active.', 'INVALID_SESSION');
  }
  req.user = user;
  next();
});

export const requireAdmin = (req, _res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  next(new HttpError(403, 'Administrator access is required.', 'FORBIDDEN'));
};

export const requireCustomer = (req, _res, next) => {
  if (req.user && req.user.role === 'customer') return next();
  next(new HttpError(403, 'A customer account is required for this action.', 'FORBIDDEN'));
};

export function issueToken(user) {
  return jwt.sign(
    { sub: user.id, ver: user.tokenVersion, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d', issuer: 'hotelpro-api', audience: 'hotelpro-client' }
  );
}
