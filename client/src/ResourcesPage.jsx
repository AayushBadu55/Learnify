import React, { useState, useEffect, useRef } from 'react';
import './ResourcesPage.css';
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import ConfirmModal from "./components/ConfirmModal";
import { renderAsync } from 'docx-preview';

function ResourcesPage() {
    const [resources, setResources] = useState([]);

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [file, setFile] = useState(null);

    // User info
    const [userType, setUserType] = useState('');
    const [userName, setUserName] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // Preview modal state
    const [previewResource, setPreviewResource] = useState(null);
    const docxContainerRef = useRef(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUserType(storedUser.userType || 'Student');
            setUserName(storedUser.name || 'User');
        }
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/resources');
            const data = await res.json();
            setResources(data);
        } catch (err) {
            console.error("Error fetching resources", err);
        }
    };

    const handleResourceSubmit = async (e) => {
        e.preventDefault();

        let fileData = "";
        let fileName = "";
        if (file) {
            fileName = file.name;
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                fileData = reader.result;
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

    const confirmDelete = (id) => {
        setDeleteId(id);
        setIsModalOpen(true);
    };

    const handleDeleteResource = async () => {
        if (!deleteId) return;
        try {
            await fetch(`http://localhost:5000/api/resources/${deleteId}`, { method: 'DELETE' });
            fetchResources();
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

    const openPreview = (resource) => {
        setPreviewResource(resource);
    };

    const closePreview = () => {
        setPreviewResource(null);
    };

    const getFileType = (fileName) => {
        if (!fileName) return 'unknown';
        const ext = fileName.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
        if (['pdf'].includes(ext)) return 'pdf';
        if (['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
        if (['mp3', 'wav', 'ogg'].includes(ext)) return 'audio';
        if (['docx', 'doc'].includes(ext)) return 'docx';
        return 'other';
    };

    // Convert base64 to Blob for docx-preview
    const base64ToBlob = (base64, mimeType) => {
        const byteString = atob(base64.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeType });
    };

    // Effect to render docx when preview opens
    useEffect(() => {
        if (previewResource && getFileType(previewResource.fileName) === 'docx' && docxContainerRef.current) {
            const blob = base64ToBlob(previewResource.fileData, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            docxContainerRef.current.innerHTML = ''; // Clear previous content
            renderAsync(blob, docxContainerRef.current, null, {
                className: 'docx-wrapper',
                inWrapper: true,
                ignoreWidth: false,
                ignoreHeight: false,
                ignoreFonts: false,
                breakPages: true,
                ignoreLastRenderedPageBreak: true,
                experimental: false,
                trimXmlDeclaration: true,
                useBase64URL: true,
            }).catch(err => console.error('Error rendering docx:', err));
        }
    }, [previewResource]);

    return (
        <div className="resources-root">
            <Nav />
            <div style={{ height: '70px' }}></div>

            <main className="resources-main">
                <h1 className="page-title">Resources</h1>

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

                <h2 className="resources-list-title">Recently Shared Resources</h2>
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
                                    <>
                                        <button onClick={() => openPreview(res)} className="preview-btn">
                                            Preview: {res.fileName || 'File'} 👁️
                                        </button>
                                        <a href={res.fileData} download={res.fileName || "download"} className="download-link">Download 📥</a>
                                    </>
                                )}
                            </div>
                            <div className="card-footer">
                                <span className="card-sender">Shared by: {res.sender}</span>
                                {isCR() && (
                                    <button onClick={() => confirmDelete(res._id)} className="delete-btn">Delete</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
            <ConfirmModal
                isOpen={isModalOpen}
                title="Delete Resource"
                message="Are you sure you want to delete this resource? This action cannot be undone."
                onConfirm={handleDeleteResource}
                onCancel={() => setIsModalOpen(false)}
            />

            {/* File Preview Overlay */}
            {previewResource && (
                <div className="preview-overlay" onClick={closePreview}>
                    <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="preview-close" onClick={closePreview}>×</button>
                        <div className="preview-header">
                            <h2 className="preview-title">{previewResource.title}</h2>
                            <span className="preview-filename">📄 {previewResource.fileName}</span>
                        </div>

                        {previewResource.description && (
                            <div className="preview-description">
                                <h4>Description</h4>
                                <p>{previewResource.description}</p>
                            </div>
                        )}

                        <div className="preview-content">
                            {getFileType(previewResource.fileName) === 'image' && (
                                <img src={previewResource.fileData} alt={previewResource.fileName} className="preview-image" />
                            )}
                            {getFileType(previewResource.fileName) === 'pdf' && (
                                <iframe src={previewResource.fileData} title={previewResource.fileName} className="preview-pdf" />
                            )}
                            {getFileType(previewResource.fileName) === 'video' && (
                                <video src={previewResource.fileData} controls className="preview-video" />
                            )}
                            {getFileType(previewResource.fileName) === 'audio' && (
                                <audio src={previewResource.fileData} controls className="preview-audio" />
                            )}
                            {getFileType(previewResource.fileName) === 'docx' && (
                                <div ref={docxContainerRef} className="preview-docx"></div>
                            )}
                            {getFileType(previewResource.fileName) === 'other' && (
                                <div className="preview-other">
                                    <p>Preview not available for this file type.</p>
                                    <p>Click the button below to download.</p>
                                </div>
                            )}
                        </div>

                        <div className="preview-actions">
                            <a href={previewResource.fileData} download={previewResource.fileName} className="preview-download-btn">
                                Download {previewResource.fileName} 📥
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ResourcesPage;
