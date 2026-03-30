import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./ForgotPasswordPage.css"; // Reuse styles
import Toast from "./components/Toast";

function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { email, otp } = location.state || {}; // Need both key and code to reset

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage("Passwords do not match!");
            return;
        }

        setIsLoading(true);
        setMessage("");

        try {
            const response = await fetch("http://localhost:5000/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setToast({ message: "Password reset successfully! Please login with your new password.", type: "success" });
                setTimeout(() => navigate("/login"), 2000);
            } else {
                setMessage(data.message || "Failed to reset password");
            }
        } catch (err) {
            setMessage("Server error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!email || !otp) {
        return (
            <div className="fp-root">
                <div className="fp-card">
                    <p>Error: Missing verification data. Please start over.</p>
                    <Link to="/forgot-password" className="fp-btn">Start Over</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="fp-root">
            <div className="fp-card">
                <h2>Reset Password</h2>
                <p>Create a new password for your account.</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="fp-input"
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="fp-input"
                    />

                    {message && <p className="fp-error">{message}</p>}

                    <button type="submit" className="fp-btn" disabled={isLoading}>
                        {isLoading ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
            {
        toast && (
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(null)}
            />
        )
    }
        </div >
    );
}

export default ResetPasswordPage;
