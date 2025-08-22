import React, { useEffect, useState } from 'react';
import { 
    HiPlus, 
    HiPencil, 
    HiEye, 
    HiTrash, 
    HiDocumentText, 
    HiGlobe, 
    HiNewspaper,
    HiCalendar,
    HiUser,
    HiClock,
    HiTag,
    HiCheckCircle,
    HiPencilAlt,
    HiArchive
} from 'react-icons/hi';
import './dashboardStyles/newContent.css';
import { ContentApi } from '../api/endpoints.js';

const NewContent = () => {
    const [activeTab, setActiveTab] = useState('pages');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingContent, setEditingContent] = useState(null);
    const [deletingContent, setDeletingContent] = useState(null);
    const [viewingContent, setViewingContent] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'page',
        status: 'draft',
        tags: '',
        author: '',
        publishDate: ''
    });

    const [pages, setPages] = useState([]);

    const [articles, setArticles] = useState([]);

    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await ContentApi.list({ limit: 100, sort: '-updatedAt' });
                if (!mounted) return;
                const items = Array.isArray(data.items) ? data.items : [];
                const mapItem = (i) => ({
                    id: i._id,
                    title: i.title || i.key,
                    type: i.data?.type || 'page',
                    status: i.data?.status || 'published',
                    author: i.data?.author || 'Admin',
                    lastModified: new Date(i.updatedAt || Date.now()).toISOString().slice(0,10),
                    views: 0,
                    tags: Array.isArray(i.data?.tags) ? i.data.tags : []
                });
                setPages(items.filter(i => (i.data?.type || 'page') === 'page').map(mapItem));
                setArticles(items.filter(i => i.data?.type === 'article').map(mapItem));
                setAnnouncements(items.filter(i => i.data?.type === 'announcement').map(mapItem));
            } catch (err) {
                setError(err?.message || 'Failed to load content');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const tabs = [
        { id: 'pages', label: 'Pages', icon: HiDocumentText, count: pages.length },
        { id: 'articles', label: 'Articles', icon: HiNewspaper, count: articles.length },
        { id: 'announcements', label: 'Announcements', icon: HiGlobe, count: announcements.length }
    ];

    const getContentByType = () => {
        switch (activeTab) {
            case 'pages': return pages;
            case 'articles': return articles;
            case 'announcements': return announcements;
            default: return pages;
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateContent = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                key: `${formData.type}-${Date.now()}`,
                title: formData.title,
                body: formData.content,
                data: {
                    type: formData.type,
                    status: formData.status,
                    author: formData.author,
                    tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
                }
            };
            const created = await ContentApi.create(payload);
            const newContent = {
                id: created._id,
                title: created.title || created.key,
                type: created.data?.type || 'page',
                status: created.data?.status || 'published',
                author: created.data?.author || 'Admin',
                lastModified: new Date(created.updatedAt || Date.now()).toISOString().slice(0,10),
                views: 0,
                tags: Array.isArray(created.data?.tags) ? created.data.tags : []
            };
            switch (activeTab) {
                case 'pages':
                    setPages(prev => [...prev, newContent]);
                    break;
                case 'articles':
                    setArticles(prev => [...prev, newContent]);
                    break;
                case 'announcements':
                    setAnnouncements(prev => [...prev, newContent]);
                    break;
            }
        } catch (err) {
            setError(err?.message || 'Failed to create content');
        }
        setShowCreateModal(false);
        resetForm();
    };

    const handleEditClick = (content) => {
        setEditingContent(content);
        setFormData({
            title: content.title,
            content: 'Content preview...',
            type: content.type,
            status: content.status,
            tags: content.tags.join(', '),
            author: content.author,
            publishDate: content.lastModified
        });
        setShowEditModal(true);
    };

    const handleViewClick = (content) => {
        setViewingContent(content);
        setShowViewModal(true);
    };

    const handleDeleteClick = (content) => {
        setDeletingContent(content);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await ContentApi.remove(deletingContent.id);
            const contentId = deletingContent.id;
            switch (activeTab) {
                case 'pages':
                    setPages(prev => prev.filter(c => c.id !== contentId));
                    break;
                case 'articles':
                    setArticles(prev => prev.filter(c => c.id !== contentId));
                    break;
                case 'announcements':
                    setAnnouncements(prev => prev.filter(c => c.id !== contentId));
                    break;
            }
        } catch (err) {
            setError(err?.message || 'Failed to delete content');
        }
        setShowDeleteModal(false);
        setDeletingContent(null);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title: formData.title,
                body: formData.content,
                data: {
                    type: formData.type,
                    status: formData.status,
                    author: formData.author,
                    tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
                }
            };
            await ContentApi.update(editingContent.id, payload);
            const updatedContent = {
                ...editingContent,
                title: formData.title,
                type: formData.type,
                status: formData.status,
                author: formData.author,
                lastModified: new Date().toISOString().split('T')[0],
                tags: payload.data.tags
            };
            switch (activeTab) {
                case 'pages':
                    setPages(prev => prev.map(c => c.id === editingContent.id ? updatedContent : c));
                    break;
                case 'articles':
                    setArticles(prev => prev.map(c => c.id === editingContent.id ? updatedContent : c));
                    break;
                case 'announcements':
                    setAnnouncements(prev => prev.map(c => c.id === editingContent.id ? updatedContent : c));
                    break;
            }
        } catch (err) {
            setError(err?.message || 'Failed to update content');
        }
        setShowEditModal(false);
        setEditingContent(null);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            type: 'page',
            status: 'draft',
            tags: '',
            author: '',
            publishDate: ''
        });
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setShowViewModal(false);
        setShowDeleteModal(false);
        setEditingContent(null);
        setDeletingContent(null);
        setViewingContent(null);
        resetForm();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return 'green';
            case 'draft': return 'yellow';
            case 'archived': return 'gray';
            default: return 'gray';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'published': return <HiCheckCircle />;
            case 'draft': return <HiPencilAlt />;
            case 'archived': return <HiArchive />;
            default: return <HiPencilAlt />;
        }
    };

    return (
        <div className="content-page">
            {/* Header Section */}
            <div className="content-header">
                <div className="header-left">
                    <h1 className="page-title">Content Management</h1>
                    <p className="page-subtitle">Create and manage website content, pages, and announcements</p>
                </div>
                <button 
                    className="create-content-btn"
                    onClick={() => setShowCreateModal(true)}
                >
                    <HiPlus />
                    Create Content
                </button>
            </div>

            {/* Tabs Navigation */}
            <div className="content-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon className="tab-icon" />
                        <span className="tab-label">{tab.label}</span>
                        <span className="tab-count">{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* Content List */}
            <div className="content-list">
                <div className="list-header">
                    <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
                    <div className="list-actions">
                        <select className="status-filter">
                            <option value="">All Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>
                </div>

                <div className="content-grid">
                    {loading && <div>Loading...</div>}
                    {error && <div>{error}</div>}
                    {getContentByType().map((content) => (
                        <div key={content.id} className="content-card">
                            <div className="content-header">
                                <div className="type-badge-container">
                                    {content.type === 'page' && (
                                        <span className="type-badge page">
                                            <HiGlobe className="badge-icon" />
                                            {content.type}
                                        </span>
                                    )}
                                    {content.type === 'article' && (
                                        <span className="type-badge article">
                                            <HiDocumentText className="badge-icon" />
                                            {content.type}
                                        </span>
                                    )}
                                    {content.type === 'announcement' && (
                                        <span className="type-badge announcement">
                                            <HiNewspaper className="badge-icon" />
                                            {content.type}
                                        </span>
                                    )}
                                </div>
                                <div className="status-badge-container">
                                    {content.status === 'published' && (
                                        <span className="status-badge green">
                                            <HiCheckCircle className="status-icon" />
                                            {content.status}
                                        </span>
                                    )}
                                    {content.status === 'draft' && (
                                        <span className="status-badge yellow">
                                            <HiPencilAlt className="status-icon" />
                                            {content.status}
                                        </span>
                                    )}
                                    {content.status === 'archived' && (
                                        <span className="status-badge gray">
                                            <HiArchive className="status-icon" />
                                            {content.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="content-body">
                                <h4 className="content-title">{content.title}</h4>
                                
                                <div className="content-meta">
                                    <div className="meta-item">
                                        <HiUser className="meta-icon" />
                                        <span>{content.author}</span>
                                    </div>
                                    <div className="meta-item">
                                        <HiCalendar className="meta-icon" />
                                        <span>Modified: {content.lastModified}</span>
                                    </div>
                                    <div className="meta-item">
                                        <HiEye className="meta-icon" />
                                        <span>{content.views} views</span>
                                    </div>
                                </div>
                                
                                <div className="content-tags">
                                    {content.tags.map((tag, index) => (
                                        <span key={index} className="tag">
                                            <HiTag className="tag-icon" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="content-actions">
                                <button 
                                    className="action-btn view" 
                                    onClick={() => handleViewClick(content)}
                                    title="View Content"
                                >
                                    <HiEye />
                                </button>
                                <button 
                                    className="action-btn edit" 
                                    onClick={() => handleEditClick(content)}
                                    title="Edit Content"
                                >
                                    <HiPencil />
                                </button>
                                <button 
                                    className="action-btn delete" 
                                    onClick={() => handleDeleteClick(content)}
                                    title="Delete Content"
                                >
                                    <HiTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Content Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(0, -1).slice(1)}</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form className="content-form" onSubmit={handleCreateContent}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Enter title"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                    >
                                        <option value="page">Page</option>
                                        <option value="article">Article</option>
                                        <option value="announcement">Announcement</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Author</label>
                                    <input
                                        type="text"
                                        name="author"
                                        value={formData.author}
                                        onChange={handleInputChange}
                                        placeholder="Enter author name"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Content</label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    placeholder="Enter content..."
                                    rows="6"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                    placeholder="tag1, tag2, tag3"
                                />
                            </div>
                            
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Create {activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(0, -1).slice(1)}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Content Modal */}
            {showEditModal && editingContent && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Content</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="content-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Enter content title"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Type</label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="page">Page</option>
                                        <option value="article">Article</option>
                                        <option value="announcement">Announcement</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Author</label>
                                    <input
                                        type="text"
                                        name="author"
                                        value={formData.author}
                                        onChange={handleInputChange}
                                        placeholder="Enter author name"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Content</label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    placeholder="Enter content..."
                                    rows="6"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                    placeholder="tag1, tag2, tag3"
                                />
                            </div>
                            
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Update Content
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Content Modal */}
            {showViewModal && viewingContent && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Content Details</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="view-content">
                            <div className="view-header">
                                <h3>{viewingContent.title}</h3>
                                <span className={`status-badge ${getStatusColor(viewingContent.status)}`}>
                                    {getStatusIcon(viewingContent.status)} {viewingContent.status}
                                </span>
                            </div>
                            <div className="view-details">
                                <div className="detail-row">
                                    <span className="detail-label">Type:</span>
                                    <span className="detail-value">{viewingContent.type}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Author:</span>
                                    <span className="detail-value">{viewingContent.author}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Last Modified:</span>
                                    <span className="detail-value">{viewingContent.lastModified}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Views:</span>
                                    <span className="detail-value">{viewingContent.views}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Tags:</span>
                                    <span className="detail-value">
                                        {viewingContent.tags.join(', ')}
                                    </span>
                                </div>
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

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Delete Content</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="delete-content">
                            <p>Are you sure you want to delete <strong>"{deletingContent?.title}"</strong>?</p>
                            <p>This action cannot be undone.</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={closeModal}>
                                Cancel
                            </button>
                            <button className="btn-danger" onClick={handleDeleteConfirm}>
                                Delete Content
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewContent;
