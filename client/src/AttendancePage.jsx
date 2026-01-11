import React, { useState } from "react";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
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
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    Clock
} from "lucide-react";

export default function AttendancePage() {
    // --- Mock Data --- //
    const stats = [
        { label: "Overall Attendance", value: "87%", icon: TrendingUp, color: "green", count: "Overall Attendance" },
        { label: "Present Days", value: "156", icon: CheckCircle, color: "purple", count: "Present Days" },
        { label: "Absent Days", value: "23", icon: XCircle, color: "red", count: "Absent Days" },
        { label: "Total Classes", value: "179", icon: Calendar, color: "yellow", count: "Total Classes" },
    ];

    const subjects = [
        { name: "Mathematics", attended: 41, total: 45, percent: 92, icon: BookOpen, color: "#d8b4fe" },
        { name: "Physics", attended: 33, total: 38, percent: 88, icon: Beaker, color: "#f0abfc" },
        { name: "English", attended: 30, total: 32, percent: 95, icon: Languages, color: "#5eead4" },
        { name: "Geography", attended: 22, total: 28, percent: 78, icon: Globe, color: "#d6bcfa" },
        { name: "Computer Science", attended: 32, total: 35, percent: 90, icon: Code, color: "#9da3fa" },
        { name: "Art & Design", attended: 17, total: 20, percent: 85, icon: Palette, color: "#fbbf24" },
    ];

    const recentActivity = [
        { date: "1 Wed", subject: "Mathematics", time: "9:00 AM", status: "Present", color: "green" },
        { date: "1 Wed", subject: "Physics", time: "11:00 AM", status: "Present", color: "green" },
        { date: "31 Tue", subject: "English", time: "10:15 AM", status: "Late", color: "yellow" },
        { date: "31 Tue", subject: "Computer Science", time: "2:00 PM", status: "Present", color: "green" },
        { date: "30 Mon", subject: "Geography", time: "9:00 AM", status: "Absent", color: "red" },
        { date: "30 Mon", subject: "Art & Design", time: "3:00 PM", status: "Present", color: "green" },
    ];

    // Calendar Grid Generation (Simple Mock for Jan 2026)
    // Starting blank days + 31 days
    const calendarDays = [
        { day: "", status: "" }, { day: "", status: "" }, { day: "", status: "" }, { day: "", status: "" }, // padding
        { day: 1, status: "present" }, { day: 2, status: "present" }, { day: 3, status: "present" },
        { day: 4, status: "holiday" }, { day: 5, status: "holiday" },
        { day: 6, status: "present" }, { day: 7, status: "late" }, { day: 8, status: "present" }, { day: 9, status: "absent" }, { day: 10, status: "present" },
        { day: 11, status: "holiday" }, { day: 12, status: "holiday" },
        { day: 13, status: "present" }, { day: 14, status: "present" }, { day: 15, status: "present" }, { day: 16, status: "present" }, { day: 17, status: "absent" },
        { day: 18, status: "holiday" }, { day: 19, status: "holiday" },
        { day: 20, status: "present" }, { day: 21, status: "present" }, { day: 22, status: "late" }, { day: 23, status: "present" }, { day: 24, status: "present" },
        { day: 25, status: "holiday" }, { day: 26, status: "holiday" },
        { day: 27, status: "present" }, { day: 28, status: "present" }, { day: 29, status: "present" }, { day: 30, status: "present" }, { day: 31, status: "present" },
    ];

    return (
        <div className="att-page">
            <Nav />
            <div className="att-container">
                {/* Header */}
                <div className="att-header">
                    <div className="att-title-icon">
                        {/* User Icon placeholder */}
                        <div className="att-user-icon"><TrendingUp size={24} color="white" /></div>
                    </div>
                    <div>
                        <h1>Attendance Dashboard</h1>
                        <p>Track your class attendance and stay on top of your progress</p>
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
                            <p>{stat.count}</p>
                        </div>
                    ))}
                </div>

                <div className="att-main-grid">
                    {/* Left Column: Subjects */}
                    <div className="att-content-col">
                        <div className="att-card att-subjects">
                            <h3>Subject-wise Attendance</h3>

                            <div className="att-subject-list">
                                {subjects.map((sub, i) => (
                                    <div className="att-subject-item" key={i}>
                                        <div className="att-sub-icon" style={{ backgroundColor: sub.color + '40' }}>
                                            <sub.icon size={20} color={sub.color} />
                                        </div>
                                        <div className="att-sub-info">
                                            <div className="att-sub-header">
                                                <h4>{sub.name}</h4>
                                                <span>{sub.percent}%</span>
                                            </div>
                                            <div className="att-progress-bg">
                                                <div
                                                    className="att-progress-fill"
                                                    style={{ width: `${sub.percent}%`, backgroundColor: sub.percent >= 90 ? '#10b981' : sub.percent >= 75 ? '#8b5cf6' : '#ef4444' }}
                                                />
                                            </div>
                                            <p className="att-sub-meta">{sub.attended} / {sub.total} classes attended</p>
                                        </div>
                                    </div>
                                ))}
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
                                    <ChevronLeft size={16} />
                                    <span>January 2026</span>
                                    <ChevronRight size={16} />
                                </div>
                            </div>

                            <div className="att-calendar-grid">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                    <div className="att-cal-day-name" key={d}>{d}</div>
                                ))}
                                {calendarDays.map((d, i) => (
                                    <div key={i} className={`att-cal-cell ${d.status}`}>
                                        {d.day}
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
                                {recentActivity.map((item, i) => (
                                    <div className="att-recent-item" key={i}>
                                        <div className="att-recent-date">
                                            <span className="date-num">{item.date.split(' ')[0]}</span>
                                            <span className="date-day">{item.date.split(' ')[1]}</span>
                                        </div>
                                        <div className="att-recent-info">
                                            <h4>{item.subject}</h4>
                                            <span className="att-time"><Clock size={12} /> {item.time}</span>
                                        </div>
                                        <div className={`att-status-badge ${item.status.toLowerCase()}`}>
                                            {item.status === "Present" && <CheckCircle size={14} />}
                                            {item.status === "Absent" && <XCircle size={14} />}
                                            {item.status === "Late" && <Clock size={14} />}
                                            {item.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
