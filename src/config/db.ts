import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  try {
    // mongoose.set('sanitizeFilter', true);
    mongoose.set('strictQuery', true);

    await mongoose.connect(env.MONGO_URI);
    console.log(`[Database] Connected successfully to MongoDB (${env.NODE_ENV})`);
  } catch (error) {
    console.error('[Database] Connection failed:', error);
    process.exit(1);
  }
}
