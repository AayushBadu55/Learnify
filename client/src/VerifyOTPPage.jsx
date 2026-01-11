import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./ForgotPasswordPage.css"; // Reuse styles as they are similar

function VerifyOTPPage() {
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        try {
            const response = await fetch("http://localhost:5000/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();

            if (response.ok) {
                // Success: Redirect to Reset Password page
                navigate("/reset-password", { state: { email, otp } });
            } else {
                setMessage(data.message || "Invalid OTP");
            }
        } catch (err) {
            setMessage("Server error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!email) {
        return (
            <div className="fp-root">
                <div className="fp-card">
                    <p>Error: No email provided. Please go back.</p>
                    <Link to="/forgot-password" className="fp-btn">Back</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="fp-root">
            <div className="fp-card">
                <h2>Verify OTP</h2>
                <p>Enter the 6-digit code sent to <strong>{email}</strong></p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        className="fp-input"
                        maxLength="6"
                    />

                    {message && <p className="fp-error">{message}</p>}

                    <button type="submit" className="fp-btn" disabled={isLoading}>
                        {isLoading ? "Verifying..." : "Verify OTP"}
                    </button>

                    <div className="fp-back">
                        <Link to="/forgot-password">Resend OTP</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default VerifyOTPPage;
