import express from "express";
const router = express.Router();
import Poll from "../models/Poll.js";

// Create a new poll (Expects: question, options array of strings, createdBy email, creatorName)
router.post("/", async (req, res) => {
  try {
    const { question, options, createdBy, creatorName, category, expiresAt } = req.body;

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: "A poll must have a question and at least 2 options." });
    }

    const formattedOptions = options.map((opt) => ({
      optionText: opt,
      votes: [],
    }));

    const newPoll = new Poll({
      question,
      options: formattedOptions,
      createdBy,
      creatorName,
      category: category || "General",
      expiresAt: expiresAt || null
    });

    const savedPoll = await newPoll.save();
    
    // Emit socket event for real-time update
    const io = req.app.get('io');
    if (io) io.emit("poll_created", savedPoll);

    res.status(201).json(savedPoll);
  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).json({ error: "Failed to create poll" });
  }
});

// Get all polls
router.get("/", async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    console.error("Error fetching polls:", error);
    res.status(500).json({ error: "Failed to fetch polls" });
  }
});

// Vote on a poll
router.post("/:id/vote", async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail, optionId } = req.body; // Expecting userEmail and optionId in body

    if (!userEmail || !optionId) {
      return res.status(400).json({ error: "User Email and Option ID are required." });
    }

    const poll = await Poll.findById(id);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    // Check if poll is expired
    if (poll.expiresAt && new Date() > new Date(poll.expiresAt)) {
      return res.status(400).json({ error: "This poll has ended." });
    }

    // Check if user already voted in ANY option of this poll
    const hasVoted = poll.options.some((opt) => 
      opt.votes.includes(userEmail)
    );

    if (hasVoted) {
      return res.status(400).json({ error: "You have already voted in this poll." });
    }

    // Find the option and add the vote
    const optionIndex = poll.options.findIndex((opt) => opt._id.toString() === optionId);
    if (optionIndex === -1) {
      return res.status(404).json({ error: "Option not found in this poll." });
    }

    poll.options[optionIndex].votes.push(userEmail);
    const updatedPoll = await poll.save();

    // Emit live update
    const io = req.app.get('io');
    if (io) io.emit("poll_updated", updatedPoll);

    res.json(updatedPoll);
  } catch (error) {
    console.error("Error voting on poll:", error);
    res.status(500).json({ error: "Failed to submit vote" });
  }
});

// Delete a poll
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPoll = await Poll.findByIdAndDelete(id);
    if (!deletedPoll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    // Emit live update
    const io = req.app.get('io');
    if (io) io.emit("poll_deleted", id);

    res.json({ message: "Poll deleted successfully" });
  } catch (error) {
    console.error("Error deleting poll:", error);
    res.status(500).json({ error: "Failed to delete poll" });
  }
});

export default router;
