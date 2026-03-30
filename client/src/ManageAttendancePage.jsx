import React, { useState, useEffect } from "react";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ManageAttendancePage.css";
import {
    Plus,
    User as UserIcon,
    Save,
    X,
    ChevronLeft,
    BookOpen,
    Beaker,
    Languages,
    Globe,
    Code,
    Palette,
    CheckCircle,
    XCircle,
    Clock
} from "lucide-react";

export default function ManageAttendancePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
    const [allStudents, setAllStudents] = useState([]);
    const [markingSubject, setMarkingSubject] = useState("Mathematics");
    const [markingDate, setMarkingDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceList, setAttendanceList] = useState([]);
    const [loading, setLoading] = useState(true);

    const availableSubjects = [
        "Mathematics", "Physics", "English", "Geography", "Computer Science", "Art & Design"
    ];

    useEffect(() => {
        // Redirect students
        if (user.userType !== "CR" && user.userType !== "cr") {
            navigate("/attendance");
            return;
        }
        fetchAllStudents();
    }, [user.email, navigate]);

    const fetchAllStudents = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:5000/api/users");
            setAllStudents(res.data);
            setAttendanceList(res.data.map(student => ({
                studentId: student._id,
                email: student.email,
                fullName: student.fullName,
                status: "Present"
            })));
        } catch (err) {
            console.error("Error fetching students:", err);
            alert("Failed to load student list.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = (email) => {
        setAttendanceList(prev => prev.map(item => {
            if (item.email === email) {
                const nextStatus = item.status === "Present" ? "Absent" : item.status === "Absent" ? "Late" : "Present";
                return { ...item, status: nextStatus };
            }
            return item;
        }));
    };

    const saveAttendance = async () => {
        try {
            await axios.post("http://localhost:5000/api/attendance", {
                subject: markingSubject,
                date: markingDate,
                attendanceRecords: attendanceList,
                markedBy: user.email
            });
            alert("Attendance marked successfully!");
            navigate("/attendance");
        } catch (err) {
            console.error("Save error:", err);
            alert("Failed to save attendance.");
        }
    };

    const getSubjectIcon = (name) => {
        switch (name) {
            case "Mathematics": return BookOpen;
            case "Physics": return Beaker;
            case "English": return Languages;
            case "Geography": return Globe;
            case "Computer Science": return Code;
            case "Art & Design": return Palette;
            default: return BookOpen;
        }
    };

    const Icon = getSubjectIcon(markingSubject);

    if (loading) return <div className="loading-state">Loading students...</div>;

    return (
        <div className="manage-att-page">
            <Nav />
            <div className="manage-att-container">
                <header className="manage-att-header">
                    <button className="back-btn" onClick={() => navigate("/attendance")}>
                        <ChevronLeft size={20} /> Back to Dashboard
                    </button>
                    <div className="header-title">
                        <h1>Manage Classroom Attendance</h1>
                        <p>Record and update student attendance per subject</p>
                    </div>
                </header>

                <div className="manage-att-grid">
                    {/* Left Panel: Configuration */}
                    <div className="manage-panel config-panel">
                        <h3>Session Configuration</h3>
                        <div className="config-form">
                            <div className="config-group">
                                <label>Select Subject</label>
                                <div className="subject-selector">
                                    {availableSubjects.map(sub => (
                                        <button
                                            key={sub}
                                            className={`sub-btn ${markingSubject === sub ? 'active' : ''}`}
                                            onClick={() => setMarkingSubject(sub)}
                                        >
                                            {sub}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="config-group">
                                <label>Session Date</label>
                                <input
                                    type="date"
                                    value={markingDate}
                                    onChange={(e) => setMarkingDate(e.target.value)}
                                    className="date-input"
                                />
                            </div>
                        </div>

                        <div className="marking-summary">
                            <div className="summary-card">
                                <span>Present</span>
                                <span className="val green">{attendanceList.filter(s => s.status === "Present").length}</span>
                            </div>
                            <div className="summary-card">
                                <span>Absent</span>
                                <span className="val red">{attendanceList.filter(s => s.status === "Absent").length}</span>
                            </div>
                            <div className="summary-card">
                                <span>Late</span>
                                <span className="val yellow">{attendanceList.filter(s => s.status === "Late").length}</span>
                            </div>
                        </div>

                        <button className="submit-att-btn" onClick={saveAttendance}>
                            <Save size={20} /> Save Attendance Records
                        </button>
                    </div>

                    {/* Right Panel: Student List */}
                    <div className="manage-panel students-panel">
                        <div className="panel-header">
                            <h3>Student List ({attendanceList.length})</h3>
                            <div className="batch-actions">
                                <span>Marking for {markingSubject}</span>
                                <Icon size={20} color="#8b5cf6" />
                            </div>
                        </div>

                        <div className="manage-student-list">
                            {attendanceList.map((student) => (
                                <div className="manage-student-item" key={student.email}>
                                    <div className="student-info">
                                        <div className="avatar">
                                            <UserIcon size={18} />
                                        </div>
                                        <div className="name-email">
                                            <span className="name">{student.fullName} {student.email === user.email && "(CR)"}</span>
                                            <span className="email">{student.email}</span>
                                        </div>
                                    </div>
                                    <div className="status-actions">
                                        <button
                                            className={`status-chip ${student.status.toLowerCase()}`}
                                            onClick={() => handleStatusToggle(student.email)}
                                        >
                                            {student.status === "Present" && <CheckCircle size={14} />}
                                            {student.status === "Absent" && <XCircle size={14} />}
                                            {student.status === "Late" && <Clock size={14} />}
                                            {student.status}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
