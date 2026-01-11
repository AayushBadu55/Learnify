import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import "./VerifyOTP.css";
import illustration from "/src/assets/signup-illustration.png"; 

// Added formData to props so we can save the user to MongoDB
export default function VerifyOTP({ email, generatedOtp, formData }) {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(59);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const BACKEND_URL = "http://localhost:5000/api/auth";

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value !== "" && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleSubmit = async () => {
    const otpValue = otp.join("");
    
    // 1. Check if OTP matches
    if (otpValue === generatedOtp) {
      setIsVerifying(true);
      try {
        // 2. NEW: Save verified user to MongoDB (Requirement 2)
        const response = await fetch(`${BACKEND_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData), 
        });

        if (response.ok) {
          alert("Verification Successful & Account Created!");
          navigate("/home"); 
        } else {
          const data = await response.json();
          alert(data.message || "Registration failed. Please try again.");
        }
      } catch (err) {
        alert("Server error. Please check if your backend is running.");
      } finally {
        setIsVerifying(false);
      }
    } else {
      alert("Invalid OTP. Please check the code sent to your email.");
    }
  };

  return (
    <div className="su-root">
      <div className="su-blob su-blob-1" />
      <div className="su-wrap">
        <div className="su-left">
          <h1 className="su-brand">Learnnify</h1>
          <p className="su-tagline">Verify <br /> Your <br /> Account</p>
          <img className="su-ill" src={illustration} alt="illustration" />
        </div>

        <div className="su-card otp-card">
          <h2 className="su-title">Enter OTP</h2>
          <p className="otp-sub">We sent a code to <b>{email}</b></p>
          
          <div className="otp-input-area">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="otp-digit"
                value={data}
                onChange={e => handleChange(e.target, index)}
                onFocus={e => e.target.select()}
              />
            ))}
          </div>

          <button 
            className="su-btn" 
            onClick={handleSubmit} 
            disabled={isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify & Register"}
          </button>
          
          <p className="su-bottom">
            Didn't receive code? {timer > 0 ? (
              <span>Resend in {timer}s</span>
            ) : (
              <a href="#" onClick={() => window.location.reload()}>Resend Code</a>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}