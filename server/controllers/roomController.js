import mongoose from 'mongoose';
import Room from '../models/Room.js';
import RoomNight from '../models/RoomNight.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/httpError.js';
import { parseDateOnly, occupiedNights } from '../utils/dates.js';

function validateRoomInput(body, partial) {
  body = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const required = ['name', 'type', 'description', 'pricePerNight', 'capacity'];
  if (!partial && required.some((key) => body[key] === undefined)) {
    throw new HttpError(400, 'Name, type, description, price, and capacity are required.', 'INVALID_INPUT');
  }
  const input = {};
  for (const key of ['name', 'type', 'description']) {
    if (body[key] !== undefined) {
      if (typeof body[key] !== 'string' || !body[key].trim()) throw new HttpError(400, key + ' must be a non-empty string.', 'INVALID_INPUT');
      input[key] = body[key].trim();
    }
  }
  if (body.pricePerNight !== undefined) {
    const price = Number(body.pricePerNight);
    if (!Number.isFinite(price) || price < 0 || price > 1000000) throw new HttpError(400, 'Price must be a valid non-negative amount.', 'INVALID_INPUT');
    input.pricePerNight = price;
  }
  if (body.capacity !== undefined) {
    const capacity = Number(body.capacity);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 20) throw new HttpError(400, 'Capacity must be a whole number between 1 and 20.', 'INVALID_INPUT');
    input.capacity = capacity;
  }
  if (body.amenities !== undefined) {
    if (!Array.isArray(body.amenities) || body.amenities.some((value) => typeof value !== 'string')) throw new HttpError(400, 'Amenities must be a list of text values.', 'INVALID_INPUT');
    input.amenities = [...new Set(body.amenities.map((value) => value.trim()).filter(Boolean))].slice(0, 30);
  }
  if (body.imageUrl !== undefined) {
    if (typeof body.imageUrl !== 'string' || (body.imageUrl && !/^https:\/\//i.test(body.imageUrl))) throw new HttpError(400, 'Image URL must use HTTPS.', 'INVALID_INPUT');
    input.imageUrl = body.imageUrl;
  }
  if (body.isActive !== undefined) {
    if (typeof body.isActive !== 'boolean') throw new HttpError(400, 'isActive must be true or false.', 'INVALID_INPUT');
    input.isActive = body.isActive;
  }
  return input;
}

export const listRooms = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  const minPrice = req.query.minPrice === undefined ? undefined : Number(req.query.minPrice);
  const maxPrice = req.query.maxPrice === undefined ? undefined : Number(req.query.maxPrice);
  const capacity = req.query.capacity === undefined ? undefined : Number(req.query.capacity);
  if (minPrice !== undefined && (!Number.isFinite(minPrice) || minPrice < 0)) throw new HttpError(400, 'minPrice must be a non-negative number.');
  if (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0)) throw new HttpError(400, 'maxPrice must be a non-negative number.');
  if (capacity !== undefined && (!Number.isInteger(capacity) || capacity < 1)) throw new HttpError(400, 'capacity must be a positive whole number.');
  if (minPrice !== undefined || maxPrice !== undefined) filter.pricePerNight = {
    ...(minPrice !== undefined && { $gte: minPrice }), ...(maxPrice !== undefined && { $lte: maxPrice })
  };
  if (capacity !== undefined) filter.capacity = { $gte: capacity };
  if (req.query.q) {
    const special = new Set('.*+?^$(){}|[]' + String.fromCharCode(92));
    const query = [...String(req.query.q).slice(0, 80)].map((ch) => special.has(ch) ? String.fromCharCode(92) + ch : ch).join('');
    filter.$or = [{ name: { $regex: query, $options: 'i' } }, { type: { $regex: query, $options: 'i' } }];
  }

  let rooms = await Room.find(filter).sort({ pricePerNight: 1 }).limit(100).lean();
  if (req.query.checkIn || req.query.checkOut) {
    if (!req.query.checkIn || !req.query.checkOut) throw new HttpError(400, 'Both checkIn and checkOut are required for availability filtering.');
    const checkIn = parseDateOnly(String(req.query.checkIn), 'checkIn');
    const checkOut = parseDateOnly(String(req.query.checkOut), 'checkOut');
    if (checkOut <= checkIn) throw new HttpError(400, 'Check-out must be after check-in.');
    if ((checkOut - checkIn) / 86400000 > 90) throw new HttpError(400, 'A stay can be at most 90 nights.');
    const unavailable = await RoomNight.distinct('room', {
      room: { $in: rooms.map((room) => room._id) }, night: { $in: occupiedNights(checkIn, checkOut) }
    });
    const unavailableIds = new Set(unavailable.map(String));
    rooms = rooms.filter((room) => !unavailableIds.has(String(room._id)));
  }
  res.json({ rooms });
});

export const getRoom = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(400, 'Room identifier is invalid.', 'INVALID_ID');
  const room = await Room.findOne({ _id: req.params.id, isActive: true }).lean();
  if (!room) throw new HttpError(404, 'Room not found.', 'NOT_FOUND');
  res.json({ room });
});

export const createRoom = asyncHandler(async (req, res) => {
  const room = await Room.create(validateRoomInput(req.body, false));
  res.status(201).json({ room });
});

export const updateRoom = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(400, 'Room identifier is invalid.', 'INVALID_ID');
  const room = await Room.findByIdAndUpdate(req.params.id, validateRoomInput(req.body, true), { new: true, runValidators: true });
  if (!room) throw new HttpError(404, 'Room not found.', 'NOT_FOUND');
  res.json({ room });
});

export const deleteRoom = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(400, 'Room identifier is invalid.', 'INVALID_ID');
  const room = await Room.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!room) throw new HttpError(404, 'Room not found.', 'NOT_FOUND');
  res.json({ message: 'Room removed from the public catalog.' });
});
