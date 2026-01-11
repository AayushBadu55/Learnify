import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ClassRoutinePage.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

function ClassRoutinePage() {
  const navigate = useNavigate();
  const [currentWeek, setCurrentWeek] = useState(new Date(2026, 0, 1));

  const formatWeekDate = (date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(startOfWeek.setDate(diff));
    return monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const timeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 4 : today - 1; // Convert Sunday=0 to Monday=0

  const scheduleData = {
    Monday: [
      { time: "8:00 AM", subject: "Mathematics", instructor: "Dr. Smith", location: "Room 101", type: "Lecture" },
      { time: "9:00 AM", subject: "Mathematics", instructor: "Dr. Smith", location: "Room 101", type: "Lecture" },
      { time: "10:00 AM", subject: "Physics", instructor: "Prof. Johnson", location: "Lab 201", type: "Lab" },
      { time: "11:00 AM", subject: "Physics", instructor: "Prof. Johnson", location: "Lab 201", type: "Lab" },
      { time: "1:00 PM", subject: "Computer Science", instructor: "Ms. Davis", location: "Room 305", type: "Lecture" },
      { time: "2:00 PM", subject: "Computer Science", instructor: "Ms. Davis", location: "Room 305", type: "Lecture" },
    ],
    Tuesday: [
      { time: "9:00 AM", subject: "English Literature", instructor: "Mr. Wilson", location: "Room 102", type: "Lecture" },
      { time: "10:00 AM", subject: "English Literature", instructor: "Mr. Wilson", location: "Room 102", type: "Lecture" },
      { time: "11:00 AM", subject: "Chemistry", instructor: "Dr. Brown", location: "Lab 202", type: "Lab" },
      { time: "2:00 PM", subject: "Mathematics", instructor: "Dr. Smith", location: "Room 101", type: "Tutorial" },
      { time: "3:00 PM", subject: "Mathematics", instructor: "Dr. Smith", location: "Room 101", type: "Tutorial" },
    ],
    Wednesday: [
      { time: "8:00 AM", subject: "Physics", instructor: "Prof. Johnson", location: "Room 103", type: "Lecture" },
      { time: "9:00 AM", subject: "Physics", instructor: "Prof. Johnson", location: "Room 103", type: "Lecture" },
      { time: "11:00 AM", subject: "Computer Science", instructor: "Ms. Davis", location: "Lab 301", type: "Lab" },
      { time: "12:00 PM", subject: "Computer Science", instructor: "Ms. Davis", location: "Lab 301", type: "Lab" },
      { time: "2:00 PM", subject: "Biology", instructor: "Dr. Green", location: "Room 104", type: "Lecture" },
    ],
    Thursday: [
      { time: "9:00 AM", subject: "Chemistry", instructor: "Dr. Brown", location: "Room 105", type: "Lecture" },
      { time: "10:00 AM", subject: "Chemistry", instructor: "Dr. Brown", location: "Room 105", type: "Lecture" },
      { time: "12:00 PM", subject: "English Literature", instructor: "Mr. Wilson", location: "Room 102", type: "Tutorial" },
      { time: "1:00 PM", subject: "Biology", instructor: "Dr. Green", location: "Lab 203", type: "Lab" },
      { time: "2:00 PM", subject: "Biology", instructor: "Dr. Green", location: "Lab 203", type: "Lab" },
    ],
    Friday: [
      { time: "8:00 AM", subject: "Mathematics", instructor: "Dr. Smith", location: "Room 101", type: "Lecture" },
      { time: "10:00 AM", subject: "Physics", instructor: "Prof. Johnson", location: "Room 103", type: "Tutorial" },
      { time: "11:00 AM", subject: "Computer Science", instructor: "Ms. Davis", location: "Room 305", type: "Lecture" },
      { time: "1:00 PM", subject: "Chemistry", instructor: "Dr. Brown", location: "Room 105", type: "Tutorial" },
    ],
  };

  const getClassTypeColor = (type) => {
    switch (type) {
      case "Lecture": return "#8545ff";
      case "Lab": return "#b08ae2";
      case "Tutorial": return "#999";
      default: return "#8545ff";
    }
  };

  const getClassTypeBg = (type) => {
    switch (type) {
      case "Lecture": return "#8545ff";
      case "Lab": return "#b08ae2";
      case "Tutorial": return "#999";
      default: return "#8545ff";
    }
  };

  const getClassForTimeSlot = (day, time) => {
    return scheduleData[day]?.find(cls => cls.time === time);
  };

  const isMultiHourClass = (day, time) => {
    const currentClass = getClassForTimeSlot(day, time);
    if (!currentClass) return false;

    const currentIndex = timeSlots.indexOf(time);
    if (currentIndex === -1 || currentIndex === timeSlots.length - 1) return false;

    const nextTime = timeSlots[currentIndex + 1];
    const nextClass = getClassForTimeSlot(day, nextTime);

    return nextClass && nextClass.subject === currentClass.subject && nextClass.instructor === currentClass.instructor;
  };

  const shouldSkipCell = (day, time) => {
    const currentIndex = timeSlots.indexOf(time);
    if (currentIndex === 0) return false;

    const prevTime = timeSlots[currentIndex - 1];
    return isMultiHourClass(day, prevTime);
  };

  const classesToday = scheduleData[days[todayIndex]]?.length || 0;
  const nextBreak = "12:00 PM";
  const totalHours = 24;
  const labSessions = Object.values(scheduleData).flat().filter(cls => cls.type === "Lab").length;

  return (
    <div className="routine-root">
      <Nav />
      {/* Spacer for fixed header */}
      <div style={{ height: '70px' }}></div>


      <main className="routine-main">
        <div className="routine-date-selector-wrapper">
          <div className="routine-date-selector">
            <button className="date-arrow" onClick={handlePreviousWeek}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <span className="date-text">Week of {formatWeekDate(currentWeek)}</span>
            <button className="date-arrow" onClick={handleNextWeek}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <div className="routine-title-section">
          <h1 className="routine-title">Class Routine</h1>
          <p className="routine-subtitle">Your weekly schedule at a glance</p>
        </div>

        <div className="routine-legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: "#8545ff" }}></div>
            <span>Lecture</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: "#b08ae2" }}></div>
            <span>Lab</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: "#999" }}></div>
            <span>Tutorial</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ backgroundColor: "#6b3ac7" }}></div>
            <span>Current class</span>
          </div>
        </div>

        <div className="routine-schedule-container">
          <table className="routine-schedule-table">
            <thead>
              <tr>
                <th className="time-column">Time</th>
                {days.map((day, index) => (
                  <th key={day} className={index === todayIndex ? "day-column today" : "day-column"}>
                    {day}
                    {index === todayIndex && <span className="today-badge">Today</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time, timeIndex) => (
                <tr key={time}>
                  <td className="time-cell">{time}</td>
                  {days.map((day, dayIndex) => {
                    const isToday = dayIndex === todayIndex;

                    if (shouldSkipCell(day, time)) {
                      return null;
                    }

                    const classItem = getClassForTimeSlot(day, time);
                    const rowSpan = isMultiHourClass(day, time) ? 2 : 1;

                    if (!classItem) {
                      return (
                        <td
                          key={`${day}-${time}`}
                          className={`schedule-cell ${isToday ? "today-cell" : ""}`}
                        >
                        </td>
                      );
                    }

                    return (
                      <td
                        key={`${day}-${time}`}
                        className={`schedule-cell class-block ${isToday ? "today-cell" : ""}`}
                        rowSpan={rowSpan}
                        style={{ backgroundColor: getClassTypeColor(classItem.type) }}
                      >
                        <div className="class-content">
                          <div className="class-subject">{classItem.subject}</div>
                          <div className="class-instructor">{classItem.instructor}</div>
                          <div className="class-location">{classItem.location}</div>
                          <div className="class-type-badge" style={{ backgroundColor: getClassTypeBg(classItem.type) }}>
                            {classItem.type}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="routine-stats">
          <div className="stat-card">
            <div className="stat-value">{classesToday}</div>
            <div className="stat-label">Classes Today</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{nextBreak}</div>
            <div className="stat-label">Next Break</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalHours}h/week</div>
            <div className="stat-label">Total Hours</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{labSessions}</div>
            <div className="stat-label">Lab Sessions</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ClassRoutinePage;

