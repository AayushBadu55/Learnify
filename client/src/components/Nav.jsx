import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Nav.css";
import logo from "../assets/logo.png";

function Nav() {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [userName, setUserName] = useState("User");
    const [userAvatar, setUserAvatar] = useState("");
    const dropdownRef = useRef(null);

    // Fetch user from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser.name) setUserName(parsedUser.name);
                if (parsedUser.profilePicture) setUserAvatar(parsedUser.profilePicture);
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }
    }, []);

    const getInitials = (name) => {
        return name && name.length > 0 ? name.charAt(0).toUpperCase() : "U";
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <>
            <header className="main-nav-header">
                <div className="nav-left">
                    <div className="nav-logo-section">
                        <img src={logo} alt="Learnify logo" className="nav-logo" />
                        <span className="nav-brand">LEARNIFY</span>
                    </div>
                </div>

                <nav className="main-nav">
                    <button className="nav-item" onClick={() => navigate("/home")}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        <span>Home</span>
                    </button>

                    <div className="nav-divider"></div>

                    <button className="nav-item" onClick={() => navigate("/chat")}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                        <span>General Chat</span>
                    </button>

                    <div className="nav-divider"></div>

                    <button className="nav-item" onClick={() => navigate("/chatbot")}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>Chat bot</span>
                    </button>

                    <div className="nav-divider"></div>

                    <button className="nav-item" onClick={() => navigate("/assignments")}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                        </svg>
                        <span>Assignments</span>
                    </button>

                    <div className="nav-divider"></div>

                    <button className="nav-item" onClick={() => navigate("/polls")}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10"></line>
                            <line x1="12" y1="20" x2="12" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="14"></line>
                        </svg>
                        <span>Polls</span>
                    </button>

                    <div className="nav-divider"></div>

                    <button className="nav-item" onClick={() => navigate("/contact")}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <span>Contact Us</span>
                    </button>

                    <div className="nav-divider"></div>

                    {/* USER SECTION WITH DROPDOWN */}
                    <div className="nav-user-container" ref={dropdownRef}>
                        <div className="nav-user" onClick={() => setShowDropdown(!showDropdown)}>
                            {userAvatar ? (
                                <img src={userAvatar} alt="User" className="nav-user-avatar" />
                            ) : (
                                <div className="nav-user-initials">{getInitials(userName)}</div>
                            )}
                            <span className="nav-user-name">{userName}</span>
                            <svg className={`chevron ${showDropdown ? 'rotate' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 9l6 6 6-6"></path>
                            </svg>
                        </div>

                        {showDropdown && (
                            <div className="nav-dropdown">
                                <button className="dropdown-item" onClick={() => { navigate("/edit-profile"); setShowDropdown(false); }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '10px' }}>
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                    Edit Profile
                                </button>
                                <button className="dropdown-item logout-btn" onClick={() => { setShowLogoutModal(true); setShowDropdown(false); }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '10px' }}>
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </nav>
            </header>

            {/* LOGOUT CONFIRMATION MODAL */}
            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="modal-nav-content">
                        <div className="modal-icon">!</div>
                        <h3>Are you sure?</h3>
                        <p>Do you really want to log out of your account?</p>
                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={() => setShowLogoutModal(false)}>Cancel</button>
                            <button className="modal-btn confirm" onClick={handleLogout}>Logout</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Nav;
