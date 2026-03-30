import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    studentEmail: { type: String, required: true },
    studentName: { type: String, required: true },
    fileData: { type: String, required: true }, // Base64 for student's work
    fileName: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now }
});

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
