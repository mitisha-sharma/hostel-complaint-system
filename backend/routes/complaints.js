import express from 'express';
import {
  raiseComplaint,
  getComplaints,
  getComplaintById,
  assignComplaint,
  updateComplaintStatus,
  rejectComplaint,
  getComplaintStats,
} from '../controllers/complaintController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/raise', authenticate, authorize(['student']), raiseComplaint);
router.get('/', authenticate, getComplaints);
router.get('/:id', authenticate, getComplaintById);
router.put('/:id/assign', authenticate, authorize(['admin']), assignComplaint);
router.put('/:id/status', authenticate, authorize(['maintenance', 'admin']), updateComplaintStatus);
router.put('/:id/reject', authenticate, authorize(['admin']), rejectComplaint);
router.get('/stats/overview', authenticate, authorize(['admin']), getComplaintStats);

export default router;
