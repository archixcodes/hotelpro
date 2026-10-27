import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import RoomNight from '../models/RoomNight.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { nightsBetween, occupiedNights, parseDateOnly } from '../utils/dates.js';

export const createBooking = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const { roomId, guests } = body;
  if (!mongoose.isValidObjectId(roomId)) throw new HttpError(400, 'Choose a valid room.', 'INVALID_ID');
  const checkIn = parseDateOnly(body.checkIn, 'checkIn');
  const checkOut = parseDateOnly(body.checkOut, 'checkOut');
  const nights = nightsBetween(checkIn, checkOut);
  if (nights < 1) throw new HttpError(400, 'Check-out must be after check-in.', 'INVALID_DATES');
  if (nights > 90) throw new HttpError(400, 'A stay can be at most 90 nights.', 'INVALID_DATES');
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (checkIn < today) throw new HttpError(400, 'Check-in cannot be in the past.', 'INVALID_DATES');
  if (!Number.isInteger(guests) || guests < 1 || guests > 20) throw new HttpError(400, 'Guests must be a whole number between 1 and 20.', 'INVALID_INPUT');

  const room = await Room.findOne({ _id: roomId, isActive: true });
  if (!room) throw new HttpError(404, 'Room not found.', 'NOT_FOUND');
  if (guests > room.capacity) throw new HttpError(400, 'This room accommodates up to ' + room.capacity + ' guests.', 'CAPACITY_EXCEEDED');

  const bookingId = new mongoose.Types.ObjectId();
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const booking = new Booking({
        _id: bookingId, customer: req.user.id, room: room._id, checkIn, checkOut, guests, nights,
        totalPrice: room.pricePerNight * nights
      });
      await booking.save({ session });
      // Claims cover [checkIn, checkOut). A collision on any night aborts every write in this transaction.
      await RoomNight.insertMany(
        occupiedNights(checkIn, checkOut).map((night) => ({ room: room._id, night, booking: bookingId })),
        { session, ordered: true }
      );
    }, { readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } });
  } finally {
    await session.endSession();
  }
  const booking = await Booking.findById(bookingId).populate('room', 'name type imageUrl').lean();
  res.status(201).json({ booking });
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ customer: req.user.id })
    .populate('room', 'name type imageUrl pricePerNight').sort({ createdAt: -1 }).limit(100).lean();
  res.json({ bookings });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(400, 'Booking identifier is invalid.', 'INVALID_ID');
  const session = await mongoose.startSession();
  let booking;
  try {
    await session.withTransaction(async () => {
      booking = await Booking.findOne({ _id: req.params.id, customer: req.user.id }).session(session);
      if (!booking) throw new HttpError(404, 'Booking not found.', 'NOT_FOUND');
      if (booking.status !== 'confirmed') throw new HttpError(409, 'This booking has already been cancelled.', 'ALREADY_CANCELLED');
      if (booking.checkIn <= new Date()) throw new HttpError(409, 'Bookings cannot be cancelled after check-in has started.', 'CANCELLATION_CLOSED');
      booking.status = 'cancelled';
      await booking.save({ session });
      await RoomNight.deleteMany({ booking: booking._id }, { session });
    }, { writeConcern: { w: 'majority' } });
  } finally {
    await session.endSession();
  }
  res.json({ booking });
});

export const getAllBookings = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status && ['confirmed', 'cancelled'].includes(req.query.status)) filter.status = req.query.status;
  const bookings = await Booking.find(filter)
    .populate('customer', 'name email').populate('room', 'name type')
    .sort({ createdAt: -1 }).limit(300).lean();
  res.json({ bookings });
});
