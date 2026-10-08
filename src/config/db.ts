import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGO_URI);
    console.log([Database] Connected successfully to MongoDB ());
  } catch (error) {
    console.error('[Database] Connection failed:', error);
  }
}
