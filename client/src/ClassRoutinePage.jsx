import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import RoutineEditModal from "./components/RoutineEditModal.jsx";
import "./ClassRoutinePage.css";
import {
  Calendar,
  Edit3,
  UploadCloud,
  Download,
  Clock,
  MapPin,
  User as UserIcon,
  ChevronDown
} from "lucide-react";

export default function ClassRoutinePage() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || {});
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchRoutine();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchRoutine = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/routine");
      setRoutine(res.data);
    } catch (err) {
      console.error("Error fetching routine:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoutine = async (updatedData) => {
    try {
      await axios.post("http://localhost:5000/api/routine", {
        ...updatedData,
        lastUpdatedBy: user.email
      });
      setShowEditModal(false);
      fetchRoutine();
    } catch (err) {
      alert("Failed to save routine");
    }
  };

  const isOngoing = (startTime, endTime, dayName) => {
    const now = currentTime;
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    if (currentDay !== dayName) return false;

    const parseTime = (timeStr) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      const d = new Date(now);
      d.setHours(hours, parseInt(minutes || 0), 0, 0);
      return d;
    };

    const start = parseTime(startTime);
    const end = parseTime(endTime);
    return now >= start && now <= end;
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');

    // Add Title
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text(`Class Routine - ${routine.semester}`, 14, 20);

    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 28);

    const tableHeaders = [["Time", ...days]];
    const timeSlots = ["10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM"];

    const tableBody = timeSlots.map((time, idx) => {
      const timeRange = `${time} - ${idx < 4 ? ["11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM"][idx] : "3:00 PM"}`;

      if (time === "11:00 AM") {
        return [timeRange, { content: 'BREAK', colSpan: days.length, styles: { halign: 'center', fillColor: [248, 250, 252] } }];
      }

      const row = [timeRange];
      days.forEach(day => {
        const dayData = routine.days.find(d => d.name === day);
        const slot = dayData?.slots.find(s => s.startTime === time);
        if (slot) {
          row.push(`${slot.subjectCode}\n${slot.subject}\n${slot.teacher}\n${slot.room}`);
        } else {
          row.push("");
        }
      });
      return row;
    });

    autoTable(doc, {
      startY: 35,
      head: tableHeaders,
      body: tableBody,
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontSize: 10, halign: 'center' },
      bodyStyles: { fontSize: 9, cellPadding: 5, valign: 'middle', halign: 'center' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 35 },
      theme: 'grid'
    });

    doc.save(`Class_Routine_${routine.semester.replace(/\s+/g, '_')}.pdf`);
  };

  if (loading) return <div className="loading-state">Loading Class Routine...</div>;
  if (!routine) return <div className="error-state">No routine found. Click "Edit Routine" to create one.</div>;

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Sort slots by time for each day
  const sortedDays = routine.days.sort((a, b) => days.indexOf(a.name) - days.indexOf(b.name));

  return (
    <div className="routine-page">
      <Nav />
      <div className="routine-container">
        <header className="routine-header">
          <div>
            <h1>Class Routine</h1>
            <p>View and manage the weekly class schedule.</p>
          </div>
        </header>

        <div className="routine-actions-bar">
          <div className="action-buttons">
            {(user.userType === "CR" || user.userType === "cr") && (
              <button className="edit-btn-orange" onClick={() => setShowEditModal(true)}>
                <Edit3 size={18} /> Edit Routine
              </button>
            )}
          </div>
        </div>

        <div className="routine-card">
          <div className="card-header">
            <Calendar size={20} className="header-icon" />
            <h2>Routine Schedule</h2>
          </div>

          <div className="routine-table-wrapper">
            <table className="routine-table">
              <thead>
                <tr>
                  <th className="time-col">Time \ Day</th>
                  {days.map(day => (
                    <th key={day}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* We'll use a standardized set of time slots from seeded data or commonly used ones */}
                {["10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM"].map((time, idx) => {
                  const isBreakTime = time === "11:00 AM";
                  return (
                    <tr key={idx}>
                      <td className="time-label">
                        {time} — {idx < 4 ? ["11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM"][idx] : "3:00 PM"}
                      </td>
                      {isBreakTime ? (
                        <td className="break-cell" colSpan={days.length}>Break</td>
                      ) : (
                        days.map(day => {
                          const dayData = routine.days.find(d => d.name === day);
                          const slot = dayData?.slots.find(s => s.startTime === time);

                          if (!slot) return <td key={day} className="empty-cell"></td>;

                          const ongoing = isOngoing(slot.startTime, slot.endTime, day);

                          return (
                            <td key={day} className={`slot-cell`}>
                              <div className={`class-card ${slot.color || 'blue'} ${ongoing ? 'ongoing' : ''}`}>
                                <div className="card-top">
                                  <span className="subject-code">{slot.subjectCode}</span>
                                  {ongoing && <span className="ongoing-badge">Ongoing</span>}
                                </div>
                                <h4 className="subject-name">{slot.subject}</h4>
                                <div className="card-meta">
                                  <span><UserIcon size={12} /> {slot.teacher}</span>
                                  <span><MapPin size={12} /> {slot.room}</span>
                                </div>
                              </div>
                            </td>
                          );
                        })
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <footer className="routine-card-footer">
            <button className="download-pdf-btn" onClick={handleDownloadPDF}>
              <Download size={18} /> Download Routine (PDF)
            </button>
            <div className="last-updated">
              Last Updated by CR {routine.lastUpdatedBy?.split('@')[0] || "System"} — {new Date(routine.updatedAt).toLocaleDateString()} — {new Date(routine.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </footer>
        </div>
      </div>
      {showEditModal && (
        <RoutineEditModal
          routine={routine}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveRoutine}
        />
      )}
      <Footer />
    </div>
  );
}
