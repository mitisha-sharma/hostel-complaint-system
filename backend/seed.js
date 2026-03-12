import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel-complaints');
    console.log('MongoDB connected for seeding');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create test users
    const users = [
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

    const createdUsers = await User.insertMany(users);
    console.log('Users created:', createdUsers.length);

    await mongoose.connection.close();
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
