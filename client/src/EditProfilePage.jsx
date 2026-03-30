import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import "./EditProfilePage.css";

function EditProfilePage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        fullName: "",
        email: "",
        phone: "",
        profilePicture: "",
        userType: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setProfile({
                    fullName: parsedUser.name || "",
                    email: parsedUser.email || "",
                    phone: parsedUser.phone || "",
                    profilePicture: parsedUser.profilePicture || "",
                    userType: (parsedUser.userType || "Student").toUpperCase(),
                });
            } catch (err) {
                console.error("Error parsing user data:", err);
            }
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({ ...prev, profilePicture: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            // Use local IP or localhost. Assuming backend is on port 5000.
            const response = await fetch("http://localhost:5000/api/auth/update-profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
            });

            let data;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                data = await response.json();
            } else {
                // Handle non-JSON responses (like 413 Payload Too Large HTML page)
                data = { message: response.statusText || "Server Error" };
            }

            if (response.ok) {
                setSuccess("Profile updated successfully!");
                // Update local storage
                localStorage.setItem("user", JSON.stringify(data.user));
                // Optional: Redirect or just stay
            } else {
                setError(data.message || "Failed to update profile");
            }
        } catch (err) {
            console.error("Update error:", err);
            setError("Server error. Please ensure backend is running.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveImage = () => {
        setShowDeleteConfirm(true);
    };

    const confirmRemoveImage = () => {
        setProfile(prev => ({ ...prev, profilePicture: "" }));
        setShowDeleteConfirm(false);
    };

    const cancelRemoveImage = () => {
        setShowDeleteConfirm(false);
    };

    const getInitials = (name) => {
        return name && name.length > 0 ? name.charAt(0).toUpperCase() : "U";
    };

    return (
        <div className="edit-profile-root">
            <Nav />
            {/* Spacer for fixed header */}
            <div style={{ height: '70px' }}></div>

            <main className="edit-profile-main">
                <div className="edit-profile-card">
                    <h2 className="edit-profile-title">Edit Profile</h2>

                    <div className="profile-image-section">
                        <div className="profile-wrapper">
                            {profile.profilePicture ? (
                                <img src={profile.profilePicture} alt="Profile" className="profile-pic" />
                            ) : (
                                <div className="profile-initials">{getInitials(profile.fullName)}</div>
                            )}
                            <label htmlFor="file-upload" className="edit-icon-overlay">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 20h9"></path>
                                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                </svg>
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div className="profile-actions">
                            <p className="profile-upload-text">Click icon to change photo</p>
                            {profile.profilePicture && (
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="remove-photo-btn"
                                >
                                    Remove Photo
                                </button>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="edit-profile-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={profile.fullName}
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Email (Read-only)</label>
                            <input
                                type="email"
                                name="email"
                                value={profile.email}
                                disabled
                                className="form-input disabled"
                            />
                        </div>

                        <div className="form-group">
                            <label>Role (Read-only)</label>
                            <input
                                type="text"
                                name="userType"
                                value={profile.userType}
                                disabled
                                className="form-input disabled"
                            />
                        </div>

                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                value={profile.phone}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}

                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={() => navigate("/home")}>Cancel</button>
                            <button type="submit" className="btn-save" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Remove Profile Picture?</h3>
                        <p>Are you sure you want to remove your profile picture?</p>
                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={cancelRemoveImage}>Cancel</button>
                            <button className="btn-modal-confirm" onClick={confirmRemoveImage}>Yes, Remove</button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

export default EditProfilePage;
