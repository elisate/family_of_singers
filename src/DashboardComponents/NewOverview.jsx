import React from 'react';
import { HiCalendar, HiPhotograph, HiCollection, HiHeart, HiChartBar, HiTrendingUp, HiClock, HiEye, HiPlus, HiPencil } from 'react-icons/hi';
import './dashboardStyles/newOverview.css';

const NewOverview = () => {
    const stats = [
        { title: 'Total Schedules', value: '24', icon: HiCalendar, color: 'rgba(255, 147, 0, 1)' },
        { title: 'Upcoming Events', value: '8', icon: HiPhotograph, color: '#548D1F' },
        { title: 'Active Commissions', value: '12', icon: HiCollection, color: 'rgba(255, 147, 0, 1)' },
        { title: 'Monthly Donations', value: '$2,450', icon: HiHeart, color: '#548D1F' }
    ];

    return (
        <div className="new-overview">
            {/* Overview Cards */}
            <div className="overview-cards">
                {stats.map((stat, index) => {
                    const IconComponent = stat.icon;
                    return (
                        <div key={index} className="stat-card">
                            <div className="stat-icon" style={{ backgroundColor: stat.color + '20' }}>
                                <IconComponent style={{ color: stat.color }} />
                            </div>
                            <div className="stat-content">
                                <h3 className="stat-title">{stat.title}</h3>
                                <div className="stat-value">{stat.value}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Management Sections */}
            <div className="management-sections">
                <div className="left-column">
                    {/* Schedule Management */}
                    <div className="management-card">
                        <div className="card-header">
                            <h3>Schedule Management</h3>
                            <button className="create-btn purple">
                                <HiPlus />
                                Create Schedule
                            </button>
                        </div>
                        <div className="card-content">
                            <div className="list-item">
                                <div className="item-info">
                                    <div className="item-title">Sunday Morning Rehearsal</div>
                                    <div className="item-subtitle">Jan 15, 2024 - 9:00 AM</div>
                                </div>
                                <div className="item-actions">
                                    <HiClock />
                                </div>
                            </div>
                            <div className="list-item">
                                <div className="item-info">
                                    <div className="item-title">Evening Performance</div>
                                    <div className="item-subtitle">Jan 20, 2024 - 7:00 PM</div>
                                </div>
                                <div className="item-actions">
                                    <HiClock />
                                </div>
                            </div>
                        </div>
                        <div className="card-footer">
                            <a href="#" className="view-all">View All Schedules</a>
                        </div>
                    </div>

                    {/* Events Management */}
                    <div className="management-card">
                        <div className="card-header">
                            <h3>Events Management</h3>
                            <button className="view-btn teal">
                                <HiEye />
                                View Events
                            </button>
                        </div>
                        <div className="card-content">
                            <div className="list-item">
                                <div className="item-info">
                                    <div className="item-title">Annual Concert</div>
                                    <div className="item-subtitle">Feb 14, 2024 - Main Hall</div>
                                </div>
                                <div className="item-actions">
                                    <span className="star">⭐</span>
                                </div>
                            </div>
                            <div className="list-item">
                                <div className="item-info">
                                    <div className="item-title">Christmas Special</div>
                                    <div className="item-subtitle">Dec 25, 2024 - Cathedral</div>
                                </div>
                                <div className="item-actions">
                                    <span className="star">⭐</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Support & Donations */}
                    <div className="management-card">
                        <div className="card-header">
                            <h3>Support & Donations</h3>
                            <button className="create-btn red">
                                <HiPlus />
                                Create Donation
                            </button>
                        </div>
                        <div className="card-content">
                            <div className="list-item">
                                <div className="item-info">
                                    <div className="item-title">Anonymous Donor</div>
                                    <div className="item-subtitle">Jan 10, 2024</div>
                                </div>
                                <div className="item-amount">$500</div>
                            </div>
                            <div className="list-item">
                                <div className="item-info">
                                    <div className="item-title">Local Business</div>
                                    <div className="item-subtitle">Jan 8, 2024</div>
                                </div>
                                <div className="item-amount">$1,200</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="right-column">
                    {/* Commission Management */}
                    <div className="management-card">
                        <div className="card-header">
                            <h3>Commission Management</h3>
                            <button className="create-btn purple">
                                <HiPlus />
                                Create Commission
                            </button>
                        </div>
                        <div className="card-content">
                            <div className="list-item">
                                <div className="item-info">
                                    <div className="item-title">Wedding Ceremony</div>
                                    <div className="item-subtitle">Client: Johnson Family</div>
                                </div>
                                <div className="status-badge active">Active</div>
                            </div>
                            <div className="list-item">
                                <div className="item-info">
                                    <div className="item-title">Corporate Event</div>
                                    <div className="item-subtitle">Client: Tech Corp</div>
                                </div>
                                <div className="status-badge pending">Pending</div>
                            </div>
                        </div>
                        <div className="card-footer">
                            <a href="#" className="view-all">View All Commissions</a>
                        </div>
                    </div>

                    {/* Content Management */}
                    <div className="management-card">
                        <div className="card-header">
                            <h3>Content Management</h3>
                            <button className="edit-btn purple">
                                <HiPencil />
                                Edit Content
                            </button>
                        </div>
                        <div className="card-content">
                            <div className="content-info">
                                <div className="item-title">About Page Content</div>
                                <div className="item-subtitle">Last updated: Jan 5, 2024</div>
                            </div>
                        </div>
                        <div className="card-footer">
                            <a href="#" className="view-all">View & Edit →</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewOverview;
