import React from "react";
import {
    HiHome,
    HiCalendar,
    HiCollection,
    HiBell,
    HiPhotograph,
    HiDocumentText,
    HiHeart,
    HiChartBar,
    HiCog,
    HiLogout
} from "react-icons/hi";
import { useAuth } from "../contexts/AuthContext";
import "./dashboardStyles/newSidebar.css";
import mainLogo from '../assets/mainlogo.png';

const NewSidebar = ({ setActiveSection, activeSection }) => {
    const { logout } = useAuth();

    const menuItems = [
        { id: "overview", label: "Dashboard", icon: HiHome, color: "rgba(255, 147, 0, 1)" },
        { id: "schedule", label: "Schedules", icon: HiCalendar, color: "#548D1F" },
        { id: "commissions", label: "Commissions", icon: HiCollection, color: "rgba(255, 147, 0, 1)" },
        { id: "events", label: "Events", icon: HiBell, color: "#548D1F" },
        { id: "media", label: "Media", icon: HiPhotograph, color: "rgba(255, 147, 0, 1)" },
        { id: "support", label: "Donations", icon: HiHeart, color: "#548D1F" },
        { id: "content", label: "Content", icon: HiDocumentText, color: "rgba(255, 147, 0, 1)" }
    ];

    return (
        <div className="new-sidebar">
            <div className="sidebar-header">
                <div className="brand-section">
                <img src={mainLogo} alt="Choir Logo" className="brand-logo" />
                    <div className="brand-text">
                        <div className="brand-name">ChoirAdmin</div>
                        <div className="brand-subtitle">Management System</div>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={`nav-item ${activeSection === item.id ? "active" : ""}`}
                        >
                            <div className="nav-icon">
                                <IconComponent />
                            </div>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <button onClick={logout} className="logout-btn">
                    <HiLogout />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default NewSidebar;
