import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['Electrical', 'Plumbing', 'Carpentry', 'Cleaning', 'Internet', 'Cleanliness', 'Maintenance', 'Other'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
      required: true,
    },
    status: {
      type: String,
      enum: ['Raised', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Raised',
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    student_name: {
      type: String,
      required: true,
    },
    room_no: {
      type: String,
      required: true,
    },
    staff_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    staff_name: {
      type: String,
      default: null,
    },
    resolution_notes: {
      type: String,
      default: null,
    },
    assignedDate: {
      type: Date,
      default: null,
    },
    resolvedDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Complaint', complaintSchema);
