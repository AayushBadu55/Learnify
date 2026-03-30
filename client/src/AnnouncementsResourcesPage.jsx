import React, { useState, useEffect } from 'react';
import './AnnouncementsResourcesPage.css';
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import ConfirmModal from "./components/ConfirmModal";

function AnnouncementsResourcesPage() {
    const [activeTab, setActiveTab] = useState('announcements');
    const [announcements, setAnnouncements] = useState([]);
    const [resources, setResources] = useState([]);

    // Form states
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [file, setFile] = useState(null);

    const [priority, setPriority] = useState('Normal');

    // User info
    const [userType, setUserType] = useState('');
    const [userName, setUserName] = useState('');

    // Delete modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState({ type: '', id: null });

    useEffect(() => {
        // Get user info from localStorage (assuming it's stored there after login)
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUserType(storedUser.userType || 'Student');
            setUserName(storedUser.name || 'User');
        }
        fetchAnnouncements();
        fetchResources();
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

    const fetchResources = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/resources');
            const data = await res.json();
            setResources(data);
        } catch (err) {
            console.error("Error fetching resources", err);
        }
    };

    const handleAnnouncementSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, sender: userName, priority })
            });
            if (res.ok) {
                setTitle('');
                setContent('');
                setPriority('Normal');
                fetchAnnouncements();
            }
        } catch (err) {
            console.error("Error creating announcement", err);
        }
    };

    const handleResourceSubmit = async (e) => {
        e.preventDefault();

        // Handle file to base64
        let fileData = "";
        let fileName = "";
        if (file) {
            fileName = file.name;
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                fileData = reader.result; // base64 string

                try {
                    const res = await fetch('http://localhost:5000/api/resources', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            title,
                            description,
                            link,
                            fileData,
                            fileName,
                            sender: userName
                        })
                    });
                    if (res.ok) {
                        setTitle('');
                        setDescription('');
                        setLink('');
                        setFile(null);
                        fetchResources();
                    }
                } catch (err) {
                    console.error("Error creating resource", err);
                }
            };
            return;
        }

        // If no file, just send data
        try {
            const res = await fetch('http://localhost:5000/api/resources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    link,
                    fileData: "",
                    fileName: "",
                    sender: userName
                })
            });
            if (res.ok) {
                setTitle('');
                setDescription('');
                setLink('');
                fetchResources();
            }
        } catch (err) {
            console.error("Error creating resource", err);
        }
    };

    const confirmDeleteAnnouncement = (id) => {
        setDeleteTarget({ type: 'announcement', id });
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteResource = (id) => {
        setDeleteTarget({ type: 'resource', id });
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (deleteTarget.type === 'announcement') {
            try {
                await fetch(`http://localhost:5000/api/announcements/${deleteTarget.id}`, { method: 'DELETE' });
                fetchAnnouncements();
            } catch (err) {
                console.error(err);
            }
        } else if (deleteTarget.type === 'resource') {
            try {
                await fetch(`http://localhost:5000/api/resources/${deleteTarget.id}`, { method: 'DELETE' });
                fetchResources();
            } catch (err) {
                console.error(err);
            }
        }
        setIsDeleteModalOpen(false);
        setDeleteTarget({ type: '', id: null });
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setDeleteTarget({ type: '', id: null });
    };

    const isCR = () => {
        const type = localStorage.getItem('userType') || userType;
        return type === 'CR' || type === 'cr' || type === 'Class Representative';
    };

    // Get recently uploaded resources (last 5)
    const recentResources = [...resources]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    return (
        <div className="announcements-root">
            <Nav />
            {/* Spacer for fixed header */}
            <div style={{ height: '70px' }}></div>

            <main className="announcements-main">
                <h1 className="page-title">Classroom Updates</h1>

                <div className="tabs">
                    <div
                        className={`tab ${activeTab === 'announcements' ? 'active' : ''}`}
                        onClick={() => setActiveTab('announcements')}
                    >
                        Announcements
                    </div>
                    <div
                        className={`tab ${activeTab === 'resources' ? 'active' : ''}`}
                        onClick={() => setActiveTab('resources')}
                    >
                        Resources
                    </div>
                </div>

                {activeTab === 'announcements' && (
                    <div>
                        {isCR() && (
                            <div className="form-card">
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
                                        <button type="submit" className="submit-btn">Post Announcement</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="list-container">
                            {announcements.map(ann => (
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
                                            <span className="card-date">{new Date(ann.date).toLocaleDateString()}</span>
                                        </div>
                                        {isCR() && (
                                            <button onClick={() => confirmDeleteAnnouncement(ann._id)} className="delete-btn">
                                                🗑 Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'resources' && (
                    <div>
                        {isCR() && (
                            <div className="form-card">
                                <h3 className="section-title">Upload Resource</h3>
                                <form onSubmit={handleResourceSubmit}>
                                    <div className="form-group">
                                        <label>Title</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            rows="3"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>External Link (Optional)</label>
                                        <input
                                            type="url"
                                            value={link}
                                            onChange={e => setLink(e.target.value)}
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>File (Optional)</label>
                                        <input
                                            type="file"
                                            onChange={e => setFile(e.target.files[0])}
                                        />
                                    </div>
                                    <button type="submit" className="submit-btn">Share Resource</button>
                                </form>
                            </div>
                        )}

                        {/* Recently Uploaded Resources Section */}
                        {isCR() && recentResources.length > 0 && (
                            <div className="recent-resources-section">
                                <h3 className="section-title">📁 Recently Uploaded Resources</h3>
                                <div className="recent-resources-grid">
                                    {recentResources.map(res => (
                                        <div key={res._id} className="recent-resource-card">
                                            <div className="recent-resource-header">
                                                <span className="recent-resource-icon">
                                                    {res.fileData ? '📄' : '🔗'}
                                                </span>
                                                <div className="recent-resource-info">
                                                    <h4 className="recent-resource-title">{res.title}</h4>
                                                    <span className="recent-resource-date">
                                                        {new Date(res.date).toLocaleDateString()} • {res.fileName || 'Link'}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => confirmDeleteResource(res._id)}
                                                className="recent-resource-delete"
                                                title="Delete Resource"
                                            >
                                                🗑
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <h3 className="section-title" style={{ marginTop: '30px' }}>All Resources</h3>
                        <div className="list-container">
                            {resources.map(res => (
                                <div key={res._id} className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">{res.title}</h3>
                                        <span className="card-date">{new Date(res.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="card-content">{res.description}</p>
                                    <div className="resource-actions">
                                        {res.link && (
                                            <a href={res.link} target="_blank" rel="noopener noreferrer" className="resource-link">Open Link 🔗</a>
                                        )}
                                        {res.fileData && (
                                            <a href={res.fileData} download={res.fileName || "download"} className="download-link">Download: {res.fileName || 'File'} 📥</a>
                                        )}
                                    </div>
                                    <div className="card-footer">
                                        <span className="card-sender">Shared by: {res.sender}</span>
                                        {isCR() && (
                                            <button onClick={() => confirmDeleteResource(res._id)} className="delete-btn">🗑 Delete</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
            <Footer />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title={deleteTarget.type === 'announcement' ? 'Delete Announcement' : 'Delete Resource'}
                message={`Are you sure you want to delete this ${deleteTarget.type}? This action cannot be undone.`}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />
        </div>
    );
}

export default AnnouncementsResourcesPage;
