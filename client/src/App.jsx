import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./LoginPage.jsx";
import SignupPage from "./SignuPage.jsx";
import HomePage from "./HomePage.jsx";
import ChatPage from "./ChatPage.jsx";
import ClassRoutinePage from "./ClassRoutinePage.jsx";
import EditProfilePage from "./EditProfilePage.jsx";
import AttendancePage from "./AttendancePage.jsx";
import ContactPage from "./ContactPage.jsx";
import ChatBotPage from "./ChatBotPage.jsx";
import AnnouncementsPage from "./AnnouncementsPage.jsx";
import ResourcesPage from "./ResourcesPage.jsx";
import ManageAttendancePage from "./ManageAttendancePage.jsx";
import AssignmentsPage from "./AssignmentsPage.jsx";
import PollsPage from "./PollsPage.jsx";

function App() {
  return (
    <Routes>
      {/* first page = signup */}
      <Route path="/" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/chatbot" element={<ChatBotPage />} />
      <Route path="/class-routine" element={<ClassRoutinePage />} />
      <Route path="/attendance" element={<AttendancePage />} />
      <Route path="/manage-attendance" element={<ManageAttendancePage />} />
      <Route path="/assignments" element={<AssignmentsPage />} />
      <Route path="/edit-profile" element={<EditProfilePage />} />
      <Route path="/announcements" element={<AnnouncementsPage />} />
      <Route path="/resources" element={<ResourcesPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/polls" element={<PollsPage />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
