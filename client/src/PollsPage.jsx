import React, { useState, useEffect, useMemo } from "react";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import io from "socket.io-client";
import "./PollsPage.css";

function PollsPage() {
  const [polls, setPolls] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("active"); // "active" | "past"

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [category, setCategory] = useState("General");
  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setError("Please log in to view and participate in polls.");
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchPolls();
      
      const newSocket = io("http://localhost:5000");

      newSocket.on("poll_created", (newPoll) => {
        setPolls((prev) => [newPoll, ...prev]);
      });

      newSocket.on("poll_updated", (updatedPoll) => {
        setPolls((prev) =>
          prev.map((p) => (p._id === updatedPoll._id ? updatedPoll : p))
        );
      });

      newSocket.on("poll_deleted", (deletedId) => {
        setPolls((prev) => prev.filter((p) => p._id !== deletedId));
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const fetchPolls = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/polls");
      if (!response.ok) throw new Error("Failed to fetch polls");
      const data = await response.json();
      setPolls(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load polls.");
    } finally {
      setLoading(false);
    }
  };

  const isPollActive = (poll) => {
    if (!poll.expiresAt) return true;
    return new Date() < new Date(poll.expiresAt);
  };

  // Derived state for tabs
  const activePolls = useMemo(() => polls.filter(isPollActive), [polls]);
  const pastPolls = useMemo(() => polls.filter((p) => !isPollActive(p)), [polls]);

  const displayedPolls = activeTab === "active" ? activePolls : pastPolls;

  const handleVote = async (pollId, optionId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: user.email, optionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to vote");
        return;
      }
      // Socket handles the state update if successful
    } catch (err) {
      console.error(err);
      alert("Error submitting vote");
    }
  };

  const handleDelete = async (pollId) => {
    if (!window.confirm("Are you sure you want to delete this poll?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/polls/${pollId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        alert("Failed to delete poll");
      }
      // Socket handles state update
    } catch (err) {
      console.error(err);
      alert("Error deleting poll");
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    const validOptions = options.filter((opt) => opt.trim() !== "");
    if (validOptions.length < 2) {
      alert("Please provide at least two valid options.");
      return;
    }

    let expiresAt = null;
    if (expiryDate) {
        expiresAt = new Date(expiryDate);
    }

    try {
      const response = await fetch("http://localhost:5000/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          options: validOptions,
          createdBy: user.email,
          creatorName: user.name,
          category,
          expiresAt
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to create poll");
        return;
      }

      setShowModal(false);
      setQuestion("");
      setOptions(["", ""]);
      setCategory("General");
      setExpiryDate("");
      // Socket handles state append
    } catch (err) {
      console.error(err);
      alert("Error creating poll");
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOptionField = () => {
    setOptions([...options, ""]);
  };

  const removeOptionField = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  // Helper to check if current user voted
  const hasUserVoted = (poll) => {
    return poll.options.some((opt) => opt.votes.includes(user?.email));
  };

  const getTotalVotes = (poll) => {
    return poll.options.reduce((total, opt) => total + opt.votes.length, 0);
  };
  
  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="polls-root">
      <Nav />
      <div style={{ height: "70px" }}></div>
      <main className="polls-main">
        <div className="polls-header">
          <div>
            <h1 className="polls-title">Polls Dashboard</h1>
            <p className="polls-subtitle">
              Participate in live classroom polls. Results update in real-time.
            </p>
          </div>
          {user && (user.userType === "CR" || user.userType === "cr") && (
            <button className="create-poll-btn" onClick={() => setShowModal(true)}>
              <span>✨ Create Poll</span>
            </button>
          )}
        </div>

        <div className="polls-tabs">
          <button 
            className={`polls-tab ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            Ask & Vote ({activePolls.length})
          </button>
          <button 
            className={`polls-tab ${activeTab === "past" ? "active" : ""}`}
            onClick={() => setActiveTab("past")}
          >
            Past Polls ({pastPolls.length})
          </button>
        </div>

        {error && <div className="polls-error">{error}</div>}
        {loading && <div className="polls-loading">Loading polls...</div>}

        {!loading && !error && displayedPolls.length === 0 && (
          <div className="polls-empty">
            <span className="polls-empty-icon">📮</span>
            <p>No {activeTab} polls available right now.</p>
          </div>
        )}

        <div className="polls-list">
          {!loading &&
            displayedPolls.map((poll) => {
              const voted = hasUserVoted(poll);
              const totalVotes = getTotalVotes(poll);
              const active = isPollActive(poll);

              return (
                <div key={poll._id} className="poll-card">
                  <div className="poll-card-header">
                    <h2 className="poll-question">{poll.question}</h2>
                    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                        {active && <span className="poll-badge">Live</span>}
                        {poll.category && poll.category !== "General" && (
                            <span className={`poll-badge category-badge category-${poll.category.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`}>
                                {poll.category}
                            </span>
                        )}
                        {user && (user.userType === "CR" || user.userType === "cr") && poll.createdBy === user.email && (
                        <button
                            className="poll-delete-btn"
                            onClick={() => handleDelete(poll._id)}
                            title="Delete Poll"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                        )}
                    </div>
                  </div>
                  <p className="poll-meta">
                    <span className="poll-meta-avatar">{getInitials(poll.creatorName)}</span>
                    Asked by {poll.creatorName} • {new Date(poll.createdAt).toLocaleDateString()}
                    {poll.expiresAt && active && (
                        <span style={{color: '#ff6b6b'}}> • Ends at {new Date(poll.expiresAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    )}
                  </p>

                  <div className="poll-options">
                    {poll.options.map((option) => {
                      const votesForOption = option.votes.length;
                      const percentage =
                        totalVotes === 0
                          ? 0
                          : Math.round((votesForOption / totalVotes) * 100);

                      const isVotedOption = option.votes.includes(user?.email);

                      if (voted || !active) {
                        // Show Results if user has voted or poll is ended
                        return (
                          <div key={option._id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div className={`poll-result ${isVotedOption ? 'voted-option' : ''}`}>
                              <div className="poll-result-bar" style={{ width: `${percentage}%` }}></div>
                              <div className="poll-result-content">
                                <span>{option.optionText} {isVotedOption && '✨'}</span>
                                <span className="poll-result-stats">
                                  {percentage}% <span className="poll-result-count">{votesForOption} {votesForOption === 1 ? 'vote' : 'votes'}</span>
                                </span>
                              </div>
                            </div>
                            {option.votes.length > 0 && (
                              <div style={{ fontSize: '0.8rem', color: '#7a6595', paddingLeft: '8px' }}>
                                <span style={{fontWeight: 600}}>Voted by:</span> {option.votes.map(email => email.split('@')[0]).join(', ')}
                              </div>
                            )}
                          </div>
                        );
                      } else {
                        // Show Voting Buttons
                        return (
                          <button
                            key={option._id}
                            className="poll-vote-btn"
                            onClick={() => handleVote(poll._id, option._id)}
                          >
                            <span>{option.optionText}</span>
                            <span className="poll-vote-icon">→</span>
                          </button>
                        );
                      }
                    })}
                  </div>
                  <div className="poll-footer">
                    <div>
                        Total Votes: {totalVotes} { !active && <span style={{marginLeft: '10px', color: '#888'}}>• Poll Ended</span>}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </main>

      {/* Create Poll Modal */}
      {showModal && (
        <div className="poll-modal-overlay">
          <div className="poll-modal">
            <h2>Create a New Poll</h2>
            <p className="modal-desc">Engage with your classmates in real-time.</p>
            <form onSubmit={handleCreatePoll}>
              <div className="form-group">
                <label>What's your question?</label>
                <input
                  type="text"
                  className="form-control-input"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. When should we hold the extra class?"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select 
                  className="form-control-input" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="General">General</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Contest">Contest</option>
                  <option value="Tour/Visit">Tour/Visit</option>
                  <option value="Event">Event</option>
                  <option value="Discussion">Discussion</option>
                </select>
              </div>

              <div className="form-group">
                <label>Options</label>
                {options.map((opt, index) => (
                  <div key={index} className="poll-option-input">
                     <span className="opt-number">{index + 1}.</span>
                    <input
                      type="text"
                      className="form-control-input"
                      value={opt}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        className="remove-opt-btn"
                        onClick={() => removeOptionField(index)}
                        title="Remove option"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="add-opt-btn" onClick={addOptionField}>
                  + Add Another Option
                </button>
              </div>

              <div className="form-group">
                <label>Due Date & Time (Optional)</label>
                <input
                  type="datetime-local"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="form-control-input"
                />
              </div>

              <div className="poll-modal-actions">
                <button
                  type="button"
                  className="poll-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="poll-submit-btn">
                  Publish Poll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default PollsPage;
