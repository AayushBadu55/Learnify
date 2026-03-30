import React, { useState, useEffect } from "react";
import Nav from "./components/Nav";
import "./AssignmentsPage.css";

function AssignmentsPage() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false); // Modal for CR to create/edit assignment
    const [showDetailsModal, setShowDetailsModal] = useState(false); // Modal for viewing assignment details
    const [isEditing, setIsEditing] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [studentSubmissions, setStudentSubmissions] = useState([]);

    // Form states for CR
    const [newAssignment, setNewAssignment] = useState({
        title: "",
        description: "",
        dueDate: "",
        fileData: "",
        fileName: ""
    });

    // Form states for Student
    const [submissionFile, setSubmissionFile] = useState({
        fileData: "",
        fileName: ""
    });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchAssignments();
            fetchStudentSubmissions(parsedUser.email);
        }
    }, []);

    const fetchAssignments = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/assignments");
            const data = await response.json();
            setAssignments(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching assignments:", error);
            setLoading(false);
        }
    };

    const fetchStudentSubmissions = async (email) => {
        try {
            const response = await fetch(`http://localhost:5000/api/submissions/student/${email}`);
            const data = await response.json();
            setStudentSubmissions(data);
        } catch (error) {
            console.error("Error fetching student submissions:", error);
        }
    };

    const fetchSubmissionsForAssignment = async (assignmentId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/submissions/assignment/${assignmentId}`);
            const data = await response.json();
            setSubmissions(data);
        } catch (error) {
            console.error("Error fetching submissions:", error);
        }
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            if (type === "assignment") {
                setNewAssignment({ ...newAssignment, fileData: reader.result, fileName: file.name });
            } else {
                setSubmissionFile({ fileData: reader.result, fileName: file.name });
            }
        };
        reader.readAsDataURL(file);
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        try {
            const url = isEditing
                ? `http://localhost:5000/api/assignments/${selectedAssignment._id}`
                : "http://localhost:5000/api/assignments";
            const method = isEditing ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newAssignment,
                    createdBy: user.name
                })
            });

            if (response.ok) {
                alert(isEditing ? "Assignment updated successfully!" : "Assignment created successfully!");
                setNewAssignment({ title: "", description: "", dueDate: "", fileData: "", fileName: "" });
                setShowCreateModal(false);
                setIsEditing(false);
                fetchAssignments();
            }
        } catch (error) {
            console.error("Error saving assignment:", error);
        }
    };

    const handleDeleteAssignment = async (id) => {
        if (!window.confirm("Are you sure you want to delete this assignment and all its submissions?")) return;
        try {
            const response = await fetch(`http://localhost:5000/api/assignments/${id}`, {
                method: "DELETE"
            });
            if (response.ok) {
                alert("Assignment deleted!");
                fetchAssignments();
            }
        } catch (error) {
            console.error("Error deleting assignment:", error);
        }
    };

    const handleSubmitAssignment = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/api/submissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assignmentId: selectedAssignment._id,
                    studentEmail: user.email,
                    studentName: user.name,
                    fileData: submissionFile.fileData,
                    fileName: submissionFile.fileName
                })
            });

            if (response.ok) {
                alert("Assignment submitted successfully!");
                setShowSubmitModal(false);
                setSubmissionFile({ fileData: "", fileName: "" });
                fetchStudentSubmissions(user.email);
            }
        } catch (error) {
            console.error("Error submitting assignment:", error);
        }
    };

    const getStatus = (assignment) => {
        const hasSubmitted = studentSubmissions.some(s => s.assignmentId === assignment._id);
        if (hasSubmitted) return "Submitted";

        const dueDate = new Date(assignment.dueDate);
        if (dueDate < new Date()) return "Missed";

        return "Pending";
    };

    const openSubmissions = (assignment) => {
        setSelectedAssignment(assignment);
        fetchSubmissionsForAssignment(assignment._id);
        setShowSubmissionsModal(true);
    };

    const openSubmit = (assignment) => {
        setSelectedAssignment(assignment);
        setShowSubmitModal(true);
    };

    const openEdit = (assignment) => {
        setIsEditing(true);
        setSelectedAssignment(assignment);
        setNewAssignment({
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.dueDate.slice(0, 16), // Format for datetime-local
            fileData: assignment.fileData,
            fileName: assignment.fileName
        });
        setShowCreateModal(true);
    };

    const openDetails = (assignment) => {
        setSelectedAssignment(assignment);
        setShowDetailsModal(true);
    };

    const isCR = user?.userType === "CR" || user?.userType === "cr";

    return (
        <div className="assignments-root">
            <Nav />
            <main className="assignments-main">
                <header className="page-header">
                    <h1 className="page-title">Assignments Portal</h1>
                    <p className="page-subtitle">Track, manage, and submit your coursework with ease.</p>
                </header>

                <section className="section-controls">
                    <h2 className="section-title">{isCR ? "Manage Assignments" : "My Assignments"}</h2>
                    {isCR && (
                        <button
                            className="create-btn"
                            onClick={() => {
                                setIsEditing(false);
                                setSelectedAssignment(null);
                                setNewAssignment({ title: "", description: "", dueDate: "", fileData: "", fileName: "" });
                                setShowCreateModal(true);
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Create Assignment
                        </button>
                    )}
                </section>

                {loading ? (
                    <p style={{ textAlign: "center" }}>Loading assignments...</p>
                ) : (
                    <div className="list-container">
                        {assignments.length > 0 ? (
                            assignments.map((assignment) => {
                                const status = getStatus(assignment);
                                return (
                                    <div key={assignment._id} className="assignment-card" onClick={() => openDetails(assignment)} style={{ cursor: "pointer" }}>
                                        <div className="card-header">
                                            <h3 className="card-title">{assignment.title}</h3>
                                            <span className={`status-badge status-${status.toLowerCase()}`}>
                                                {status}
                                            </span>
                                        </div>
                                        <p className="assignment-desc">{assignment.description.length > 100 ? assignment.description.substring(0, 100) + "..." : assignment.description}</p>
                                        <div className="due-date">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                                <line x1="3" y1="10" x2="21" y2="10"></line>
                                            </svg>
                                            Due: {new Date(assignment.dueDate).toLocaleString()}
                                        </div>

                                        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                                            {isCR && (
                                                <>
                                                    <button
                                                        className="action-btn btn-primary"
                                                        onClick={() => openSubmissions(assignment)}
                                                        title="View Submissions"
                                                        style={{ flex: "2" }}
                                                    >
                                                        View Submissions
                                                    </button>
                                                    <button
                                                        className="action-btn btn-edit"
                                                        onClick={() => openEdit(assignment)}
                                                        title="Edit Assignment"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                    </button>
                                                    <button
                                                        className="action-btn btn-delete"
                                                        onClick={() => handleDeleteAssignment(assignment._id)}
                                                        title="Delete Assignment"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                    </button>
                                                </>
                                            )}

                                            {status !== "Submitted" ? (
                                                <button
                                                    className={`action-btn ${isCR ? 'btn-secondary' : 'btn-primary'}`}
                                                    onClick={() => openSubmit(assignment)}
                                                    disabled={status === "Missed"}
                                                >
                                                    {status === "Missed" ? "Deadline Passed" : "Submit Work"}
                                                </button>
                                            ) : (
                                                <button className="action-btn btn-secondary" disabled>
                                                    Already Submitted
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">📋</div>
                                <h3>No assignments yet</h3>
                                <p>Assignments published by the CR will appear here.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* CR Submissions Modal */}
            {showSubmissionsModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close" onClick={() => setShowSubmissionsModal(false)}>&times;</button>
                        <h2 className="section-title">Submissions: {selectedAssignment?.title}</h2>
                        <div className="submission-list">
                            {submissions.length > 0 ? (
                                submissions.map((sub) => (
                                    <div key={sub._id} className="submission-item">
                                        <div className="student-info">
                                            <h5>{sub.studentName}</h5>
                                            <p>{sub.studentEmail}</p>
                                            <p className="submission-date">Submitted on: {new Date(sub.submittedAt).toLocaleString()}</p>
                                        </div>
                                        <a href={sub.fileData} download={sub.fileName} className="download-icon-btn">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                <polyline points="7 10 12 15 17 10"></polyline>
                                                <line x1="12" y1="15" x2="12" y2="3"></line>
                                            </svg>
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <p className="no-submissions">No submissions yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Student Submit Modal */}
            {showSubmitModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close" onClick={() => setShowSubmitModal(false)}>&times;</button>
                        <h2 className="section-title">Submit Assignment</h2>
                        <h4 style={{ marginBottom: "20px", color: "#666" }}>{selectedAssignment?.title}</h4>
                        <form onSubmit={handleSubmitAssignment}>
                            <div className="form-group">
                                <label>Upload your file</label>
                                <input
                                    type="file"
                                    onChange={(e) => handleFileChange(e, "submission")}
                                    required
                                />
                            </div>
                            <button type="submit" className="submit-btn" disabled={!submissionFile.fileData}>
                                Upload & Submit
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* CR Create/Edit Assignment Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close" onClick={() => { setShowCreateModal(false); setIsEditing(false); setNewAssignment({ title: "", description: "", dueDate: "", fileData: "", fileName: "" }); }}>&times;</button>
                        <h2 className="section-title">{isEditing ? "Edit Assignment" : "Create New Assignment"}</h2>
                        <form onSubmit={handleCreateAssignment}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter assignment title"
                                    value={newAssignment.title}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    placeholder="Enter assignment description"
                                    value={newAssignment.description}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                                    required
                                    rows="5"
                                />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                <div className="form-group">
                                    <label>Due Date</label>
                                    <input
                                        type="datetime-local"
                                        value={newAssignment.dueDate}
                                        onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Attach Material (Optional)</label>
                                    <input
                                        type="file"
                                        onChange={(e) => handleFileChange(e, "assignment")}
                                    />
                                    {newAssignment.fileName && <p style={{ fontSize: "12px", marginTop: "5px" }}>{newAssignment.fileName}</p>}
                                </div>
                            </div>
                            <button type="submit" className="submit-btn">
                                {isEditing ? "Update Assignment" : "Publish Assignment"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Assignment Details Modal */}
            {showDetailsModal && selectedAssignment && (
                <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>

                        <header className="details-header">
                            <span className={`status-badge status-${getStatus(selectedAssignment).toLowerCase()}`}>
                                {getStatus(selectedAssignment)}
                            </span>
                            <h2 className="section-title" style={{ marginTop: '15px' }}>{selectedAssignment.title}</h2>
                        </header>

                        <div className="details-body">
                            <div className="details-info">
                                <div className="due-date large">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    Deadline: {new Date(selectedAssignment.dueDate).toLocaleString()}
                                </div>
                                <div className="creator">
                                    <strong>Published by</strong> • {selectedAssignment.createdBy}
                                </div>
                            </div>

                            <div className="description-box">
                                <h4 className="detail-label">Instructions</h4>
                                <p className="full-description">{selectedAssignment.description}</p>
                            </div>

                            {selectedAssignment.fileData && (
                                <div className="material-box">
                                    <h4 className="detail-label">Resource Materials</h4>
                                    <a
                                        href={selectedAssignment.fileData}
                                        download={selectedAssignment.fileName}
                                        className="material-link"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                        Download {selectedAssignment.fileName}
                                    </a>
                                </div>
                            )}

                            <footer className="modal-footer">
                                {getStatus(selectedAssignment) !== "Submitted" ? (
                                    <button
                                        className="submit-btn"
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            openSubmit(selectedAssignment);
                                        }}
                                        disabled={getStatus(selectedAssignment) === "Missed"}
                                    >
                                        {getStatus(selectedAssignment) === "Missed" ? "Deadline Passed" : "Start Submission"}
                                    </button>
                                ) : (
                                    <div className="success-message">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        Assignment Submitted Successfully
                                    </div>
                                )}
                            </footer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AssignmentsPage;
