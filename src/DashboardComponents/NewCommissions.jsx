import React, { useEffect, useState } from 'react';
import { HiPlus, HiSearch, HiEye, HiPencil, HiTrash, HiSpeakerphone, HiUser, HiUserGroup, HiFilter } from 'react-icons/hi';
import './dashboardStyles/newCommissions.css';
import { CommissionApi } from '../api/endpoints.js';

const NewCommissions = () => {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all commissions on component mount
    useEffect(() => {
        fetchCommissions();
    }, []);

    const fetchCommissions = async () => {
        let mounted = true;
        setLoading(true);
        setError(null);
        
        try {
            const data = await CommissionApi.list({ limit: 50, sort: '-createdAt' });
            if (!mounted) return;
            
            // Transform API response to match component structure
            const transformedCommissions = (Array.isArray(data.items) ? data.items : []).map(c => ({
                id: c._id,
                name: c.name,
                subtitle: c.isActive ? 'Active' : 'Inactive',
                description: c.description || '',
                members: 0, // API doesn't return member count, you might need to fetch this separately
                leader: { 
                    name: c.leader || '—', 
                    avatar: (c.leader || ' ').split(' ').map(n => n[0]).join('').toUpperCase() 
                },
                created: new Date(c.createdAt || c.updatedAt || Date.now()).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                }),
                icon: 'music', // Default icon since API doesn't return this
                iconColor: '#8b5cf6', // Default color
                contactEmail: c.contactEmail,
                contactPhone: c.contactPhone,
                isActive: c.isActive
            }));
            
            setCommissions(transformedCommissions);
        } catch (err) {
            console.error('Error fetching commissions:', err);
            setError(err?.message || 'Failed to load commissions');
        } finally {
            if (mounted) setLoading(false);
        }

        return () => { mounted = false; };
    };

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingCommission, setEditingCommission] = useState(null);
    const [deletingCommission, setDeletingCommission] = useState(null);
    const [viewingCommission, setViewingCommission] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All Commissions');
    const [formData, setFormData] = useState({
        name: '',
        subtitle: '',
        description: '',
        members: '',
        leader: {
            name: '',
            avatar: ''
        },
        contactEmail: '',
        contactPhone: '',
        isActive: true,
        icon: 'music',
        iconColor: '#8b5cf6'
    });

    const commissionIcons = [
        { value: 'music', label: 'Audio', icon: HiSpeakerphone, color: '#8b5cf6' },
        { value: 'community', label: 'Community', icon: HiUser, color: '#10b981' },
        { value: 'youth', label: 'Youth', icon: HiUserGroup, color: '#3b82f6' },
        { value: 'worship', label: 'Worship', icon: HiSpeakerphone, color: '#f59e0b' }
    ];

    const handleCreateClick = () => {
        setFormData({
            name: '',
            subtitle: '',
            description: '',
            members: '',
            leader: {
                name: '',
                avatar: ''
            },
            contactEmail: '',
            contactPhone: '',
            isActive: true,
            icon: 'music',
            iconColor: '#8b5cf6'
        });
        setShowCreateModal(true);
    };

    const handleEditClick = (commission) => {
        setEditingCommission(commission);
        setFormData({
            name: commission.name,
            subtitle: commission.subtitle,
            description: commission.description,
            members: commission.members,
            leader: {
                name: commission.leader.name,
                avatar: commission.leader.avatar
            },
            contactEmail: commission.contactEmail || '',
            contactPhone: commission.contactPhone || '',
            isActive: commission.isActive,
            icon: commission.icon,
            iconColor: commission.iconColor
        });
        setShowEditModal(true);
    };

    const handleDeleteClick = (commission) => {
        setDeletingCommission(commission);
        setShowDeleteModal(true);
    };

    const handleViewClick = (commission) => {
        setViewingCommission(commission);
        setShowViewModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'leaderName') {
            setFormData(prev => ({
                ...prev,
                leader: {
                    ...prev.leader,
                    name: value,
                    avatar: value.split(' ').map(n => n[0]).join('').toUpperCase()
                }
            }));
        } else if (name === 'icon') {
            const selectedIcon = commissionIcons.find(icon => icon.value === value);
            setFormData(prev => ({
                ...prev,
                icon: value,
                iconColor: selectedIcon.color
            }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Prepare payload matching API structure
            const payload = {
                name: formData.name,
                description: formData.description,
                leader: formData.leader.name,
                contactEmail: formData.contactEmail,
                contactPhone: formData.contactPhone,
                isActive: formData.isActive
            };
            
            const created = await CommissionApi.create(payload);
            
            // Add new commission to local state
            const newCommission = {
                id: created._id,
                name: created.name,
                subtitle: created.isActive ? 'Active' : 'Inactive',
                description: created.description || '',
                members: parseInt(formData.members) || 0,
                leader: {
                    name: created.leader || '',
                    avatar: (created.leader || ' ').split(' ').map(n => n[0]).join('').toUpperCase()
                },
                created: new Date(created.createdAt || Date.now()).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                }),
                contactEmail: created.contactEmail,
                contactPhone: created.contactPhone,
                isActive: created.isActive,
                icon: formData.icon,
                iconColor: formData.iconColor
            };
            
            setCommissions(prev => [newCommission, ...prev]);
            setShowCreateModal(false);
            resetForm();
        } catch (err) {
            console.error('Error creating commission:', err);
            setError(err?.message || 'Failed to create commission');
        } finally {
            setLoading(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Prepare payload matching API structure
            const payload = {
                name: formData.name,
                description: formData.description,
                leader: formData.leader.name,
                contactEmail: formData.contactEmail,
                contactPhone: formData.contactPhone,
                isActive: formData.isActive
            };
            
            const updated = await CommissionApi.update(editingCommission.id, payload);
            
            // Update commission in local state
            setCommissions(prev => prev.map(commission => 
                commission.id === editingCommission.id 
                    ? { 
                        ...commission, 
                        name: updated.name || formData.name,
                        subtitle: (updated.isActive ?? formData.isActive) ? 'Active' : 'Inactive',
                        description: updated.description || formData.description,
                        leader: {
                            name: updated.leader || formData.leader.name,
                            avatar: (updated.leader || formData.leader.name || ' ').split(' ').map(n => n[0]).join('').toUpperCase()
                        },
                        contactEmail: updated.contactEmail || formData.contactEmail,
                        contactPhone: updated.contactPhone || formData.contactPhone,
                        isActive: updated.isActive ?? formData.isActive,
                        members: parseInt(formData.members) || commission.members,
                        icon: formData.icon,
                        iconColor: formData.iconColor
                    }
                    : commission
            ));
            
            setShowEditModal(false);
            setEditingCommission(null);
            resetForm();
        } catch (err) {
            console.error('Error updating commission:', err);
            setError(err?.message || 'Failed to update commission');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        setLoading(true);
        
        try {
            await CommissionApi.remove(deletingCommission.id);
            
            // Remove commission from local state
            setCommissions(prev => prev.filter(commission => commission.id !== deletingCommission.id));
            
            setShowDeleteModal(false);
            setDeletingCommission(null);
        } catch (err) {
            console.error('Error deleting commission:', err);
            setError(err?.message || 'Failed to delete commission');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            subtitle: '',
            description: '',
            members: '',
            leader: {
                name: '',
                avatar: ''
            },
            contactEmail: '',
            contactPhone: '',
            isActive: true,
            icon: 'music',
            iconColor: '#8b5cf6'
        });
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setShowViewModal(false);
        setEditingCommission(null);
        setDeletingCommission(null);
        setViewingCommission(null);
        resetForm();
        setError(null); // Clear any errors when closing modals
    };

    const filteredCommissions = commissions.filter(commission => {
        const matchesSearch = commission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            commission.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'All Commissions' || commission.name.includes(filterType);
        return matchesSearch && matchesFilter;
    });

    const getIconComponent = (iconType) => {
        const iconData = commissionIcons.find(icon => icon.value === iconType);
        return iconData ? iconData.icon : HiSpeakerphone;
    };

    return (
        <div className="commissions-page">
            {/* Header Section */}
            <div className="page-header">
                <div className="header-left">
                    <h1 className="page-title">Commissions</h1>
                    <p className="page-subtitle">Manage choir commissions and their members</p>
                </div>
                <div className="header-right">
                    <button className="add-commission-btn" onClick={handleCreateClick}>
                        <HiPlus />
                        Add Commission
                    </button>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="search-filter-bar">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search commissions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <HiSearch className="search-icon" />
                </div>
                <div className="filter-container">
                    <div className="filter-dropdowns">
                        <select 
                            value={filterType} 
                            onChange={(e) => setFilterType(e.target.value)}
                            className="filter-dropdown"
                        >
                            <option>All Commissions</option>
                            <option>Worship Commission</option>
                            <option>Outreach Commission</option>
                            <option>Youth Commission</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="error-message" style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '20px'
                }}>
                    {error}
                    <button 
                        onClick={() => setError(null)}
                        style={{
                            marginLeft: '10px',
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer'
                        }}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Commissions List */}
            <div className="commissions-list">
                <div className="list-header">
                    <div className="header-name">Name</div>
                    <div className="header-description">Description</div>
                    <div className="header-members">Members</div>
                    <div className="header-leader">Leader</div>
                    <div className="header-created">Created</div>
                    <div className="header-actions">Actions</div>
                </div>

                {loading && (
                    <div className="commission-row">
                        <div>Loading commissions...</div>
                    </div>
                )}
                
                {!loading && commissions.length === 0 && !error && (
                    <div className="commission-row">
                        <div>No commissions found. Click "Add Commission" to create one.</div>
                    </div>
                )}
                
                {filteredCommissions.map((commission) => {
                    const IconComponent = getIconComponent(commission.icon);
                    return (
                        <div key={commission.id} className="commission-row">
                            <div className="commission-name">
                                <div className="name-icon" style={{ backgroundColor: commission.iconColor }}>
                                    <IconComponent />
                                </div>
                                <div className="name-content">
                                    <div className="name-title">{commission.name}</div>
                                    <div className="name-subtitle">{commission.subtitle}</div>
                                </div>
                            </div>
                            <div className="commission-description">
                                {commission.description}
                            </div>
                            <div className="commission-members">
                                <span className="members-tag">{commission.members} members</span>
                            </div>
                            <div className="commission-leader">
                                <div className="leader-avatar">
                                    {commission.leader.avatar}
                                </div>
                                <div className="leader-name">{commission.leader.name}</div>
                            </div>
                            <div className="commission-created">
                                {commission.created}
                            </div>
                            <div className="commission-actions">
                                <button className="action-btn view" onClick={() => handleViewClick(commission)}>
                                    <HiEye />
                                </button>
                                <button className="action-btn edit" onClick={() => handleEditClick(commission)}>
                                    <HiPencil />
                                </button>
                                <button className="action-btn delete" onClick={() => handleDeleteClick(commission)}>
                                    <HiTrash />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Create Commission Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add New Commission</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="commission-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Commission Name</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleInputChange} 
                                        placeholder="Enter commission name"
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <label className="checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            name="isActive" 
                                            checked={formData.isActive} 
                                            onChange={handleInputChange} 
                                        />
                                        Active Commission
                                    </label>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea 
                                    name="description" 
                                    value={formData.description} 
                                    onChange={handleInputChange} 
                                    placeholder="Enter commission description"
                                    rows="3"
                                    required 
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Contact Email</label>
                                    <input 
                                        type="email" 
                                        name="contactEmail" 
                                        value={formData.contactEmail} 
                                        onChange={handleInputChange} 
                                        placeholder="Enter contact email"
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Contact Phone</label>
                                    <input 
                                        type="tel" 
                                        name="contactPhone" 
                                        value={formData.contactPhone} 
                                        onChange={handleInputChange} 
                                        placeholder="Enter contact phone"
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Number of Members</label>
                                    <input 
                                        type="number" 
                                        name="members" 
                                        value={formData.members} 
                                        onChange={handleInputChange} 
                                        placeholder="Enter member count"
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Commission Icon</label>
                                    <select name="icon" value={formData.icon} onChange={handleInputChange} required>
                                        {commissionIcons.map(icon => (
                                            <option key={icon.value} value={icon.value}>
                                                {icon.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Leader Name</label>
                                <input 
                                    type="text" 
                                    name="leaderName" 
                                    value={formData.leader.name} 
                                    onChange={handleInputChange} 
                                    placeholder="Enter leader's name"
                                    required 
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Commission'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Commission Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Commission</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="commission-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Commission Name</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleInputChange} 
                                        placeholder="Enter commission name"
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <label className="checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            name="isActive" 
                                            checked={formData.isActive} 
                                            onChange={handleInputChange} 
                                        />
                                        Active Commission
                                    </label>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea 
                                    name="description" 
                                    value={formData.description} 
                                    onChange={handleInputChange} 
                                    placeholder="Enter commission description"
                                    rows="3"
                                    required 
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Contact Email</label>
                                    <input 
                                        type="email" 
                                        name="contactEmail" 
                                        value={formData.contactEmail} 
                                        onChange={handleInputChange} 
                                        placeholder="Enter contact email"
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Contact Phone</label>
                                    <input 
                                        type="tel" 
                                        name="contactPhone" 
                                        value={formData.contactPhone} 
                                        onChange={handleInputChange} 
                                        placeholder="Enter contact phone"
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Number of Members</label>
                                    <input 
                                        type="number" 
                                        name="members" 
                                        value={formData.members} 
                                        onChange={handleInputChange} 
                                        placeholder="Enter member count"
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Commission Icon</label>
                                    <select name="icon" value={formData.icon} onChange={handleInputChange} required>
                                        {commissionIcons.map(icon => (
                                            <option key={icon.value} value={icon.value}>
                                                {icon.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Leader Name</label>
                                <input 
                                    type="text" 
                                    name="leaderName" 
                                    value={formData.leader.name} 
                                    onChange={handleInputChange} 
                                    placeholder="Enter leader's name"
                                    required 
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Updating...' : 'Update Commission'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Commission Modal */}
            {showViewModal && viewingCommission && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Commission Details</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="view-content">
                            <div className="view-header">
                                <div className="view-icon" style={{ backgroundColor: viewingCommission.iconColor }}>
                                    {React.createElement(getIconComponent(viewingCommission.icon))}
                                </div>
                                <div className="view-title">
                                    <h3>{viewingCommission.name}</h3>
                                    <p>{viewingCommission.subtitle}</p>
                                </div>
                            </div>
                            <div className="view-details">
                                <div className="detail-row">
                                    <span className="detail-label">Description:</span>
                                    <span className="detail-value">{viewingCommission.description}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Members:</span>
                                    <span className="detail-value">{viewingCommission.members} members</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Leader:</span>
                                    <span className="detail-value">{viewingCommission.leader.name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Contact Email:</span>
                                    <span className="detail-value">{viewingCommission.contactEmail || 'Not provided'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Contact Phone:</span>
                                    <span className="detail-value">{viewingCommission.contactPhone || 'Not provided'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Status:</span>
                                    <span className="detail-value">{viewingCommission.isActive ? 'Active' : 'Inactive'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Created:</span>
                                    <span className="detail-value">{viewingCommission.created}</span>
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
                            <h2>Delete Commission</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="delete-content">
                            <p>Are you sure you want to delete <strong>"{deletingCommission?.name}"</strong>?</p>
                            <p>This action cannot be undone.</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={closeModal}>
                                Cancel
                            </button>
                            <button className="btn-danger" onClick={handleDeleteConfirm} disabled={loading}>
                                {loading ? 'Deleting...' : 'Delete Commission'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewCommissions;