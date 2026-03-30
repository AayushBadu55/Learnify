import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import "./LoginPage.css";
import illustration from "./assets/signup-illustration.png";
import Toast from "./components/Toast";

export default function LoginPage() {
  const navigate = useNavigate();

  // State to manage input fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // New: Toggle password visibility
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // Your backend API URL
  const BACKEND_URL = "http://localhost:5000/api/auth";

  // --- Handlers for Forgot Password Steps --- //

  // Step 1: Send OTP
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    setIsForgotLoading(true);
    setForgotMessage("");
    try {
      const res = await fetch(`${BACKEND_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();

      if (res.ok) {
        // BACKEND RETURNED OTP. NOW SEND VIA EMAILJS
        // Keys from SignupPage
        const SERVICE_ID = "service_pbt1v7a";
        const TEMPLATE_ID = "template_7tzoppe";
        const PUBLIC_KEY = "0EVg7nfiW75cPDvtm";

        const templateParams = {
          email: forgotEmail,
          passcode: data.otp, // The OTP returned from backend
          time: "10 minutes",
          user_name: data.userName || "User",
        };

        await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);

        setForgotStep(2);
        setForgotMessage("OTP sent to your email!");
      } else {
        setForgotMessage(data.message || "Failed to generate OTP");
      }
    } catch (err) {
      setForgotMessage("Error: " + (err.text || err.message || "Server error"));
      console.error("Forgot Password Error:", err);
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleForgotOtpSubmit = async (e) => {
    e.preventDefault();
    setIsForgotLoading(true);
    setForgotMessage("");
    try {
      const res = await fetch(`${BACKEND_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp: forgotOtp }),
      });
      const data = await res.json();
      if (res.ok) {
        setForgotStep(3);
        setForgotMessage("");
      } else {
        setForgotMessage(data.message || "Invalid OTP");
      }
    } catch (err) {
      setForgotMessage("Server error");
    } finally {
      setIsForgotLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleForgotResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setForgotMessage("Passwords do not match");
      return;
    }
    setIsForgotLoading(true);
    setForgotMessage("");
    try {
      const res = await fetch(`${BACKEND_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, otp: forgotOtp, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: "Password Reset Successful! Please Login.", type: "success" });
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotStep(1);
          setForgotEmail("");
          setForgotOtp("");
          setNewPassword("");
          setConfirmPassword("");
        }, 2000);
      } else {
        setForgotMessage(data.message || "Reset Failed");
      }
    } catch (err) {
      setForgotMessage("Server error");
    } finally {
      setIsForgotLoading(false);
    }
  };

  // --- End Handlers -- //

  const handleLogin = async (e) => {
    // Prevent page reload on form submit
    e.preventDefault();

    if (!email || !password) {
      setToast({ message: "Please enter both email and password.", type: "warning" });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Send login request to MongoDB backend
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 2. Success: Save user info to LocalStorage and redirect
        // We save the user name so we can display it on the HomePage
        localStorage.setItem("user", JSON.stringify(data.user));

        setToast({ message: `Welcome back, ${data.user.name}!`, type: "success" });
        setTimeout(() => navigate("/home"), 1500);
      } else {
        // 3. Failure: Show error message from backend (e.g., "Invalid credentials")
        setToast({ message: data.message || "Login failed. Please check your credentials.", type: "error" });
      }
    } catch (err) {
      console.error("Login error:", err);
      setToast({ message: "Server error. Please make sure your backend is running.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="lg-root">
      {/* Background blobs */}
      <div className="lg-blob lg-blob-1" />
      <div className="lg-blob lg-blob-2" />
      <div className="lg-blob lg-blob-3" />

      <div className="lg-wrap">
        {/* LEFT SIDE: Branding and Illustration */}
        <div className="lg-left">
          <h1 className="lg-brand">Learnnify</h1>
          <p className="lg-tagline">
            A Classroom <br /> Beyond the <br /> walls
          </p>
          <img
            className="lg-ill"
            src={illustration}
            alt="illustration"
            draggable="false"
          />
        </div>

        {/* RIGHT SIDE: Login Card */}
        <div className="lg-card">
          <h2 className="lg-title">Login</h2>
          <p className="lg-quote">
            “Welcome! Log in to continue your learning journey.”
          </p>

          <form onSubmit={handleLogin}>
            {/* Email Input Field */}
            <div className="lg-field">
              <input
                className="lg-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="lg-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M4 6h16v12H4z" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </span>
            </div>

            {/* Password Input Field */}
            <div className="lg-field">
              <input
                className="lg-input"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="lg-icon"
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: "pointer" }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  /* Eye Off Icon */
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  /* Eye Icon */
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </span>
            </div>

            {/* Submit Button */}
            <div className="lg-forgot">
              <button type="button" onClick={() => setShowForgotModal(true)} style={{ background: 'none', border: 'none', color: '#8545ff', cursor: 'pointer', padding: 0, fontSize: '14px', fontWeight: 500 }}>Forgot Password?</button>
            </div>

            <button className="lg-btn" type="submit" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Log in"}
            </button>

            <div className="lg-signup-redirect">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </div>
          </form>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="modal-overlay">
          <div className="modal-content lg-card" style={{ maxWidth: '450px', padding: '40px', background: 'white', borderRadius: '20px', margin: 'auto' }}>
            {/* Close Button */}
            <button className="modal-close" onClick={() => { setShowForgotModal(false); setForgotStep(1); setForgotMessage(""); }}>×</button>

            <h2 className="lg-title" style={{ fontSize: '24px', textAlign: 'center' }}>
              {forgotStep === 1 ? "Reset Password" : forgotStep === 2 ? "Verify OTP" : "New Password"}
            </h2>
            <p className="lg-quote" style={{ textAlign: 'center', marginBottom: '20px' }}>
              {forgotStep === 1 && "Enter your email to receive a code."}
              {forgotStep === 2 && `Enter the code sent to ${forgotEmail}`}
              {forgotStep === 3 && "Create a secure password."}
            </p>

            <form onSubmit={forgotStep === 1 ? handleForgotEmailSubmit : forgotStep === 2 ? handleForgotOtpSubmit : handleForgotResetSubmit}>

              {/* STEP 1: EMAIL */}
              {forgotStep === 1 && (
                <div className="lg-field">
                  <div className="lg-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
                  <input
                    type="email"
                    className="lg-input"
                    placeholder="Email Address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* STEP 2: OTP */}
              {forgotStep === 2 && (
                <div className="lg-field">
                  <div className="lg-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                  <input
                    type="text"
                    className="lg-input"
                    placeholder="Enter 6-digit OTP"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    required
                    maxLength="6"
                  />
                </div>
              )}

              {/* STEP 3: NEW PASSWORD */}
              {forgotStep === 3 && (
                <>
                  <div className="lg-field">
                    <div className="lg-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <input
                      type="password"
                      className="lg-input"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="lg-field">
                    <div className="lg-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <input
                      type="password"
                      className="lg-input"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              {/* Message & Button */}
              {forgotMessage && (
                <div style={{ color: forgotMessage.includes("success") ? 'green' : 'red', textAlign: 'center', marginBottom: '15px' }}>
                  {forgotMessage}
                </div>
              )}

              <button className="lg-btn" type="submit" disabled={isForgotLoading}>
                {isForgotLoading ? "Processing..." : forgotStep === 3 ? "Reset Password" : "Next"}
              </button>

              {forgotStep === 2 && (
                <div className="lg-forgot" style={{ marginTop: '10px' }}>
                  <button type="button" onClick={() => setForgotStep(1)} style={{ fontSize: '14px' }}>Change Email</button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}