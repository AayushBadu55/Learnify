import React, { useState, useEffect } from 'react';
import './AnnouncementsPage.css';
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import ConfirmModal from "./components/ConfirmModal";

function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState([]);

    // Form states
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [priority, setPriority] = useState('Normal');

    // User info
    const [userType, setUserType] = useState('');
    const [userName, setUserName] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // Edit mode states
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUserType(storedUser.userType || 'Student');
            setUserName(storedUser.name || 'User');
        }
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/announcements');
            const data = await res.json();
            setAnnouncements(data);
        } catch (err) {
            console.error("Error fetching announcements", err);
        }
    };

    const handleAnnouncementSubmit = async (e) => {
        e.preventDefault();
        const url = isEditing
            ? `http://localhost:5000/api/announcements/${editId}`
            : 'http://localhost:5000/api/announcements';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, sender: userName, expirationDate, priority })
            });
            if (res.ok) {
                cancelEdit();
                fetchAnnouncements();
            }
        } catch (err) {
            console.error("Error submitting announcement", err);
        }
    };

    const handleEdit = (ann) => {
        setTitle(ann.title);
        setContent(ann.content);
        setPriority(ann.priority || 'Normal');
        setExpirationDate(ann.expirationDate ? ann.expirationDate.split('T')[0] : '');
        setEditId(ann._id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setTitle('');
        setContent('');
        setExpirationDate('');
        setPriority('Normal');
        setIsEditing(false);
        setEditId(null);
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
        setIsModalOpen(true);
    };

    const handleDeleteAnnouncement = async () => {
        if (!deleteId) return;
        try {
            await fetch(`http://localhost:5000/api/announcements/${deleteId}`, { method: 'DELETE' });
            fetchAnnouncements();
            setIsModalOpen(false);
            setDeleteId(null);
        } catch (err) {
            console.error(err);
        }
    };

    const isCR = () => {
        const type = localStorage.getItem('userType') || userType;
        return type === 'CR' || type === 'cr' || type === 'Class Representative';
    };

    // Filter announcements
    const now = new Date();
    const recentAnnouncements = announcements.filter(ann => !ann.expirationDate || new Date(ann.expirationDate) >= now);
    const expiredAnnouncements = announcements.filter(ann => ann.expirationDate && new Date(ann.expirationDate) < now);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="announcements-root">
            <Nav />
            <div style={{ height: '70px' }}></div>

            <main className="announcements-main">
                <h1 className="page-title">Announcements</h1>

                {isCR() && (
                    <div className="form-card">
                        <h3 className="section-subtitle">{isEditing ? "Edit Announcement" : "Create New Announcement"}</h3>
                        <form onSubmit={handleAnnouncementSubmit}>
                            <div className="form-row">
                                <label>Announcement Title</label>
                                <input
                                    type="text"
                                    placeholder="Announcement Title..."
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <label>Details</label>
                                <textarea
                                    placeholder="Announcement Details..."
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    required
                                    rows="4"
                                />
                            </div>
                            <div className="form-actions">
                                <div className="select-group">
                                    <select value={priority} onChange={e => setPriority(e.target.value)}>
                                        <option value="Normal">Normal</option>
                                        <option value="Important">Important</option>
                                        <option value="Urgent">Urgent</option>
                                    </select>
                                </div>
                                <div className="button-group">
                                    {isEditing && (
                                        <button type="button" onClick={cancelEdit} className="cancel-btn">Cancel</button>
                                    )}
                                    <button type="submit" className="submit-btn">{isEditing ? "Update Announcement" : "Post Announcement"}</button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                <h2 className="section-title">Recent Announcements</h2>
                <div className="list-container">
                    {recentAnnouncements.length === 0 ? <p style={{ textAlign: 'center', color: '#666' }}>No recent announcements.</p> : null}
                    {recentAnnouncements.map(ann => (
                        <div key={ann._id} className="card">
                            <div className="card-header">
                                <div className="header-left">
                                    {ann.priority && ann.priority !== 'Normal' && (
                                        <span className={`badge ${ann.priority.toLowerCase()}`}>{ann.priority}</span>
                                    )}
                                    <h3 className="card-title">{ann.title}</h3>
                                </div>
                            </div>
                            <p className="card-content">{ann.content}</p>
                            <div className="card-footer">
                                <div className="footer-left">
                                    <span className="card-sender">Posted by CR {ann.sender}</span>
                                    <span className="separator">|</span>
                                    <span className="card-date">{formatDate(ann.date)}</span>
                                </div>
                                {isCR() && (
                                    <div className="footer-actions">
                                        <button onClick={() => handleEdit(ann)} className="action-btn edit">
                                            ✏️ Edit
                                        </button>
                                        <button onClick={() => confirmDelete(ann._id)} className="action-btn delete">
                                            🗑 Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {expiredAnnouncements.length > 0 && (
                    <>
                        <h2 className="section-title" style={{ marginTop: '60px', opacity: 0.7 }}>Expired / Past Announcements</h2>
                        <div className="list-container" style={{ opacity: 0.7 }}>
                            {expiredAnnouncements.map(ann => (
                                <div key={ann._id} className="card">
                                    <div className="card-header">
                                        <div className="header-left">
                                            {ann.priority && ann.priority !== 'Normal' && (
                                                <span className={`badge ${ann.priority.toLowerCase()}`}>{ann.priority}</span>
                                            )}
                                            <h3 className="card-title">{ann.title}</h3>
                                        </div>
                                    </div>
                                    <p className="card-content">{ann.content}</p>
                                    <div className="card-footer">
                                        <div className="footer-left">
                                            <span className="card-sender">Posted by CR {ann.sender}</span>
                                            <span className="separator">|</span>
                                            <span className="card-date">{formatDate(ann.date)}</span>
                                        </div>
                                        {isCR() && (
                                            <div className="footer-actions">
                                                <button onClick={() => confirmDelete(ann._id)} className="action-btn delete">
                                                    🗑 Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>

            <Footer />
            <ConfirmModal
                isOpen={isModalOpen}
                title="Delete Announcement"
                message="Are you sure you want to delete this announcement? This action cannot be undone."
                onConfirm={handleDeleteAnnouncement}
                onCancel={() => setIsModalOpen(false)}
            />
        </div>
    );
}

export default AnnouncementsPage;
