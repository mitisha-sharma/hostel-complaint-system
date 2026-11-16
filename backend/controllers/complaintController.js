import Complaint from '../models/Complaint.js';
import User from '../models/User.js';

export const raiseComplaint = async (req, res) => {
  try {
    const { category, description, priority } = req.body;
    const { id: student_id, name: student_name } = req.user;

    // Get student room number from database
    const student = await User.findById(student_id).select('room_no');
    const room_no = student?.room_no || 'Unknown';

    const newComplaint = new Complaint({
      category,
      description,
      priority,
      status: 'Raised',
      student_id,
      student_name,
      room_no,
    });

    await newComplaint.save();
    res.status(201).json({ message: 'Complaint raised successfully', complaint: newComplaint });
  } catch (error) {
    res.status(500).json({ message: 'Error raising complaint', error: error.message });
  }
};

export const getComplaints = async (req, res) => {
  try {
    const { role, id } = req.user;
    let complaints;

    if (role === 'student') {
      complaints = await Complaint.find({ student_id: id }).sort({ createdAt: -1 });
    } else if (role === 'maintenance') {
      complaints = await Complaint.find({ staff_id: id }).sort({ createdAt: -1 });
    } else if (role === 'admin') {
      complaints = await Complaint.find().sort({ createdAt: -1 });
    }

    res.json({ complaints });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complaints', error: error.message });
  }
};

export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({ complaint });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complaint', error: error.message });
  }
};

export const assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { staff_id, staff_name } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      {
        staff_id,
        staff_name,
        status: 'Assigned',
        assignedDate: new Date(),
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({ message: 'Complaint assigned successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning complaint', error: error.message });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution_notes } = req.body;

    const updateData = { status };
    if (status === 'Resolved') {
      updateData.resolvedDate = new Date();
      updateData.resolution_notes = resolution_notes;
    } else if (status === 'In Progress') {
      updateData.status = 'In Progress';
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({ message: 'Complaint status updated successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: 'Error updating complaint', error: error.message });
  }
};

export const rejectComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status: 'Rejected' },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({ message: 'Complaint rejected successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting complaint', error: error.message });
  }
};

export const getComplaintStats = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved' });
    const assignedComplaints = await Complaint.countDocuments({ status: 'Assigned' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'In Progress' });
    const raisedComplaints = await Complaint.countDocuments({ status: 'Raised' });

    const complaintsByCategory = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    const resolutionRate = totalComplaints > 0
      ? ((resolvedComplaints / totalComplaints) * 100).toFixed(2)
      : 0;

    res.json({
      totalComplaints,
      resolvedComplaints,
      assignedComplaints,
      inProgressComplaints,
      raisedComplaints,
      resolutionRate,
      complaintsByCategory,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};
