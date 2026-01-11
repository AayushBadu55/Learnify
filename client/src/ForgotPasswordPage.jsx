import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ForgotPasswordPage.css";

function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        try {
            const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                // Success: Redirect to Verify OTP page
                // We pass email in state so user doesn't have to re-type
                navigate("/verify-otp", { state: { email } });
            } else {
                setMessage(data.message || "Failed to send OTP");
            }
        } catch (err) {
            setMessage("Server error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fp-root">
            {/* Reuse Login Page Blobs/Styles logic basically */}
            <div className="fp-card">
                <h2>Forgot Password</h2>
                <p>Enter your email address to receive a verification code.</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="fp-input"
                    />

                    {message && <p className="fp-error">{message}</p>}

                    <button type="submit" className="fp-btn" disabled={isLoading}>
                        {isLoading ? "Sending..." : "Send OTP"}
                    </button>

                    <div className="fp-back">
                        <Link to="/login">Back to Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
