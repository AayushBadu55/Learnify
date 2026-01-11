import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateField, setValidationErrors } from "../redux/signupSlice";
import emailjs from "@emailjs/browser";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";
import illustration from "/src/assets/signup-illustration.png";

export default function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formData, errors } = useSelector((state) => state.signup);

  // Flow states
  const [step, setStep] = useState("signup"); // "signup" or "otp"
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [userEnteredOtp, setUserEnteredOtp] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);

  // --- CONFIGURATION ---
  const SERVICE_ID = "service_pbt1v7a";
  const TEMPLATE_ID = "template_7tzoppe";
  const PUBLIC_KEY = "0EVg7nfiW75cPDvtm";
  const BACKEND_URL = "http://localhost:5000/api/auth"; // CORRECT: This is your backend port

  const validate = (name, value, currentData) => {
    let error = "";
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) error = "Invalid email format";
    } else if (name === "password") {
      const passRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
      if (value && !passRegex.test(value)) error = "8+ chars, 1 Uppercase, 1 Special char";
    } else if (name === "confirmPassword") {
      if (value && value !== currentData.password) error = "Passwords do not match";
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone" && !/^\d*$/.test(value)) return;
    dispatch(updateField({ name, value }));
    const fieldError = validate(name, value, formData);
    dispatch(setValidationErrors({ ...errors, [name]: fieldError }));
  };

  // --- STEP 1: Check Email & Send OTP ---
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const finalErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key]) finalErrors[key] = "Required field";
    });

    if (Object.keys(finalErrors).length > 0) {
      dispatch(setValidationErrors(finalErrors));
      return;
    }

    setIsLoading(true);

    try {
      // 1. Check if user already exists in MongoDB
      const checkRes = await fetch(`${BACKEND_URL}/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      if (!checkRes.ok) {
        const data = await checkRes.json();
        alert(data.message || "Email already exists!");
        setIsLoading(false);
        return;
      }

      // 2. Generate 4-digit OTP
      const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(newOtp);

      // 3. Send OTP via EmailJS
      const templateParams = {
        email: formData.email,
        passcode: newOtp,
        time: "15 minutes",
        user_name: formData.fullName,
      };

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      setStep("otp");
    } catch (err) {
      alert("Error: " + (err.message || "Failed to process request"));
    } finally {
      setIsLoading(false);
    }
  };

  // --- STEP 2: Verify OTP & Save to DB ---
  const handleOtpInput = (val, index) => {
    if (isNaN(val)) return;
    let newOtp = [...userEnteredOtp];
    newOtp[index] = val;
    setUserEnteredOtp(newOtp);

    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOtp = async () => {
    if (userEnteredOtp.join("") === generatedOtp) {
      setIsLoading(true);
      try {
        // 4. Final step: Save verified user to MongoDB
        const regRes = await fetch(`${BACKEND_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (regRes.ok) {
          alert("Verification Successful! Welcome to Learnnify.");
          navigate("/home"); 
        } else {
          const data = await regRes.json();
          alert(data.message || "Registration failed.");
        }
      } catch (err) {
        alert("Server Error. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("Invalid OTP. Please check the code sent to your email.");
    }
  };

  return (
    <div className="su-root">
      <div className="su-blob su-blob-1" />
      <div className="su-blob su-blob-2" />
      <div className="su-blob su-blob-3" />

      <div className="su-wrap">
        <div className="su-left">
          <h1 className="su-brand">Learnnify</h1>
          <p className="su-tagline">
            {step === "signup" ? (
              <>A Classroom <br /> Beyond the <br /> walls</>
            ) : (
              <>Verify <br /> Your <br /> Account</>
            )}
          </p>
          <img className="su-ill" src={illustration} alt="illustration" />
        </div>

        <div className="su-card">
          {step === "signup" ? (
            <>
              <h2 className="su-title">Sign Up</h2>
              <div className="su-field">
                <input className={`su-input ${errors.fullName ? "err" : ""}`} name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} />
                {errors.fullName && <span className="error-txt">{errors.fullName}</span>}
              </div>
              <div className="su-field">
                <input className={`su-input ${errors.email ? "err" : ""}`} name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                {errors.email && <span className="error-txt">{errors.email}</span>}
              </div>
              <div className="su-field">
                <input className={`su-input ${errors.password ? "err" : ""}`} type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
                {errors.password && <span className="error-txt">{errors.password}</span>}
              </div>
              <div className="su-field">
                <input className={`su-input ${errors.confirmPassword ? "err" : ""}`} type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />
                {errors.confirmPassword && <span className="error-txt">{errors.confirmPassword}</span>}
              </div>
              <div className="su-field">
                <input className={`su-input ${errors.phone ? "err" : ""}`} name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
                {errors.phone && <span className="error-txt">{errors.phone}</span>}
              </div>
              <div className="su-field">
                <select className={`su-input su-select ${errors.userType ? "err" : ""}`} name="userType" value={formData.userType} onChange={handleChange}>
                  <option value="" disabled hidden>User Type</option>
                  <option value="student">Student</option>
                  <option value="cr">CR</option>
                </select>
                {errors.userType && <span className="error-txt">{errors.userType}</span>}
              </div>
              <button className="su-btn" onClick={handleSignupSubmit} disabled={isLoading}>
                {isLoading ? "Checking..." : "Sign up"}
              </button>
              <div className="su-or"><span /><p>OR</p><span /></div>
              <p className="su-bottom">Already have an account? <a href="/login">Log In</a></p>
            </>
          ) : (
            <div className="otp-container" style={{ textAlign: "center" }}>
              <h2 className="su-title">Check Email</h2>
              <p className="su-bottom" style={{ marginBottom: "20px" }}>
                Enter the 4-digit code sent to <br /> <b>{formData.email}</b>
              </p>
              
              <div className="otp-input-area">
                {userEnteredOtp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    className="otp-digit"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpInput(e.target.value, i)}
                    onFocus={(e) => e.target.select()}
                  />
                ))}
              </div>

              <button className="su-btn" onClick={handleVerifyOtp} disabled={isLoading}>
                {isLoading ? "Finalizing..." : "Verify & Register"}
              </button>
              
              <p className="su-bottom" style={{ marginTop: "20px" }}>
                Didn't get the code? <a href="#" onClick={() => setStep("signup")}>Change Email</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}