import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import User from './models/User.js';

dotenv.config();

export const DEMO_USERS = [
      {
        name: 'Arjun Sharma',
        email: 'student@hostel.com',
        password: 'student123',
        role: 'student',
        room_no: 'A-204',
        contact: '9876543210',
      },
      {
        name: 'Dr. Ramesh Warden',
        email: 'admin@hostel.com',
        password: 'admin123',
        role: 'admin',
        contact: '9123456780',
      },
      {
        name: 'Suresh Kumar',
        email: 'staff@hostel.com',
        password: 'staff123',
        role: 'maintenance',
        department: 'Electrical',
        contact: '9001122334',
      },
      {
        name: 'Mahesh Plumber',
        email: 'mahesh@hostel.com',
        password: 'staff123',
        role: 'maintenance',
        department: 'Plumbing',
        contact: '9234567890',
      },
      {
        name: 'Ravi Carpenter',
        email: 'ravi@hostel.com',
        password: 'staff123',
        role: 'maintenance',
        department: 'Carpentry',
        contact: '9345678901',
      },
    ];

// Replaces all users with the demo accounts (uses User.create so passwords get hashed by the model hook)
export const seedUsers = async () => {
  await User.deleteMany({});
  const created = [];
  for (const u of DEMO_USERS) created.push(await User.create(u));
  return created.length;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  (async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hostel-complaints');
      console.log('Users created:', await seedUsers());
      await mongoose.connection.close();
    } catch (error) {
      console.error('Seeding error:', error.message);
      process.exit(1);
    }
  })();
}
