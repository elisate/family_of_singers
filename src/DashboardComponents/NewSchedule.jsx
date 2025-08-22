import React, { useEffect, useState } from 'react';
import { HiCalendar, HiClock, HiLocationMarker, HiUsers, HiPencil, HiTrash, HiFilter, HiViewList, HiPlus, HiX } from 'react-icons/hi';
import './dashboardStyles/newSchedule.css';
import { ScheduleApi } from '../api/endpoints.js';

const NewSchedule = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await ScheduleApi.list({ limit: 50, sort: '-createdAt' });
                if (!mounted) return;
                const items = Array.isArray(data.items) ? data.items : [];
                setSchedules(items.map(item => ({
                    id: item._id,
                    type: item.type || item.category || 'other',
                    typeColor: (item.category === 'performance' || item.type === 'Performance') ? '#548D1F' : 'rgba(255, 147, 0, 1)',
                    title: item.title,
                    date: item.date ? (typeof item.date === 'string' ? item.date : new Date(item.date).toLocaleDateString()) : 'TBA',
                    time: item.time,
                    location: item.location,
                    participants: item.participants,
                    description: item.description,
                })));
            } catch (err) {
                console.error('Load schedules error:', err);
                setError(err?.message || 'Failed to load schedules');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [deletingSchedule, setDeletingSchedule] = useState(null);
    const [formData, setFormData] = useState({
        type: 'Rehearsal',
        title: '',
        date: '',
        time: '',
        location: '',
        participants: '',
        description: ''
    });

    const scheduleTypes = [
        { value: 'Rehearsal', color: 'rgba(255, 147, 0, 1)' },
        { value: 'Performance', color: '#548D1F' },
        { value: 'Workshop', color: 'rgba(255, 147, 0, 0.8)' },
        { value: 'Event', color: '#e6a11f' }
    ];

    const handleCreateClick = () => {
        setFormData({
            type: 'Rehearsal',
            title: '',
            date: '',
            time: '',
            location: '',
            participants: '',
            description: ''
        });
        setShowCreateModal(true);
    };

    const handleEditClick = (schedule) => {
        setEditingSchedule(schedule);
        // Convert date back to YYYY-MM-DD format for the date input
        let dateValue = '';
        if (schedule.date && schedule.date !== 'TBA') {
            try {
                // If it's already in YYYY-MM-DD format, keep it
                if (schedule.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    dateValue = schedule.date;
                } else {
                    // Convert from display format to YYYY-MM-DD
                    const parsedDate = new Date(schedule.date);
                    if (!isNaN(parsedDate.getTime())) {
                        dateValue = parsedDate.toISOString().split('T')[0];
                    }
                }
            } catch (err) {
                console.warn('Date parsing error:', err);
            }
        }
        
        setFormData({
            type: schedule.type,
            title: schedule.title,
            date: dateValue,
            time: schedule.time,
            location: schedule.location,
            participants: schedule.participants,
            description: schedule.description
        });
        setShowEditModal(true);
    };

    const handleDeleteClick = (schedule) => {
        setDeletingSchedule(schedule);
        setShowDeleteModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                type: formData.type, // Keep this for the backend model
                title: formData.title,
                description: formData.description,
                category: formData.type.toLowerCase(), // Backend expects lowercase category
                date: formData.date, // Send as string, don't convert to ISO
                time: formData.time,
                location: formData.location,
                participants: formData.participants
            };

            console.log('Creating schedule with payload:', payload);
            const created = await ScheduleApi.create(payload);
            console.log('Created schedule:', created);
            
            setSchedules(prev => [
                ...prev,
                {
                    id: created._id,
                    type: created.type || created.category || formData.type,
                    typeColor: scheduleTypes.find(t => t.value.toLowerCase() === (created.category || formData.type.toLowerCase()))?.color || '#3b82f6',
                    title: created.title,
                    date: created.date || formData.date,
                    time: created.time,
                    location: created.location,
                    participants: created.participants,
                    description: created.description || ''
                }
            ]);
            
            setError(null); // Clear any previous errors
        } catch (err) {
            console.error('Create error:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to create schedule');
        }
        setShowCreateModal(false);
        setFormData({
            type: 'Rehearsal',
            title: '',
            date: '',
            time: '',
            location: '',
            participants: '',
            description: ''
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                type: formData.type,
                title: formData.title,
                description: formData.description,
                category: formData.type.toLowerCase(), // Add this line
                date: formData.date, // Don't convert to ISO
                time: formData.time,
                location: formData.location,
                participants: formData.participants
            };
            
            console.log('Updating schedule with payload:', payload);
            await ScheduleApi.update(editingSchedule.id, payload);
            
            setSchedules(prev => prev.map(schedule => 
                schedule.id === editingSchedule.id 
                    ? { 
                        ...schedule, 
                        type: formData.type,
                        title: formData.title,
                        date: formData.date,
                        time: formData.time,
                        location: formData.location,
                        participants: formData.participants,
                        description: formData.description,
                        typeColor: scheduleTypes.find(t => t.value === formData.type)?.color || '#3b82f6'
                    }
                    : schedule
            ));
            
            setError(null); // Clear any previous errors
        } catch (err) {
            console.error('Edit error:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to update schedule');
        }
        setShowEditModal(false);
        setEditingSchedule(null);
        setFormData({
            type: 'Rehearsal',
            title: '',
            date: '',
            time: '',
            location: '',
            participants: '',
            description: ''
        });
    };

    const handleDeleteConfirm = async () => {
        try {
            console.log('Deleting schedule:', deletingSchedule.id);
            await ScheduleApi.remove(deletingSchedule.id);
            setSchedules(prev => prev.filter(schedule => schedule.id !== deletingSchedule.id));
            setError(null); // Clear any previous errors
        } catch (err) {
            console.error('Delete error:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to delete schedule');
        }
        setShowDeleteModal(false);
        setDeletingSchedule(null);
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setEditingSchedule(null);
        setDeletingSchedule(null);
        setFormData({
            type: 'Rehearsal',
            title: '',
            date: '',
            time: '',
            location: '',
            participants: '',
            description: ''
        });
        setError(null); // Clear errors when closing modals
    };

    return (
        <div className="schedule-page">
            {/* Header Section */}
            <div className="page-header">
                <div className="header-left">
                    <h1 className="page-title">Choir Schedules</h1>
                    <p className="page-subtitle">Manage rehearsals, performances, and events</p>
                </div>
                <div className="header-right">
                    <button className="create-schedule-btn" onClick={handleCreateClick}>
                        <HiPlus />
                        Create Schedule
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="error-message" style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    margin: '16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <span>{error}</span>
                    <button 
                        onClick={() => setError(null)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            fontSize: '18px'
                        }}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Control Bar */}
            <div className="control-bar">
                <div className="filters">
                    <div className="filter-group">
                        <select className="filter-dropdown">
                            <option>All Types</option>
                            <option>Rehearsal</option>
                            <option>Performance</option>
                            <option>Workshop</option>
                            <option>Event</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <select className="filter-dropdown">
                            <option>This Month</option>
                            <option>Next Month</option>
                            <option>Last Month</option>
                        </select>
                    </div>
                </div>
                <div className="view-toggles">
                    <button className="view-toggle">
                        <HiCalendar />
                        Calendar View
                    </button>
                    <button className="view-toggle active">
                        <HiViewList />
                        List View
                    </button>
                </div>
            </div>

            {/* Schedule Cards Grid */}
            <div className="schedule-grid">
                {loading && <div className="schedule-card"><p>Loading...</p></div>}
                {!loading && schedules.length === 0 && (
                    <div className="schedule-card">
                        <p>No schedules found. Create your first schedule!</p>
                    </div>
                )}
                {schedules.map((schedule) => (
                    <div key={schedule.id} className="schedule-card">
                        <div className="card-header">
                            <div className="schedule-type">
                                <div className="type-dot" style={{ backgroundColor: schedule.typeColor }}></div>
                                <span className="type-label">{schedule.type}</span>
                            </div>
                            <div className="card-actions">
                                <button className="action-btn edit" onClick={() => handleEditClick(schedule)}>
                                    <HiPencil />
                                </button>
                                <button className="action-btn delete" onClick={() => handleDeleteClick(schedule)}>
                                    <HiTrash />
                                </button>
                            </div>
                        </div>
                        <div className="card-content">
                            <h3 className="schedule-title">{schedule.title}</h3>
                            <div className="schedule-details">
                                <div className="detail-item">
                                    <HiCalendar className="detail-icon" />
                                    <span>{schedule.date}</span>
                                </div>
                                <div className="detail-item">
                                    <HiClock className="detail-icon" />
                                    <span>{schedule.time}</span>
                                </div>
                                <div className="detail-item">
                                    <HiLocationMarker className="detail-icon" />
                                    <span>{schedule.location}</span>
                                </div>
                                <div className="detail-item">
                                    <HiUsers className="detail-icon" />
                                    <span>{schedule.participants}</span>
                                </div>
                            </div>
                            <p className="schedule-description">{schedule.description}</p>
                        </div>
                    </div>
                ))}

                {/* Create New Schedule Card */}
                <div className="schedule-card create-new" onClick={handleCreateClick}>
                    <div className="create-content">
                        <HiPlus className="create-icon" />
                        <h3>Create New Schedule</h3>
                        <p>Add rehearsals, performances, or events</p>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            <div className="pagination">
                <button className="pagination-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15,18 9,12 15,6"></polyline>
                    </svg>
                </button>
                <button className="pagination-btn active">1</button>
                <button className="pagination-btn">2</button>
                <button className="pagination-btn">3</button>
                <button className="pagination-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9,18 15,12 9,6"></polyline>
                    </svg>
                </button>
            </div>

            {/* Create Schedule Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Schedule</h2>
                            <button className="modal-close" onClick={closeModal}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="schedule-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Type</label>
                                    <select name="type" value={formData.type} onChange={handleInputChange} required>
                                        {scheduleTypes.map(type => (
                                            <option key={type.value} value={type.value}>{type.value}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input 
                                        type="text" 
                                        name="title" 
                                        value={formData.title} 
                                        onChange={handleInputChange} 
                                        placeholder="Enter schedule title"
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date</label>
                                    <input 
                                        type="date" 
                                        name="date" 
                                        value={formData.date} 
                                        onChange={handleInputChange} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Time</label>
                                    <input 
                                        type="text" 
                                        name="time" 
                                        value={formData.time} 
                                        onChange={handleInputChange} 
                                        placeholder="e.g., 7:00 PM - 9:00 PM"
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Location</label>
                                    <input 
                                        type="text" 
                                        name="location" 
                                        value={formData.location} 
                                        onChange={handleInputChange} 
                                        placeholder="Enter location"
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Participants</label>
                                    <input 
                                        type="text" 
                                        name="participants" 
                                        value={formData.participants} 
                                        onChange={handleInputChange} 
                                        placeholder="e.g., 24 members attending"
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="form-group full-width">
                                <label>Description</label>
                                <textarea 
                                    name="description" 
                                    value={formData.description} 
                                    onChange={handleInputChange} 
                                    placeholder="Enter schedule description"
                                    rows="3"
                                    required 
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Create Schedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Schedule Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Schedule</h2>
                            <button className="modal-close" onClick={closeModal}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="schedule-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Type</label>
                                    <select name="type" value={formData.type} onChange={handleInputChange} required>
                                        {scheduleTypes.map(type => (
                                            <option key={type.value} value={type.value}>{type.value}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input 
                                        type="text" 
                                        name="title" 
                                        value={formData.title} 
                                        onChange={handleInputChange} 
                                        placeholder="Enter schedule title"
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date</label>
                                    <input 
                                        type="date" 
                                        name="date" 
                                        value={formData.date} 
                                        onChange={handleInputChange} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Time</label>
                                    <input 
                                        type="text" 
                                        name="time" 
                                        value={formData.time} 
                                        onChange={handleInputChange} 
                                        placeholder="e.g., 7:00 PM - 9:00 PM"
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Location</label>
                                    <input 
                                        type="text" 
                                        name="location" 
                                        value={formData.location} 
                                        onChange={handleInputChange} 
                                        placeholder="Enter location"
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Participants</label>
                                    <input 
                                        type="text" 
                                        name="participants" 
                                        value={formData.participants} 
                                        onChange={handleInputChange} 
                                        placeholder="e.g., 24 members attending"
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="form-group full-width">
                                <label>Description</label>
                                <textarea 
                                    name="description" 
                                    value={formData.description} 
                                    onChange={handleInputChange} 
                                    placeholder="Enter schedule description"
                                    rows="3"
                                    required 
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Update Schedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Delete Schedule</h2>
                            <button className="modal-close" onClick={closeModal}>
                                <HiX />
                            </button>
                        </div>
                        <div className="delete-content">
                            <p>Are you sure you want to delete <strong>"{deletingSchedule?.title}"</strong>?</p>
                            <p>This action cannot be undone.</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={closeModal}>
                                Cancel
                            </button>
                            <button className="btn-danger" onClick={handleDeleteConfirm}>
                                Delete Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewSchedule;