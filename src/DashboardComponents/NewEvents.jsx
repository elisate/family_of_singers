import React, { useEffect, useState } from 'react';
import { HiPlus, HiFilter, HiCalendar, HiClock, HiLocationMarker, HiPencil, HiArrowRight, HiStar, HiAcademicCap, HiMusicNote, HiEye, HiTrash, HiX } from 'react-icons/hi';
import './dashboardStyles/newEvents.css';
import { EventApi } from '../api/endpoints.js';

const NewEvents = () => {
    const [events, setEvents] = useState({ upcoming: [], special: [], past: [] });
    const [activeTab, setActiveTab] = useState('upcoming');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [deletingEvent, setDeletingEvent] = useState(null);
    const [viewingEvent, setViewingEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        type: 'PERFORMANCE',
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        isPublished: false,
        category: 'upcoming',
        coverImageUrl: ''
    });

    const eventTypes = [
        { value: 'PERFORMANCE', label: 'PERFORMANCE' },
        { value: 'REHEARSAL', label: 'REHEARSAL' },
        { value: 'WORKSHOP', label: 'WORKSHOP' },
        { value: 'VIP', label: 'VIP' },
        { value: 'CONTEST', label: 'CONTEST' }
    ];

    const statusOptions = [
        { value: 'CONFIRMED', label: 'CONFIRMED', color: '#10b981' },
        { value: 'SCHEDULED', label: 'SCHEDULED', color: '#6b7280' },
        { value: 'PENDING', label: 'PENDING', color: '#f59e0b' },
        { value: 'COMPLETED', label: 'COMPLETED', color: '#10b981' }
    ];

    const categoryOptions = [
        { value: 'upcoming', label: 'Upcoming Events' },
        { value: 'special', label: 'Special Events' },
        { value: 'past', label: 'Past Events' }
    ];

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await EventApi.list({ limit: 100, sort: '-date' });
                if (!mounted) return;
                const items = Array.isArray(data.items) ? data.items : [];
                const upcoming = [];
                const past = [];
                const now = Date.now();
                
                for (const e of items) {
                    const isPast = e.date ? new Date(e.date).getTime() < now : false;
                    const mapped = {
                        id: e._id,
                        type: e.isPublished ? 'PERFORMANCE' : 'REHEARSAL',
                        title: e.title,
                        subtitle: e.description || '',
                        date: e.date ? new Date(e.date).toLocaleDateString() : 'TBA',
                        time: e.time || '',
                        location: e.location || '',
                        status: e.isPublished ? 'CONFIRMED' : 'SCHEDULED',
                        statusColor: e.isPublished ? '#10b981' : '#6b7280',
                        theme: e.isPublished ? 'purple' : 'green',
                        isPublished: e.isPublished,
                        coverImageUrl: e.coverImageUrl || ''
                    };
                    if (isPast) past.push(mapped); else upcoming.push(mapped);
                }
                setEvents({ upcoming, special: [], past });
            } catch (err) {
                console.error('Load events error:', err);
                setError(err?.message || 'Failed to load events');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const handleCreateClick = () => {
        setFormData({
            type: 'PERFORMANCE',
            title: '',
            description: '',
            date: '',
            time: '',
            location: '',
            isPublished: false,
            category: 'upcoming',
            coverImageUrl: ''
        });
        setShowCreateModal(true);
    };

    const handleEditClick = (event, category) => {
        setEditingEvent({ ...event, category });
        // Convert date back to YYYY-MM-DD format for the date input
        let dateValue = '';
        if (event.date && event.date !== 'TBA') {
            try {
                // If it's already in YYYY-MM-DD format, keep it
                if (event.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    dateValue = event.date;
                } else {
                    // Convert from display format to YYYY-MM-DD
                    const parsedDate = new Date(event.date);
                    if (!isNaN(parsedDate.getTime())) {
                        dateValue = parsedDate.toISOString().split('T')[0];
                    }
                }
            } catch (err) {
                console.warn('Date parsing error:', err);
            }
        }
        
        setFormData({
            type: event.type || 'PERFORMANCE',
            title: event.title,
            description: event.subtitle || '',
            date: dateValue,
            time: event.time || '',
            location: event.location || '',
            isPublished: event.isPublished || false,
            category: category,
            coverImageUrl: event.coverImageUrl || ''
        });
        setShowEditModal(true);
    };

    const handleDeleteClick = (event, category) => {
        setDeletingEvent({ ...event, category });
        setShowDeleteModal(true);
    };

    const handleViewClick = (event, category) => {
        setViewingEvent({ ...event, category });
        setShowViewModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
                time: formData.time,
                location: formData.location,
                isPublished: formData.isPublished,
                coverImageUrl: formData.coverImageUrl
            };

            console.log('Creating event with payload:', payload);
            const created = await EventApi.create(payload);
            console.log('Created event:', created);
            
            const mapped = {
                id: created._id,
                type: created.isPublished ? 'PERFORMANCE' : 'REHEARSAL',
                title: created.title,
                subtitle: created.description || '',
                date: created.date ? new Date(created.date).toLocaleDateString() : 'TBA',
                time: created.time || '',
                location: created.location || '',
                status: created.isPublished ? 'CONFIRMED' : 'SCHEDULED',
                statusColor: created.isPublished ? '#10b981' : '#6b7280',
                theme: created.isPublished ? 'purple' : 'green',
                isPublished: created.isPublished,
                coverImageUrl: created.coverImageUrl || ''
            };
            
            setEvents(prev => ({
                ...prev,
                [formData.category]: [...prev[formData.category], mapped]
            }));
            
            setError(null); // Clear any previous errors
        } catch (err) {
            console.error('Create error:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to create event');
        }
        setShowCreateModal(false);
        resetForm();
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                date: formData.date ? new Date(formData.date).toISOString() : undefined,
                time: formData.time,
                location: formData.location,
                isPublished: formData.isPublished,
                coverImageUrl: formData.coverImageUrl
            };
            
            console.log('Updating event with payload:', payload);
            await EventApi.update(editingEvent.id, payload);
            
            const updatedEvent = {
                id: editingEvent.id,
                type: formData.isPublished ? 'PERFORMANCE' : 'REHEARSAL',
                title: formData.title,
                subtitle: formData.description,
                date: formData.date,
                time: formData.time,
                location: formData.location,
                status: formData.isPublished ? 'CONFIRMED' : 'SCHEDULED',
                statusColor: formData.isPublished ? '#10b981' : '#6b7280',
                theme: formData.isPublished ? 'purple' : 'green',
                isPublished: formData.isPublished,
                coverImageUrl: formData.coverImageUrl
            };
            
            // Remove from old category
            setEvents(prev => ({
                ...prev,
                [editingEvent.category]: prev[editingEvent.category].filter(e => e.id !== editingEvent.id)
            }));
            
            // Add to new category
            setEvents(prev => ({
                ...prev,
                [formData.category]: [...prev[formData.category], updatedEvent]
            }));
            
            setError(null); // Clear any previous errors
        } catch (err) {
            console.error('Edit error:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to update event');
        }
        setShowEditModal(false);
        setEditingEvent(null);
        resetForm();
    };

    const handleDeleteConfirm = async () => {
        try {
            console.log('Deleting event:', deletingEvent.id);
            await EventApi.remove(deletingEvent.id);
            setEvents(prev => ({
                ...prev,
                [deletingEvent.category]: prev[deletingEvent.category].filter(e => e.id !== deletingEvent.id)
            }));
            setError(null); // Clear any previous errors
        } catch (err) {
            console.error('Delete error:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to delete event');
        }
        setShowDeleteModal(false);
        setDeletingEvent(null);
    };

    const resetForm = () => {
        setFormData({
            type: 'PERFORMANCE',
            title: '',
            description: '',
            date: '',
            time: '',
            location: '',
            isPublished: false,
            category: 'upcoming',
            coverImageUrl: ''
        });
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setShowViewModal(false);
        setEditingEvent(null);
        setDeletingEvent(null);
        setViewingEvent(null);
        setError(null); // Clear errors when closing modals
        resetForm();
    };

    const getThemeForType = (type) => {
        switch (type) {
            case 'PERFORMANCE': return 'purple';
            case 'REHEARSAL': return 'green';
            case 'WORKSHOP': return 'red';
            case 'VIP': return 'purple';
            case 'CONTEST': return 'green';
            default: return 'purple';
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'VIP': return 'star';
            case 'CONTEST': return 'academic';
            case 'PERFORMANCE': return 'music';
            default: return 'music';
        }
    };

    const getStatusColor = (status) => {
        return statusOptions.find(s => s.value === status)?.color || '#6b7280';
    };

    const renderUpcomingEvents = () => (
        <div className="events-grid">
            {loading && <div>Loading...</div>}
            {!loading && events.upcoming.length === 0 && (
                <div>No upcoming events found. Create your first event!</div>
            )}
            {events.upcoming.map((event) => (
                <div key={event.id} className={`event-card ${event.theme}`}>
                    <div className="card-header">
                        <span className="event-type">{event.type}</span>
                    </div>
                    <div className="card-body">
                        <h3 className="event-title">{event.title}</h3>
                        {event.subtitle && <p className="event-subtitle">{event.subtitle}</p>}
                        <div className="event-details">
                            <div className="detail-item">
                                <HiCalendar className="detail-icon" />
                                <span>{event.date}</span>
                            </div>
                            <div className="detail-item">
                                <HiClock className="detail-icon" />
                                <span>{event.time}</span>
                            </div>
                            <div className="detail-item">
                                <HiLocationMarker className="detail-icon" />
                                <span>{event.location}</span>
                            </div>
                        </div>
                        <div className="card-footer">
                            <span className="status-tag" style={{ backgroundColor: event.statusColor }}>
                                {event.status}
                            </span>
                            <div className="action-icons">
                                <button className="action-icon edit" onClick={() => handleEditClick(event, 'upcoming')}>
                                    <HiPencil />
                                </button>
                                <button className="action-icon delete" onClick={() => handleDeleteClick(event, 'upcoming')}>
                                    <HiTrash />
                                </button>
                                <button className="action-icon view" onClick={() => handleViewClick(event, 'upcoming')}>
                                    <HiEye />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderSpecialEvents = () => (
        <div className="events-grid">
            {events.special.map((event) => (
                <div key={event.id} className={`special-event-card ${event.theme}`}>
                    <div className="special-icon">
                        {event.icon === 'star' ? <HiStar /> : <HiAcademicCap />}
                    </div>
                    <div className="special-content">
                        <div className="special-header">
                            <h3 className="special-title">{event.title}</h3>
                            <span className="special-type">{event.type}</span>
                        </div>
                        <p className="special-subtitle">{event.subtitle}</p>
                        <div className="special-details">
                            <div className="detail-item">
                                <HiCalendar className="detail-icon" />
                                <span>{event.date}</span>
                            </div>
                            <div className="detail-item">
                                <HiLocationMarker className="detail-icon" />
                                <span>{event.location}</span>
                            </div>
                        </div>
                        <div className="special-actions">
                            <button className="view-details-btn" onClick={() => handleViewClick(event, 'special')}>
                                View Details
                            </button>
                            <div className="action-icons">
                                <button className="action-icon edit" onClick={() => handleEditClick(event, 'special')}>
                                    <HiPencil />
                                </button>
                                <button className="action-icon delete" onClick={() => handleDeleteClick(event, 'special')}>
                                    <HiTrash />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            {events.special.length === 0 && (
                <div>No special events found.</div>
            )}
        </div>
    );

    const renderPastEvents = () => (
        <div className="past-events-list">
            {events.past.map((event) => (
                <div key={event.id} className="past-event-item">
                    <div className="past-event-icon">
                        {event.icon === 'music' ? <HiMusicNote /> : <HiPlus />}
                    </div>
                    <div className="past-event-content">
                        <h3 className="past-event-title">{event.title}</h3>
                        <span className="past-event-date">{event.date}</span>
                    </div>
                    <div className="past-event-actions">
                        <span className="status-tag completed">{event.status}</span>
                        <button className="action-icon view" onClick={() => handleViewClick(event, 'past')}>
                            <HiEye />
                        </button>
                    </div>
                </div>
            ))}
            {events.past.length === 0 && (
                <div>No past events found.</div>
            )}
        </div>
    );

    return (
        <div className="events-page">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-left">
                    <h1 className="page-title">Events</h1>
                    <p className="page-subtitle">Manage your choir events, performances, and rehearsals</p>
                </div>
                <div className="header-right">
                    <button className="filter-btn">
                        <HiFilter />
                        Filter
                    </button>
                    <button className="create-event-btn" onClick={handleCreateClick}>
                        <HiPlus />
                        Create Event
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

            {/* Navigation Tabs */}
            <div className="nav-tabs">
                <button 
                    className={`nav-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Upcoming Events
                </button>
                <button 
                    className={`nav-tab ${activeTab === 'special' ? 'active' : ''}`}
                    onClick={() => setActiveTab('special')}
                >
                    Special Events
                </button>
                <button 
                    className={`nav-tab ${activeTab === 'past' ? 'active' : ''}`}
                    onClick={() => setActiveTab('past')}
                >
                    Past Events
                </button>
                <button 
                    className={`nav-tab ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All Events
                </button>
            </div>

            {/* Content Sections */}
            {activeTab === 'upcoming' && (
                <div className="content-section">
                    {renderUpcomingEvents()}
                </div>
            )}

            {activeTab === 'special' && (
                <div className="content-section">
                    <h2 className="section-heading">Special Events</h2>
                    {renderSpecialEvents()}
                </div>
            )}

            {activeTab === 'past' && (
                <div className="content-section">
                    <h2 className="section-heading">Recent Past Events</h2>
                    {renderPastEvents()}
                </div>
            )}

            {activeTab === 'all' && (
                <div className="content-section">
                    <h2 className="section-heading">All Events</h2>
                    <div className="all-events">
                        <div className="upcoming-section">
                            <h3>Upcoming Events</h3>
                            {renderUpcomingEvents()}
                        </div>
                        <div className="special-section">
                            <h3>Special Events</h3>
                            {renderSpecialEvents()}
                        </div>
                        <div className="past-section">
                            <h3>Past Events</h3>
                            {renderPastEvents()}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Event Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Event</h2>
                            <button className="modal-close" onClick={closeModal}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="event-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Event Title</label>
                                    <input 
                                        type="text" 
                                        name="title" 
                                        value={formData.title} 
                                        onChange={handleInputChange} 
                                        placeholder="Enter event title"
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select name="category" value={formData.category} onChange={handleInputChange} required>
                                        {categoryOptions.map(category => (
                                            <option key={category.value} value={category.value}>{category.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description (Optional)</label>
                                <textarea 
                                    name="description" 
                                    value={formData.description} 
                                    onChange={handleInputChange} 
                                    placeholder="Enter event description"
                                    rows="3"
                                />
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
                            <div className="form-group">
                                <label>Location</label>
                                <input 
                                    type="text" 
                                    name="location" 
                                    value={formData.location} 
                                    onChange={handleInputChange} 
                                    placeholder="Enter location"
                                />
                            </div>
                            <div className="form-group">
                                <label>Cover Image URL (Optional)</label>
                                <input 
                                    type="url" 
                                    name="coverImageUrl" 
                                    value={formData.coverImageUrl} 
                                    onChange={handleInputChange} 
                                    placeholder="Enter image URL"
                                />
                            </div>
                            <div className="form-group">
                                <label>
                                    <input 
                                        type="checkbox" 
                                        name="isPublished" 
                                        checked={formData.isPublished} 
                                        onChange={handleInputChange} 
                                    />
                                    Publish Event
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Create Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Event Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Event</h2>
                            <button className="modal-close" onClick={closeModal}>
                                <HiX />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="event-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Event Title</label>
                                    <input 
                                        type="text" 
                                        name="title" 
                                        value={formData.title} 
                                        onChange={handleInputChange} 
                                        placeholder="Enter event title"
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select name="category" value={formData.category} onChange={handleInputChange} required>
                                        {categoryOptions.map(category => (
                                            <option key={category.value} value={category.value}>{category.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description (Optional)</label>
                                <textarea 
                                    name="description" 
                                    value={formData.description} 
                                    onChange={handleInputChange} 
                                    placeholder="Enter event description"
                                    rows="3"
                                />
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
                            <div className="form-group">
                                <label>Location</label>
                                <input 
                                    type="text" 
                                    name="location" 
                                    value={formData.location} 
                                    onChange={handleInputChange} 
                                    placeholder="Enter location"
                                />
                            </div>
                            <div className="form-group">
                                <label>Cover Image URL (Optional)</label>
                                <input 
                                    type="url" 
                                    name="coverImageUrl" 
                                    value={formData.coverImageUrl} 
                                    onChange={handleInputChange} 
                                    placeholder="Enter image URL"
                                />
                            </div>
                            <div className="form-group">
                                <label>
                                    <input 
                                        type="checkbox" 
                                        name="isPublished" 
                                        checked={formData.isPublished} 
                                        onChange={handleInputChange} 
                                    />
                                    Publish Event
                                </label>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Update Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Event Modal */}
            {showViewModal && viewingEvent && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Event Details</h2>
                            <button className="modal-close" onClick={closeModal}>
                                <HiX />
                            </button>
                        </div>
                        <div className="view-content">
                            <div className="view-header">
                                <h3>{viewingEvent.title}</h3>
                                {viewingEvent.subtitle && <p>{viewingEvent.subtitle}</p>}
                            </div>
                            <div className="view-details">
                                <div className="detail-row">
                                    <span className="detail-label">Type:</span>
                                    <span className="detail-value">{viewingEvent.type}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Date:</span>
                                    <span className="detail-value">{viewingEvent.date}</span>
                                </div>
                                {viewingEvent.time && (
                                    <div className="detail-row">
                                        <span className="detail-label">Time:</span>
                                        <span className="detail-value">{viewingEvent.time}</span>
                                    </div>
                                )}
                                {viewingEvent.location && (
                                    <div className="detail-row">
                                        <span className="detail-label">Location:</span>
                                        <span className="detail-value">{viewingEvent.location}</span>
                                    </div>
                                )}
                                <div className="detail-row">
                                    <span className="detail-label">Status:</span>
                                    <span className="detail-value">{viewingEvent.status}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Published:</span>
                                    <span className="detail-value">{viewingEvent.isPublished ? 'Yes' : 'No'}</span>
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
                            <h2>Delete Event</h2>
                            <button className="modal-close" onClick={closeModal}>
                                <HiX />
                            </button>
                        </div>
                        <div className="delete-content">
                            <p>Are you sure you want to delete <strong>"{deletingEvent?.title}"</strong>?</p>
                            <p>This action cannot be undone.</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={closeModal}>
                                Cancel
                            </button>
                            <button className="btn-danger" onClick={handleDeleteConfirm}>
                                Delete Event
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewEvents;