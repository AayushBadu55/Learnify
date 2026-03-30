import React, { useState, useEffect } from "react";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AttendancePage.css";
import {
    TrendingUp,
    CheckCircle,
    XCircle,
    Calendar,
    BookOpen,
    Beaker,
    Languages,
    Globe,
    Code,
    Palette,
    ChevronLeft,
    ChevronRight,
    Clock,
    Plus
} from "lucide-react";

export default function AttendancePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
    const [stats, setStats] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [calendarData, setCalendarData] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        fetchData();
    }, [user.email]);

    useEffect(() => {
        generateCalendar(currentMonth);
    }, [currentMonth, recentActivity]);

    const fetchData = async () => {
        try {
            const summaryRes = await axios.get(`http://localhost:5000/api/attendance/summary/${user.email}`);
            setSubjects(summaryRes.data);

            const recentRes = await axios.get(`http://localhost:5000/api/attendance/${user.email}`);
            setRecentActivity(recentRes.data.slice(0, 6));

            // Calculate overall stats
            const totalAttended = summaryRes.data.reduce((acc, sub) => acc + sub.attended, 0);
            const totalClasses = summaryRes.data.reduce((acc, sub) => acc + sub.total, 0);
            const overallPercent = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;
            const absentCount = totalClasses - totalAttended;

            setStats([
                { label: "Overall Attendance", value: `${overallPercent}%`, icon: TrendingUp, color: "green" },
                { label: "Present Days", value: totalAttended.toString(), icon: CheckCircle, color: "purple" },
                { label: "Absent Days", value: absentCount.toString(), icon: XCircle, color: "red" },
                { label: "Total Classes", value: totalClasses.toString(), icon: Calendar, color: "yellow" },
            ]);
        } catch (err) {
            console.error("Error fetching attendance data:", err);
        }
    };

    const generateCalendar = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Padding for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push({ day: "", status: "", isHoliday: false });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const currentDayDate = new Date(year, month, i);
            const isSaturday = currentDayDate.getDay() === 6; // Saturday is holiday

            // Group sessions by date
            const dateStr = currentDayDate.toISOString().split('T')[0];
            const sessions = recentActivity
                .filter(a => new Date(a.date).toISOString().split('T')[0] === dateStr)
                .map(a => ({
                    subject: a.subject,
                    status: a.status.toLowerCase()
                }));

            days.push({ day: i, sessions, isHoliday: isSaturday });
        }
        setCalendarData(days);
    };

    const handleMonthChange = (direction) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(currentMonth.getMonth() + direction);
        setCurrentMonth(newDate);
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

    return (
        <div className="att-page">
            <Nav />
            <div className="att-container">
                {/* Header */}
                <div className="att-header">
                    <div className="att-title-icon">
                        <TrendingUp size={24} color="white" />
                    </div>
                    <div className="att-header-content">
                        <div>
                            <h1>Attendance Dashboard</h1>
                            <p>Track your class attendance and stay on top of your progress</p>
                        </div>
                        {(user.userType === "CR" || user.userType === "cr") && (
                            <button className="mark-att-btn" onClick={() => navigate("/manage-attendance")}>
                                <Plus size={18} /> Manage Attendance
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Row */}
                <div className="att-stats-row">
                    {stats.map((stat, i) => (
                        <div className="att-stat-card" key={i}>
                            <div className={`att-stat-icon icon-${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <h2>{stat.value}</h2>
                            <p>{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="att-main-grid">
                    {/* Left Column: Subjects */}
                    <div className="att-content-col">
                        <div className="att-card att-subjects">
                            <h3>Subject-wise Attendance</h3>
                            <div className="att-subject-list">
                                {subjects.length > 0 ? subjects.map((sub, i) => {
                                    const Icon = getSubjectIcon(sub.name);
                                    return (
                                        <div className="att-subject-item" key={i}>
                                            <div className="att-sub-icon">
                                                <Icon size={20} color="#8b5cf6" />
                                            </div>
                                            <div className="att-sub-info">
                                                <div className="att-sub-header">
                                                    <h4>{sub.name}</h4>
                                                    <span>{sub.percent}%</span>
                                                </div>
                                                <div className="att-progress-bg">
                                                    <div
                                                        className="att-progress-fill"
                                                        style={{ width: `${sub.percent}%`, backgroundColor: sub.percent >= 80 ? '#10b981' : sub.percent >= 60 ? '#f59e0b' : '#ef4444' }}
                                                    />
                                                </div>
                                                <p className="att-sub-meta">{sub.attended} / {sub.total} classes attended</p>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <p className="no-data">No attendance data available yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Calendar & Recent */}
                    <div className="att-content-col">
                        {/* Calendar */}
                        <div className="att-card att-calendar-card">
                            <div className="att-cal-header">
                                <h3>Attendance Calendar</h3>
                                <div className="att-cal-nav">
                                    <button onClick={() => handleMonthChange(-1)}><ChevronLeft size={16} /></button>
                                    <span>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                                    <button onClick={() => handleMonthChange(1)}><ChevronRight size={16} /></button>
                                </div>
                            </div>

                            <div className="att-calendar-grid">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                    <div className="att-cal-day-name" key={d}>{d}</div>
                                ))}
                                {calendarData.map((d, i) => (
                                    <div key={i} className={`att-cal-cell ${d.isHoliday ? 'holiday' : ''}`}>
                                        <span className="cal-day-num">{d.day}</span>
                                        {d.sessions && d.sessions.length > 0 && (
                                            <div className="att-cal-sessions-dots">
                                                {d.sessions.map((s, idx) => (
                                                    <span
                                                        key={idx}
                                                        className={`att-dot-micro ${s.status}`}
                                                        title={`${s.subject}: ${s.status}`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="att-cal-legend">
                                <div className="legend-item"><span className="dot present"></span> Present</div>
                                <div className="legend-item"><span className="dot absent"></span> Absent</div>
                                <div className="legend-item"><span className="dot late"></span> Late</div>
                                <div className="legend-item"><span className="dot holiday"></span> Holiday</div>
                            </div>
                        </div>

                        {/* Recent Attendance */}
                        <div className="att-card att-recent-card">
                            <div className="att-recent-header">
                                <h3>Recent Attendance</h3>
                                <button>View All</button>
                            </div>

                            <div className="att-recent-list">
                                {recentActivity.length > 0 ? recentActivity.map((item, i) => (
                                    <div className="att-recent-item" key={i}>
                                        <div className="att-recent-date">
                                            <span className="date-num">{new Date(item.date).getDate()}</span>
                                            <span className="date-day">{new Date(item.date).toLocaleString('default', { weekday: 'short' })}</span>
                                        </div>
                                        <div className="att-recent-info">
                                            <h4>{item.subject}</h4>
                                            <span className="att-time"><Clock size={12} /> {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className={`att-status-badge ${item.status.toLowerCase()}`}>
                                            {item.status === "Present" && <CheckCircle size={14} />}
                                            {item.status === "Absent" && <XCircle size={14} />}
                                            {item.status === "Late" && <Clock size={14} />}
                                            {item.status}
                                        </div>
                                    </div>
                                )) : (
                                    <p className="no-data">No recent activity.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
