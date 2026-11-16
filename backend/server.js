import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import complaintRoutes from './routes/complaints.js';
import userRoutes from './routes/users.js';
import staffRoutes from './routes/staff.js';
import { connectDB } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/users', userRoutes);
app.use('/api/staff', staffRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`)))
  .catch(err => { console.error('Failed to start:', err.message); process.exit(1); });
