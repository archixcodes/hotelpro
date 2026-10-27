import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import RoomNight from './models/RoomNight.js';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import adminRoomRoutes from './routes/adminRoomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must contain at least 32 characters.');

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '32kb' }));
app.use('/api/auth', rateLimit({ windowMs: 900000, limit: 100, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api', rateLimit({ windowMs: 900000, limit: 600, standardHeaders: 'draft-7', legacyHeaders: false }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'hotelpro-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/rooms', adminRoomRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT) || 10000;
await connectDB();
await RoomNight.createIndexes();
const server = app.listen(port, () => console.info('HotelPro API listening on port ' + port));

async function shutdown(signal) {
  console.info(signal + ' received; shutting down gracefully.');
  server.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
