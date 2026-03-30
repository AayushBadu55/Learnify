import mongoose from "mongoose";

const routineSchema = new mongoose.Schema({
    semester: {
        type: String,
        required: true,
        default: "Spring 2026"
    },
    days: [{
        name: { type: String, required: true }, // Sunday, Monday, etc.
        slots: [{
            startTime: { type: String, required: true }, // e.g., "10:00 AM"
            endTime: { type: String, required: true },   // e.g., "11:00 AM"
            subject: { type: String },
            subjectCode: { type: String },
            teacher: { type: String },
            room: { type: String },
            isBreak: { type: Boolean, default: false },
            color: { type: String } // e.g., "blue", "orange", "purple", "green", "red"
        }]
    }],
    lastUpdatedBy: {
        type: String, // email of the CR
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Routine = mongoose.model("Routine", routineSchema);
export default Routine;
