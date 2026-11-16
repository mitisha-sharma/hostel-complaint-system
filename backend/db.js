import mongoose from 'mongoose';
import { seedUsers } from './seed.js';

// Connects to MONGODB_URI. If MongoDB isn't running locally (the usual reason the app "won't start"),
// falls back to a throwaway in-memory MongoDB seeded with the demo users, so `npm start` just works.
export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel-complaints';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    console.log('MongoDB connected');
    return;
  } catch (err) {
    if (process.env.NODE_ENV === 'production') throw err;
    console.warn(`Could not reach MongoDB (${err.message}). Starting in-memory database for development...`);
  }
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  const mem = await MongoMemoryServer.create();
  await mongoose.connect(mem.getUri('hostel-complaints'));
  console.log('In-memory MongoDB ready. Data resets on restart. Demo users seeded:', await seedUsers());
}
