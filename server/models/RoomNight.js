import mongoose from 'mongoose';

// One claim per occupied night. The unique index rejects concurrent overlap attempts.
const roomNightSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  night: { type: Date, required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true }
}, { timestamps: true, versionKey: false });

roomNightSchema.index({ room: 1, night: 1 }, { unique: true });
roomNightSchema.index({ booking: 1 });
export default mongoose.model('RoomNight', roomNightSchema);
