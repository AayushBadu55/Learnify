import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
    sender: { type: String, required: true }, // Name of the CR or "Admin"
    expirationDate: { type: Date }, // Optional expiration date
    priority: { type: String, enum: ['Normal', 'Important', 'Urgent'], default: 'Normal' }
});

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
