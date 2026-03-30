import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    isGroupChat: { type: Boolean, default: false },
    chatName: { type: String },
    users: [{ type: String }], // Store emails for simplicity to match existing pattern
    admin: { type: String }, // Email of admin if it's a group
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
