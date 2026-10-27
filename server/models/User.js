import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, minlength: 10, select: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer', immutable: true },
  isActive: { type: Boolean, default: true },
  tokenVersion: { type: Number, default: 0, select: false }
}, { timestamps: true, versionKey: false });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};
userSchema.methods.toSafeJSON = function toSafeJSON() {
  return { id: this.id, name: this.name, email: this.email, role: this.role };
};
export default mongoose.model('User', userSchema);
