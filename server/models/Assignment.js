import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    fileData: { type: String }, // Optional: Base64 for attached material
    fileName: { type: String },
    createdBy: { type: String, required: true }, // Email or Name of CR
    createdAt: { type: Date, default: Date.now }
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
