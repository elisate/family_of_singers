import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';


import logo from '../assets/mainlogo.png';
import '../styles/navbar.css';

function Navbar() {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);


    const getNavbarClass = () => {
        switch (location.pathname) {
            case '/':
                return 'navbar home-navbar';
            case '/about':
                return 'navbar about-navbar';
            case '/schedule':
                return 'navbar schedule-navbar';
            case '/commissions':
                return 'navbar commissions-navbar';
            default:
                return 'navbar';
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleDropdown = (index) => {
        setActiveDropdown(activeDropdown === index ? null : index);
    };



    return (
        <>
            <nav className={getNavbarClass()}>
                <div className="navbar-container">
                                    <div className="navbar-logo">
                    <img 
                        src={logo} 
                        alt="Logo" 
                    />
                </div>
                    <button className="mobile-menu-btn" onClick={toggleMenu}>
                        ☰
                    </button>
                    <ul className={`navbar-links ${isMenuOpen ? 'active' : ''}`}>
                        <li><Link to="/" id="home-link">Home</Link></li>
                        <li><Link to="/about">About Us</Link></li>
                        <div className={`dropdown ${activeDropdown === 0 ? 'active' : ''}`}>
                            <li>
                                <Link 
                                    to="#" 
                                    className="dropdown-toggle"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleDropdown(0);
                                    }}
                                >
                                    Events
                                </Link>
                            </li>
                            <div className="dropdown-content">
                                <li><Link to="#">Upcoming Events</Link></li>
                                <li><Link to="#">Past Events</Link></li>
                                <li><Link to="#">Special Programs</Link></li>
                            </div>
                        </div>
                                            <li><Link to="/schedule">Our Schedule</Link></li>
                    <li><Link to="/commissions">Commissions</Link></li>
                    <li><Link to="/support" className="support-btn">Support Us</Link></li>
                    

                    </ul>
                </div>
            </nav>
            
            
        </>
    );
}

export default Navbar;
