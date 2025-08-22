import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { HiBell, HiCog, HiLogout, HiUser, HiMail, HiPhone, HiLocationMarker, HiPencil, HiX } from 'react-icons/hi';
import NewSidebar from '../DashboardComponents/NewSidebar';
import NewOverview from "../DashboardComponents/NewOverview";
import NewMedia from "../DashboardComponents/NewMedia";
import NewSchedule from "../DashboardComponents/NewSchedule";
import NewCommissions from "../DashboardComponents/NewCommissions";
import NewEvents from "../DashboardComponents/NewEvents";
import NewSupport from "../DashboardComponents/NewSupport";
import NewContent from "../DashboardComponents/NewContent";
import "../DashboardComponents/dashboardStyles/newDashboard.css";

const AdminDashboard = () => {
    const [activeSection, setActiveSection] = useState("overview");
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const { user, logout } = useAuth();

    // Profile data state
    const [profileData, setProfileData] = useState({
        name: user?.name || 'Sarah Johnson',
        email: 'sarah.johnson@choir.com',
        phone: '+1 (555) 123-4567',
        location: 'New York, NY',
        role: 'Administrator'
    });

    // Sample notifications data
    const [notifications] = useState([
        {
            id: 1,
            type: 'event',
            title: 'New Event Created',
            message: 'Winter Concert has been scheduled for December 15th',
            time: '2 hours ago',
            read: false
        },
        {
            id: 2,
            type: 'donation',
            title: 'New Donation Received',
            message: 'Anonymous donor contributed $500 to the choir fund',
            time: '4 hours ago',
            read: false
        },
        {
            id: 3,
            type: 'member',
            title: 'New Member Joined',
            message: 'Sarah Wilson has joined the choir',
            time: '1 day ago',
            read: true
        },
        {
            id: 4,
            type: 'schedule',
            title: 'Rehearsal Reminder',
            message: 'Weekly rehearsal starts in 30 minutes',
            time: '2 days ago',
            read: true
        }
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const renderContent = () => {
        switch (activeSection) {
            case "overview":
                return <NewOverview />;
            case "media":
                return <NewMedia />;
            case "schedule":
                return <NewSchedule />;
            case "commissions":
                return <NewCommissions />;
            case "events":
                return <NewEvents />;
            case "support":
                return <NewSupport />;
            case "content":
                return <NewContent />;
            default:
                return <NewOverview />;
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'event': return '🎵';
            case 'donation': return '💰';
            case 'member': return '👥';
            case 'schedule': return '📅';
            default: return '🔔';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'event': return 'rgba(255, 147, 0, 0.1)';
            case 'donation': return 'rgba(34, 197, 94, 0.1)';
            case 'member': return 'rgba(59, 130, 246, 0.1)';
            case 'schedule': return 'rgba(168, 85, 247, 0.1)';
            default: return 'rgba(255, 147, 0, 0.1)';
        }
    };

    const handleProfileInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveProfile = () => {
        // Here you would typically save to backend
        console.log('Profile updated:', profileData);
        setShowEditProfile(false);
    };

    return (
        <div className="admin-dashboard">
            <NewSidebar setActiveSection={setActiveSection} activeSection={activeSection} />
            
            <div className="main-content">
                <div className="top-header">
                    <div className="header-left">
                        <h1 className="page-title">
                            {activeSection === "overview" ? "Dashboard Overview" : 
                             activeSection === "media" ? "Media Management" :
                             activeSection === "schedule" ? "Schedule Management" :
                             activeSection === "commissions" ? "Commission Management" :
                             activeSection === "events" ? "Event Management" :
                             activeSection === "support" ? "Donation Management" :
                             activeSection === "content" ? "Content Management" :
                             activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
                        </h1>
                        <p className="welcome-text">Welcome back, {user?.name || 'Admin'}</p>
                    </div>
                    
                    <div className="header-right">
                        <div className="notification-icon" onClick={() => setShowNotifications(!showNotifications)}>
                            <HiBell />
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}
                        </div>
                        
                        <div className="user-profile" onClick={() => setShowProfile(!showProfile)}>
                            <div className="user-avatar">
                                <span>{profileData.name.charAt(0)}</span>
                            </div>
                            <div className="user-info">
                                <span className="user-name">{profileData.name}</span>
                                <span className="user-role">{profileData.role}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications Modal */}
                {showNotifications && (
                    <div className="modal-overlay" onClick={() => setShowNotifications(false)}>
                        <div className="notifications-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Notifications</h3>
                                <button className="close-btn" onClick={() => setShowNotifications(false)}>×</button>
                            </div>
                            <div className="notifications-list">
                                {notifications.map((notification) => (
                                    <div key={notification.id} className={`notification-item ${!notification.read ? 'unread' : ''}`}>
                                        <div className="notification-icon-small" style={{ backgroundColor: getNotificationColor(notification.type) }}>
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="notification-content">
                                            <h4>{notification.title}</h4>
                                            <p>{notification.message}</p>
                                            <span className="notification-time">{notification.time}</span>
                                        </div>
                                        {!notification.read && <div className="unread-dot"></div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Profile Modal */}
                {showProfile && (
                    <div className="modal-overlay" onClick={() => setShowProfile(false)}>
                        <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Profile Settings</h3>
                                <button className="close-btn" onClick={() => setShowProfile(false)}>×</button>
                            </div>
                            <div className="profile-content">
                                <div className="profile-avatar-section">
                                    <div className="profile-avatar">
                                        <span>{profileData.name.charAt(0)}</span>
                                    </div>
                                    <div className="profile-info">
                                        <h4>{profileData.name}</h4>
                                        <p>{profileData.role}</p>
                                    </div>
                                </div>
                                
                                <div className="profile-details">
                                    <div className="detail-item">
                                        <HiMail />
                                        <span>{profileData.email}</span>
                                    </div>
                                    <div className="detail-item">
                                        <HiPhone />
                                        <span>{profileData.phone}</span>
                                    </div>
                                    <div className="detail-item">
                                        <HiLocationMarker />
                                        <span>{profileData.location}</span>
                                    </div>
                                </div>

                                <div className="profile-actions">
                                    <button className="profile-btn" onClick={() => setShowEditProfile(true)}>
                                        <HiUser />
                                        Edit Profile
                                    </button>
                                    <button className="profile-btn">
                                        <HiCog />
                                        Settings
                                    </button>
                                    <button className="profile-btn logout-btn" onClick={logout}>
                                        <HiLogout />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Profile Modal */}
                {showEditProfile && (
                    <div className="modal-overlay" onClick={() => setShowEditProfile(false)}>
                        <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Edit Profile</h3>
                                <button className="close-btn" onClick={() => setShowEditProfile(false)}>×</button>
                            </div>
                            <div className="edit-profile-content">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profileData.name}
                                        onChange={handleProfileInputChange}
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleProfileInputChange}
                                        placeholder="Enter your email"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={profileData.phone}
                                        onChange={handleProfileInputChange}
                                        placeholder="Enter your phone number"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Location</label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={profileData.location}
                                        onChange={handleProfileInputChange}
                                        placeholder="Enter your location"
                                    />
                                </div>

                                <div className="edit-profile-actions">
                                    <button className="cancel-btn" onClick={() => setShowEditProfile(false)}>
                                        <HiX />
                                        Cancel
                                    </button>
                                    <button className="save-btn" onClick={handleSaveProfile}>
                                        <HiPencil />
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="content-body">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
