import React, { useEffect, useState, useRef } from 'react';
import { 
    HiCloudUpload, 
    HiMusicNote, 
    HiVideoCamera, 
    HiDocumentText, 
    HiPhotograph,
    HiDownload,
    HiLink,
    HiPlus,
    HiX,
    HiUser,
    HiClock
} from 'react-icons/hi';
import './dashboardStyles/newMedia.css';
import { MediaApi } from '../api/endpoints.js';

const NewMedia = () => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [recentUploads, setRecentUploads] = useState([]);

    const [allUploads, setAllUploads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await MediaApi.list({ limit: 100, sort: '-createdAt' });
                if (!mounted) return;
                const items = Array.isArray(data.items) ? data.items : [];
                const mapped = items.map(item => ({
                    id: item._id,
                    name: item.title,
                    type: item.type,
                    size: '',
                    uploadedAt: new Date(item.createdAt || Date.now()).toLocaleDateString(),
                    icon: item.type === 'audio' ? HiMusicNote : item.type === 'video' ? HiVideoCamera : item.type === 'image' ? HiPhotograph : HiDocumentText,
                    author: '',
                    category: (item.tags && item.tags[0]) || ''
                }));
                setAllUploads(mapped);
                setRecentUploads(mapped.slice(0, 5));
            } catch (err) {
                setError(err?.message || 'Failed to load media');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showAllUploadsModal, setShowAllUploadsModal] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);
    const [deletingCampaign, setDeletingCampaign] = useState(null);
    const [viewingCampaign, setViewingCampaign] = useState(null);

    const fileInputRef = useRef(null);

    const mediaCategories = [
        {
            id: 1,
            title: 'Audio Files',
            description: 'Recordings & Music',
            count: 24,
            icon: HiMusicNote,
            color: 'blue'
        },
        {
            id: 2,
            title: 'Video Files',
            description: 'Performances & Tutorials',
            count: 12,
            icon: HiVideoCamera,
            color: 'purple'
        },
        {
            id: 3,
            title: 'Sheet Music',
            description: 'PDF Documents',
            count: 8,
            icon: HiDocumentText,
            color: 'green'
        },
        {
            id: 4,
            title: 'Photos',
            description: 'Event images',
            count: 16,
            icon: HiPhotograph,
            color: 'orange'
        }
    ];

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleFiles = (files) => {
        const newFiles = Array.from(files).map(file => ({
            id: Date.now() + Math.random(),
            name: file.name,
            size: formatFileSize(file.size),
            type: getFileType(file.name),
            uploadedAt: 'Just now',
            icon: getFileIcon(file.name),
            file
        }));
        setSelectedFiles(prev => [...prev, ...newFiles]);
    };

    const uploadSelectedFiles = async () => {
        if (selectedFiles.length === 0) return;
        try {
            for (const item of selectedFiles) {
                const formData = new FormData();
                formData.append('file', item.file);
                formData.append('title', item.name);
                formData.append('description', '');
                formData.append('type', item.type);
                await MediaApi.upload(formData);
            }
            // Refresh lists
            const data = await MediaApi.list({ limit: 100, sort: '-createdAt' });
            const items = Array.isArray(data.items) ? data.items : [];
            const mapped = items.map(item => ({
                id: item._id,
                name: item.title,
                type: item.type,
                size: '',
                uploadedAt: new Date(item.createdAt || Date.now()).toLocaleDateString(),
                icon: item.type === 'audio' ? HiMusicNote : item.type === 'video' ? HiVideoCamera : item.type === 'image' ? HiPhotograph : HiDocumentText,
                author: '',
                category: (item.tags && item.tags[0]) || ''
            }));
            setAllUploads(mapped);
            setRecentUploads(mapped.slice(0, 5));
            setSelectedFiles([]);
        } catch (err) {
            setError(err?.message || 'Failed to upload media');
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getFileType = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        if (['mp3', 'wav', 'm4a'].includes(ext)) return 'audio';
        if (['mp4', 'avi', 'mov'].includes(ext)) return 'video';
        if (['pdf'].includes(ext)) return 'document';
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
        return 'document';
    };

    const getFileIcon = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        if (['mp3', 'wav', 'm4a'].includes(ext)) return HiMusicNote;
        if (['mp4', 'avi', 'mov'].includes(ext)) return HiVideoCamera;
        if (['pdf'].includes(ext)) return HiDocumentText;
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return HiPhotograph;
        return HiDocumentText;
    };

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleDownload = (file) => {
        // In a real app, this would trigger file download
        console.log('Downloading:', file.name);
    };

    const handleShare = (file) => {
        // In a real app, this would generate shareable link
        console.log('Sharing:', file.name);
    };

    const handleRemoveFile = (fileId) => {
        setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const handleViewAllUploads = () => {
        setShowAllUploadsModal(true);
    };

    const closeModal = () => {
        setShowAllUploadsModal(false);
    };

    return (
        <div className="media-page">
            {/* Upload Media Files Section */}
            <div className="upload-section">
                <h2 className="section-title">Upload Media Files</h2>
                <p className="upload-instructions">Drag and drop files here or click to browse</p>
                
                <div 
                    className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={handleFileSelect}
                >
                    <div className="drop-zone-content">
                        <HiCloudUpload className="upload-icon" />
                        <p className="drop-text">Drop files here or click to upload</p>
                    </div>
                </div>
                
                <p className="supported-formats">
                    Supports: MP3, MP4, WAV, PDF, JPG, PNG (Max 50MB)
                </p>
                
                <button className="choose-files-btn" onClick={handleFileSelect}>
                    <HiPlus />
                    Choose Files
                </button>
                
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".mp3,.mp4,.wav,.pdf,.jpg,.jpeg,.png,.gif,.m4a,.avi,.mov"
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                />

                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                    <div className="selected-files">
                        <h4>Selected Files:</h4>
                        {selectedFiles.map((file) => (
                            <div key={file.id} className="selected-file-item">
                                <div className="file-info">
                                    <file.icon className="file-icon" />
                                    <span className="file-name">{file.name}</span>
                                    <span className="file-size">{file.size}</span>
                                </div>
                                <button 
                                    className="remove-file-btn"
                                    onClick={() => handleRemoveFile(file.id)}
                                >
                                    <HiX />
                                </button>
                            </div>
                        ))}
                        <button className="choose-files-btn" onClick={uploadSelectedFiles}>
                            <HiCloudUpload />
                            Upload Selected
                        </button>
                    </div>
                )}
            </div>

            {/* Media Categories Section */}
            <div className="categories-section">
                <div className="categories-grid">
                    {mediaCategories.map((category) => (
                        <div key={category.id} className={`category-card ${category.color}`}>
                            <div className="category-icon">
                                <category.icon />
                            </div>
                            <div className="category-content">
                                <h3 className="category-title">{category.title}</h3>
                                <p className="category-description">{category.description}</p>
                                <span className="category-count">{category.count}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Uploads Section */}
            <div className="recent-uploads-section">
                <div className="section-header">
                    <h3 className="section-title">Recent Uploads</h3>
                    <button className="view-all-btn" onClick={handleViewAllUploads}>View All</button>
                </div>
                
                <div className="uploads-list">
                    {loading && <div>Loading...</div>}
                    {error && <div>{error}</div>}
                    {recentUploads.map((upload) => (
                        <div key={upload.id} className="upload-item">
                            <div className="upload-info">
                                <upload.icon className="upload-file-icon" />
                                <div className="upload-details">
                                    <h4 className="upload-name">{upload.name}</h4>
                                    <p className="upload-meta">
                                        uploaded {upload.uploadedAt} • {upload.size}
                                    </p>
                                </div>
                            </div>
                            <div className="upload-actions">
                                <button 
                                    className="action-btn download"
                                    onClick={() => handleDownload(upload)}
                                    title="Download"
                                >
                                    <HiDownload />
                                </button>
                                <button 
                                    className="action-btn share"
                                    onClick={() => handleShare(upload)}
                                    title="Share"
                                >
                                    <HiLink />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* View All Uploads Modal */}
            {showAllUploadsModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content all-uploads-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>All Media Uploads</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        
                        <div className="uploads-content">
                            <div className="uploads-summary">
                                <div className="summary-item">
                                    <span className="summary-label">Total Files:</span>
                                    <span className="summary-value">{allUploads.length}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Total Size:</span>
                                    <span className="summary-value">
                                        {allUploads.reduce((sum, upload) => {
                                            const size = parseFloat(upload.size.split(' ')[0]);
                                            const unit = upload.size.split(' ')[1];
                                            if (unit === 'MB') return sum + size;
                                            if (unit === 'KB') return sum + (size / 1024);
                                            if (unit === 'GB') return sum + (size * 1024);
                                            return sum;
                                        }, 0).toFixed(1)} MB
                                    </span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">File Types:</span>
                                    <span className="summary-value">
                                        {[...new Set(allUploads.map(upload => upload.type))].length}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="uploads-filters">
                                <div className="filter-group">
                                    <label>Filter by Type:</label>
                                    <select className="type-filter">
                                        <option value="">All Types</option>
                                        <option value="audio">Audio</option>
                                        <option value="video">Video</option>
                                        <option value="document">Document</option>
                                        <option value="image">Image</option>
                                    </select>
                                </div>
                                <div className="filter-group">
                                    <label>Sort by:</label>
                                    <select className="sort-filter">
                                        <option value="recent">Most Recent</option>
                                        <option value="name">Name A-Z</option>
                                        <option value="size">Size</option>
                                        <option value="author">Author</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="uploads-list-all">
                                {allUploads.map((upload) => (
                                    <div key={upload.id} className="upload-item-all">
                                        <div className="upload-info-all">
                                            <upload.icon className="upload-file-icon-all" />
                                            <div className="upload-details-all">
                                                <div className="upload-header">
                                                    <h4 className="upload-name-all">{upload.name}</h4>
                                                    <span className={`type-badge-all ${upload.type}`}>
                                                        {upload.type}
                                                    </span>
                                                </div>
                                                <div className="upload-meta-all">
                                                    <div className="meta-item-all">
                                                        <HiUser className="meta-icon-all" />
                                                        <span>{upload.author}</span>
                                                    </div>
                                                    <div className="meta-item-all">
                                                        <HiClock className="meta-icon-all" />
                                                        <span>{upload.uploadedAt}</span>
                                                    </div>
                                                    <div className="meta-item-all">
                                                        <span className="upload-size-all">{upload.size}</span>
                                                    </div>
                                                </div>
                                                <div className="upload-category">
                                                    <span className="category-tag">{upload.category}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="upload-actions-all">
                                            <button 
                                                className="action-btn download"
                                                onClick={() => handleDownload(upload)}
                                                title="Download"
                                            >
                                                <HiDownload />
                                            </button>
                                            <button 
                                                className="action-btn share"
                                                onClick={() => handleShare(upload)}
                                                title="Share"
                                            >
                                                <HiLink />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={closeModal}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewMedia;
