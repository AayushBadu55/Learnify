import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderName: { type: String, required: true },
    senderEmail: { type: String, required: true },
    senderPhoto: { type: String },
    content: { type: String },
    fileData: { type: String },
    fileName: { type: String },
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true }, // Added reference to Chat
    timestamp: { type: Date, default: Date.now },
    reactions: [
        {
            emoji: String,
            userEmail: String
        }
    ]
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
