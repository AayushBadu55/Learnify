import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    date: { type: Date, required: true },
    attendanceRecords: [
        {
            studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            fullName: { type: String }, // redundant but helpful for performance
            email: { type: String },
            status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Present' }
        }
    ],
    markedBy: { type: String }, // Email of the CR who marked it
    createdAt: { type: Date, default: Date.now }
});

// Compound index to ensure only one attendance record per subject per day
attendanceSchema.index({ subject: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
