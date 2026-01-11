import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

// Assets
import announcementImg from "./assets/announcement.jpeg";
import routineImg from "./assets/routine.jpeg";
import assignmentsImg from "./assets/assignments.jpeg";
import resourcesImg from "./assets/resources.jpeg";
import chatImg from "./assets/chat.jpeg";
import pollsImg from "./assets/polls.jpeg";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="home-root">
      <Nav />
      {/* Spacer for fixed header */}
      <div style={{ height: '70px' }}></div>

      <main className="home-main">
        <div className="home-card">
          <img src={announcementImg} alt="Announcement" className="home-card-img" />
          <div className="home-card-footer"><span className="home-card-text">Announcement</span></div>
        </div>
        <div className="home-card" onClick={() => navigate("/class-routine")}>
          <img src={routineImg} alt="Class Routines" className="home-card-img" />
          <div className="home-card-footer"><span className="home-card-text">Class Routines</span></div>
        </div>
        <div className="home-card">
          <img src={assignmentsImg} alt="Assignments" className="home-card-img" />
          <div className="home-card-footer"><span className="home-card-text">Assignments</span></div>
        </div>
        <div className="home-card">
          <img src={resourcesImg} alt="Resources" className="home-card-img" />
          <div className="home-card-footer"><span className="home-card-text">Resources</span></div>
        </div>
        <div className="home-card" onClick={() => navigate("/chat")}>
          <img src={chatImg} alt="General Chat" className="home-card-img lighten-img" />
          <div className="home-card-footer"><span className="home-card-text">General Chat</span></div>
        </div>
        <div className="home-card" onClick={() => navigate("/attendance")}>
          <img src={pollsImg} alt="Attendance" className="home-card-img lighten-img" />
          <div className="home-card-footer"><span className="home-card-text">Attendance</span></div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default HomePage;