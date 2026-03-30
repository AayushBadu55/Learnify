import mongoose from "mongoose";

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: [
      {
        optionText: {
          type: String,
          required: true,
          trim: true,
        },
        votes: [
          {
            type: String, // Store email of voter
          },
        ],
      },
    ],
    createdBy: {
      type: String, // Store email of creator
      required: true,
    },
    creatorName: {
      type: String, // Optional: Store name of creator for easy display
      required: true,
    },
    category: {
      type: String,
      default: "General",
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

const Poll = mongoose.model("Poll", pollSchema);
export default Poll;
