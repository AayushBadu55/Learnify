import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    link: { type: String }, // Optional external link
    fileData: { type: String }, // Base64 string for file
    fileName: { type: String },
    date: { type: Date, default: Date.now },
    sender: { type: String, required: true }
});

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;
