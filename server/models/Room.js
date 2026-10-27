import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  type: { type: String, required: true, trim: true, maxlength: 60 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  pricePerNight: { type: Number, required: true, min: 0 },
  capacity: { type: Number, required: true, min: 1, max: 20, validate: Number.isInteger },
  amenities: { type: [String], default: [] },
  imageUrl: { type: String, default: '', trim: true },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true, versionKey: false });

roomSchema.index({ pricePerNight: 1, capacity: 1, isActive: 1 });
export default mongoose.model('Room', roomSchema);
