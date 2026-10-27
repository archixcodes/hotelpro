import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const arg = (name) => {
  const index = process.argv.indexOf('--' + name);
  return index >= 0 ? process.argv[index + 1] : undefined;
};
const email = arg('email')?.trim().toLowerCase();
const password = arg('password');
const name = arg('name') || 'Hotel Manager';

if (!process.env.MONGODB_URI || !email || !password || password.length < 10) {
  console.error('Usage: npm run seed:admin -- --email admin@example.com --password <10+ characters> [--name "Hotel Manager"]');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  if (await User.exists({ email })) throw new Error('An account with this email already exists; no changes were made.');
  const user = await User.create({ name, email, password, role: 'admin' });
  console.info('Administrator created: ' + user.email);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
