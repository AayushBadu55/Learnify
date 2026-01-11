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
      <Route path="/edit-profile" element={<EditProfilePage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
