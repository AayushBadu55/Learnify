import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Announcement from './models/Announcement.js';
import Resource from './models/Resource.js';
import Message from './models/Message.js';
import Chat from './models/Chat.js';
import Attendance from './models/Attendance.js';
import Routine from './models/Routine.js';
import Assignment from './models/Assignment.js';
import Submission from './models/Submission.js';
import pollRoutes from './routes/polls.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", // Vite default port
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.set('io', io);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ Connection Error:", err));

// 1. Check if email exists (Requirement 1)
app.post('/api/auth/check-email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) return res.status(400).json({ message: "Email already registered!" });
        res.status(200).json({ message: "Email available" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// 2. Final Registration (Requirement 2)
app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, password, phone, userType } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            phone,
            userType
        });

        await newUser.save();
        res.status(201).json({ message: "Account created successfully" });
    } catch (err) {
        res.status(500).json({ message: "Registration failed" });
    }
});

// 3. Login Validation (Requirement 2)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        res.status(200).json({
            message: "Login successful",
            user: {
                name: user.fullName,
                email: user.email,
                phone: user.phone,
                profilePicture: user.profilePicture,
                userType: user.userType
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Login error" });
    }
});

// 4. Update Profile Endpoint
app.put('/api/auth/update-profile', async (req, res) => {
    try {
        const { email, fullName, phone, profilePicture } = req.body;

        // Find user by email and update
        // { new: true } returns the updated document
        const updatedUser = await User.findOneAndUpdate(
            { email },
            { fullName, phone, profilePicture },
            { new: true }
        );

        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                name: updatedUser.fullName,
                email: updatedUser.email,
                phone: updatedUser.phone,
                profilePicture: updatedUser.profilePicture
            }
        });
    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ message: "Failed to update profile" });
    }
});

// Nodemailer Config Removed (Using EmailJS on client)

// 5. Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User with this email does not exist" });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to DB with expiry (10 minutes)
        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        // Return OTP and userName to client for EmailJS
        res.status(200).json({
            message: "OTP Generated",
            otp: otp,
            userName: user.fullName
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// 6. Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({
            email,
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        res.status(200).json({ message: "OTP Verified" });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// 7. Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({
            email,
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successful" });

    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});


// 8. Announcements API
app.get('/api/announcements', async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ date: -1 });
        res.status(200).json(announcements);
    } catch (err) {
        res.status(500).json({ message: "Error fetching announcements" });
    }
});

app.post('/api/announcements', async (req, res) => {
    try {
        const { title, content, sender, expirationDate, priority } = req.body;
        const newAnnouncement = new Announcement({ title, content, sender, expirationDate, priority });
        await newAnnouncement.save();
        res.status(201).json(newAnnouncement);
    } catch (err) {
        res.status(500).json({ message: "Error creating announcement" });
    }
});

app.put('/api/announcements/:id', async (req, res) => {
    try {
        const { title, content, expirationDate, priority } = req.body;
        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            req.params.id,
            { title, content, expirationDate, priority },
            { new: true }
        );
        if (!updatedAnnouncement) return res.status(404).json({ message: "Announcement not found" });
        res.status(200).json(updatedAnnouncement);
    } catch (err) {
        res.status(500).json({ message: "Error updating announcement" });
    }
});

app.delete('/api/announcements/:id', async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Announcement deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting announcement" });
    }
});

// 9. Chat API
app.get('/api/chats/:email', async (req, res) => {
    try {
        const chats = await Chat.find({ users: req.params.email }).populate('latestMessage').sort({ updatedAt: -1 });
        res.status(200).json(chats);
    } catch (err) {
        res.status(500).json({ message: "Error fetching chats" });
    }
});

app.post('/api/chats', async (req, res) => {
    try {
        const { isGroupChat, chatName, users, admin } = req.body;
        // Check if 1-1 chat already exists
        if (!isGroupChat && users.length === 2) {
            const existingChat = await Chat.findOne({
                isGroupChat: false,
                $and: [
                    { users: { $elemMatch: { $eq: users[0] } } },
                    { users: { $elemMatch: { $eq: users[1] } } }
                ]
            });
            if (existingChat) return res.status(200).json(existingChat);
        }
        
        const newChat = new Chat({ isGroupChat, chatName, users, admin });
        await newChat.save();
        res.status(201).json(newChat);
    } catch (err) {
        res.status(500).json({ message: "Error creating chat" });
    }
});

app.get('/api/messages/chat/:chatId', async (req, res) => {
    try {
        const messages = await Message.find({ chatId: req.params.chatId }).sort({ timestamp: 1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: "Error fetching messages" });
    }
});

app.delete('/api/messages/:id', async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Message deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting message" });
    }
});

// 10. Users API
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, 'fullName email userType').sort({ fullName: 1 });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users" });
    }
});

// 11. Attendance API
app.get('/api/attendance/:email', async (req, res) => {
    try {
        const records = await Attendance.find({
            'attendanceRecords.email': req.params.email
        }).sort({ date: -1 });

        const formattedRecords = records.map(record => {
            const studentRecord = record.attendanceRecords.find(r => r.email === req.params.email);
            return {
                _id: record._id,
                subject: record.subject,
                date: record.date,
                status: studentRecord ? studentRecord.status : 'Absent'
            };
        });

        res.status(200).json(formattedRecords);
    } catch (err) {
        res.status(500).json({ message: "Error fetching attendance" });
    }
});

app.post('/api/attendance', async (req, res) => {
    try {
        const { subject, date, attendanceRecords, markedBy } = req.body;

        // Use updateOne with upsert to avoid duplicates per subject/date
        const result = await Attendance.updateOne(
            { subject, date: new Date(date).setHours(0, 0, 0, 0) },
            {
                $set: {
                    attendanceRecords,
                    markedBy,
                    createdAt: new Date()
                }
            },
            { upsert: true }
        );

        res.status(200).json({ message: "Attendance saved successfully", result });
    } catch (err) {
        console.error("Attendance save error:", err);
        res.status(500).json({ message: "Error saving attendance" });
    }
});

// Summary for stats
app.get('/api/attendance/summary/:email', async (req, res) => {
    try {
        const records = await Attendance.find({
            'attendanceRecords.email': req.params.email
        });

        const summary = {};
        records.forEach(record => {
            if (!summary[record.subject]) {
                summary[record.subject] = { attended: 0, total: 0 };
            }
            const studentRecord = record.attendanceRecords.find(r => r.email === req.params.email);
            summary[record.subject].total += 1;
            if (studentRecord && (studentRecord.status === 'Present' || studentRecord.status === 'Late')) {
                summary[record.subject].attended += 1;
            }
        });

        const subjectList = Object.keys(summary).map(name => ({
            name,
            attended: summary[name].attended,
            total: summary[name].total,
            percent: summary[name].total > 0 ? Math.round((summary[name].attended / summary[name].total) * 100) : 0
        }));

        res.status(200).json(subjectList);
    } catch (err) {
        res.status(500).json({ message: "Error fetching attendance summary" });
    }
});

// ROUTINE ROUTES
app.get('/api/routine', async (req, res) => {
    try {
        const routine = await Routine.findOne().sort({ updatedAt: -1 });
        if (!routine) return res.status(404).json({ message: "No routine found" });
        res.status(200).json(routine);
    } catch (err) {
        res.status(500).json({ message: "Error fetching routine" });
    }
});

app.post('/api/routine', async (req, res) => {
    try {
        const { semester, days, lastUpdatedBy } = req.body;
        const routine = new Routine({
            semester,
            days,
            lastUpdatedBy,
            updatedAt: new Date()
        });
        await routine.save();
        res.status(200).json({ message: "Routine updated successfully", routine });
    } catch (err) {
        console.error("Routine save error:", err);
        res.status(500).json({ message: "Error saving routine" });
    }
});

// 12. Resources API
app.get('/api/resources', async (req, res) => {
    try {
        const resources = await Resource.find().sort({ date: -1 });
        res.status(200).json(resources);
    } catch (err) {
        res.status(500).json({ message: "Error fetching resources" });
    }
});

app.post('/api/resources', async (req, res) => {
    try {
        const { title, description, link, fileData, fileName, sender } = req.body;
        const newResource = new Resource({ title, description, link, fileData, fileName, sender });
        await newResource.save();
        res.status(201).json(newResource);
    } catch (err) {
        res.status(500).json({ message: "Error uploading resource" });
    }
});

app.delete('/api/resources/:id', async (req, res) => {
    try {
        await Resource.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Resource deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting resource" });
    }
});

// 13. Assignments API
app.get('/api/assignments', async (req, res) => {
    try {
        const assignments = await Assignment.find().sort({ createdAt: -1 });
        res.status(200).json(assignments);
    } catch (err) {
        res.status(500).json({ message: "Error fetching assignments" });
    }
});

app.post('/api/assignments', async (req, res) => {
    try {
        const { title, description, dueDate, fileData, fileName, createdBy } = req.body;
        const newAssignment = new Assignment({ title, description, dueDate, fileData, fileName, createdBy });
        await newAssignment.save();
        res.status(201).json(newAssignment);
    } catch (err) {
        res.status(500).json({ message: "Error creating assignment" });
    }
});

app.get('/api/assignments/:id', async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ message: "Assignment not found" });
        res.status(200).json(assignment);
    } catch (err) {
        res.status(500).json({ message: "Error fetching assignment details" });
    }
});

app.put('/api/assignments/:id', async (req, res) => {
    try {
        const { title, description, dueDate, fileData, fileName } = req.body;
        const updatedAssignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            { title, description, dueDate, fileData, fileName },
            { new: true }
        );
        if (!updatedAssignment) return res.status(404).json({ message: "Assignment not found" });
        res.status(200).json(updatedAssignment);
    } catch (err) {
        res.status(500).json({ message: "Error updating assignment" });
    }
});

app.delete('/api/assignments/:id', async (req, res) => {
    try {
        await Assignment.findByIdAndDelete(req.params.id);
        // Also delete related submissions
        await Submission.deleteMany({ assignmentId: req.params.id });
        res.status(200).json({ message: "Assignment and related submissions deleted" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting assignment" });
    }
});

app.post('/api/submissions', async (req, res) => {
    try {
        const { assignmentId, studentEmail, studentName, fileData, fileName } = req.body;
        const newSubmission = new Submission({ assignmentId, studentEmail, studentName, fileData, fileName });
        await newSubmission.save();
        res.status(201).json(newSubmission);
    } catch (err) {
        res.status(500).json({ message: "Error submitting assignment" });
    }
});

app.get('/api/submissions/assignment/:id', async (req, res) => {
    try {
        const submissions = await Submission.find({ assignmentId: req.params.id }).sort({ submittedAt: -1 });
        res.status(200).json(submissions);
    } catch (err) {
        res.status(500).json({ message: "Error fetching submissions" });
    }
});

app.get('/api/submissions/student/:email', async (req, res) => {
    try {
        const submissions = await Submission.find({ studentEmail: req.params.email });
        res.status(200).json(submissions);
    } catch (err) {
        res.status(500).json({ message: "Error fetching student submissions" });
    }
});

// 14. Polls API
app.use('/api/polls', pollRoutes);

// Socket.io Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('setup_user', (email) => {
        socket.join(email);
        console.log(`User ${email} joined personal room`);
        socket.emit('connected');
    });

    socket.on('join_chat', (chatId) => {
        socket.join(chatId);
        console.log(`User joined chat room ${chatId}`);
    });

    socket.on('send_message', async (data) => {
        try {
            const { senderName, senderEmail, senderPhoto, content, fileData, fileName, chatId } = data;
            
            // Only save if chatId exists
            if (!chatId) {
                console.error("Message missing chatId");
                return;
            }

            const newMessage = new Message({ senderName, senderEmail, senderPhoto, content, fileData, fileName, chatId });
            await newMessage.save();
            
            // Update latest message in Chat
            await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage._id });

            // Broadcast to the specific chat room
            io.to(chatId).emit('receive_message', newMessage);
        } catch (err) {
            console.error("Socket error (send_message):", err);
        }
    });

    socket.on('delete_message_request', async (data) => {
        try {
            // Need to know which chat it belonged to, to broadcast properly
            const { id, chatId } = data; 
            await Message.findByIdAndDelete(id);
            if (chatId) {
                io.to(chatId).emit('message_deleted', id);
            } else {
                io.emit('message_deleted', id);
            }
        } catch (err) {
            console.error("Socket error (delete_message):", err);
        }
    });

    socket.on('add_reaction', async (data) => {
        try {
            const { messageId, emoji, userEmail, chatId } = data;
            const message = await Message.findById(messageId);
            if (message) {
                const existingIndex = message.reactions.findIndex(r => r.userEmail === userEmail && r.emoji === emoji);
                if (existingIndex > -1) {
                    message.reactions.splice(existingIndex, 1);
                } else {
                    message.reactions.push({ emoji, userEmail });
                }
                await message.save();
                if (chatId) {
                    io.to(chatId).emit('reaction_updated', { messageId, reactions: message.reactions });
                } else {
                    io.emit('reaction_updated', { messageId, reactions: message.reactions });
                }
            }
        } catch (err) {
            console.error("Socket error (add_reaction):", err);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));