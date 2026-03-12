import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get all maintenance staff
router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const staff = await User.find({ role: 'maintenance' }).select('-password');
    res.json({ staff });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff', error: error.message });
  }
});

// Get staff by department
router.get('/department/:department', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { department } = req.params;
    const staff = await User.find({ role: 'maintenance', department }).select('-password');
    res.json({ staff });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff', error: error.message });
  }
});

export default router;
