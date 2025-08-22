import React, { useEffect, useState } from 'react';
import { HiCurrencyDollar, HiUsers, HiShoppingBag, HiChartPie, HiPlus, HiTrash, HiCalendar, HiEye } from 'react-icons/hi';
import './dashboardStyles/newSupport.css';
import { DonationApi } from '../api/endpoints.js';

const NewSupport = () => {
    const [campaigns, setCampaigns] = useState([]);

    const [recentDonations, setRecentDonations] = useState([]);

    const [allDonations, setAllDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await DonationApi.list({ limit: 100, sort: '-createdAt' });
                if (!mounted) return;
                const items = Array.isArray(data.items) ? data.items : [];
                const mapped = items.map(d => ({
                    id: d._id,
                    name: d.donorName,
                    amount: d.amount,
                    time: new Date(d.createdAt || Date.now()).toLocaleString(),
                    avatar: (d.donorName || ' ').split(' ').map(n => n[0]).join('').toUpperCase(),
                    campaign: d.message || '',
                    email: d.donorEmail || '',
                    date: new Date(d.createdAt || Date.now()).toISOString().slice(0,10)
                }));
                setAllDonations(mapped);
                setRecentDonations(mapped.slice(0,5));
                setCampaigns([]);
            } catch (err) {
                setError(err?.message || 'Failed to load donations');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    const [formData, setFormData] = useState({
        campaignName: 'Spring Concert Fundraiser',
        goalAmount: '5000',
        description: 'Help us raise funds for our upcoming spring concert featuring classical and contemporary pieces. Your support will help cover venue costs, equipment, and promotional materials.',
        startDate: '',
        endDate: '',
        donationTiers: [
            { id: 1, name: 'Supporter', amount: 25 },
            { id: 2, name: 'Patron', amount: 100 }
        ]
    });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showQuickAddModal, setShowQuickAddModal] = useState(false);
    const [showAllDonationsModal, setShowAllDonationsModal] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);
    const [deletingCampaign, setDeletingCampaign] = useState(null);
    const [viewingCampaign, setViewingCampaign] = useState(null);
    const [quickAddData, setQuickAddData] = useState({
        name: '',
        goalAmount: '',
        description: ''
    });

    const summaryStats = [
        {
            title: 'Total Raised',
            value: '$12,450',
            icon: HiCurrencyDollar,
            color: 'green'
        },
        {
            title: 'Active Donors',
            value: '87',
            icon: HiUsers,
            color: 'blue'
        },
        {
            title: 'This Month',
            value: '$2,340',
            icon: HiShoppingBag,
            color: 'purple'
        },
        {
            title: 'Goal Progress',
            value: '62%',
            icon: HiChartPie,
            color: 'orange'
        }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddTier = () => {
        const newTier = {
            id: Date.now(),
            name: '',
            amount: ''
        };
        setFormData(prev => ({
            ...prev,
            donationTiers: [...prev.donationTiers, newTier]
        }));
    };

    const handleTierChange = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            donationTiers: prev.donationTiers.map(tier =>
                tier.id === id ? { ...tier, [field]: value } : tier
            )
        }));
    };

    const handleRemoveTier = (id) => {
        setFormData(prev => ({
            ...prev,
            donationTiers: prev.donationTiers.filter(tier => tier.id !== id)
        }));
    };

    const handleCreateCampaign = (e) => {
        e.preventDefault();
        const newCampaign = {
            id: Date.now(),
            name: formData.campaignName,
            status: 'Planning',
            raised: 0,
            goal: parseInt(formData.goalAmount),
            progress: 0
        };
        setCampaigns(prev => [...prev, newCampaign]);
        setShowCreateModal(false);
        resetForm();
    };

    const handleEditClick = (campaign) => {
        setEditingCampaign(campaign);
        setFormData({
            campaignName: campaign.name,
            goalAmount: campaign.goal.toString(),
            description: 'Campaign description...',
            startDate: '',
            endDate: '',
            donationTiers: [
                { id: 1, name: 'Supporter', amount: 25 },
                { id: 2, name: 'Patron', amount: 100 }
            ]
        });
        setShowEditModal(true);
    };

    const handleDeleteClick = (campaign) => {
        setDeletingCampaign(campaign);
        setShowDeleteModal(true);
    };

    const handleViewClick = (campaign) => {
        setViewingCampaign(campaign);
        setShowViewModal(true);
    };

    const handleDeleteConfirm = () => {
        setCampaigns(prev => prev.filter(c => c.id !== deletingCampaign.id));
        setShowDeleteModal(false);
        setDeletingCampaign(null);
    };

    const handleQuickAdd = () => {
        setQuickAddData({
            name: '',
            goalAmount: '',
            description: ''
        });
        setShowQuickAddModal(true);
    };

    const handleQuickAddSubmit = (e) => {
        e.preventDefault();
        const newCampaign = {
            id: Date.now(),
            name: quickAddData.name,
            status: 'Active',
            raised: 0,
            goal: parseInt(quickAddData.goalAmount) || 0,
            progress: 0
        };
        setCampaigns(prev => [...prev, newCampaign]);
        setShowQuickAddModal(false);
        setQuickAddData({ name: '', goalAmount: '', description: '' });
    };

    const handleQuickAddInputChange = (e) => {
        const { name, value } = e.target;
        setQuickAddData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleViewAllDonations = () => {
        setShowAllDonationsModal(true);
    };

    const resetForm = () => {
        setFormData({
            campaignName: '',
            goalAmount: '',
            description: '',
            startDate: '',
            endDate: '',
            donationTiers: []
        });
    };

    const closeModal = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setShowViewModal(false);
        setShowQuickAddModal(false);
        setShowAllDonationsModal(false);
        setEditingCampaign(null);
        setDeletingCampaign(null);
        setViewingCampaign(null);
        resetForm();
    };

    return (
        <div className="support-page">
            {/* Summary Statistics */}
            <div className="summary-stats">
                {summaryStats.map((stat, index) => (
                    <div key={index} className={`stat-card ${stat.color}`}>
                        <div className="stat-icon">
                            <stat.icon />
                        </div>
                        <div className="stat-content">
                            <h3 className="stat-value">{stat.value}</h3>
                            <p className="stat-title">{stat.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="support-content">
                {/* Create Campaign Form */}
                <div className="campaign-form-section">
                    <div className="form-header">
                        <h2>Create New Donation Campaign</h2>
                        <button className="quick-add-btn" onClick={handleQuickAdd}>
                            <HiPlus />
                            Quick Add
                        </button>
                    </div>
                    
                    <form className="campaign-form" onSubmit={handleCreateCampaign}>
                        <div className="form-group">
                            <label>Campaign Name</label>
                            <input
                                type="text"
                                name="campaignName"
                                value={formData.campaignName}
                                onChange={handleInputChange}
                                placeholder="Enter campaign name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Goal Amount</label>
                            <div className="amount-input">
                                <span className="currency-symbol">$</span>
                                <input
                                    type="number"
                                    name="goalAmount"
                                    value={formData.goalAmount}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe your campaign..."
                                rows="4"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Date</label>
                                <div className="date-input">
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <HiCalendar className="calendar-icon" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>End Date</label>
                                <div className="date-input">
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <HiCalendar className="calendar-icon" />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Donation Tiers</label>
                            <div className="donation-tiers">
                                {formData.donationTiers.map((tier) => (
                                    <div key={tier.id} className="tier-item">
                                        <input
                                            type="text"
                                            placeholder="Tier name"
                                            value={tier.name}
                                            onChange={(e) => handleTierChange(tier.id, 'name', e.target.value)}
                                            className="tier-name"
                                        />
                                        <div className="tier-amount">
                                            <span className="currency-symbol">$</span>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={tier.amount}
                                                onChange={(e) => handleTierChange(tier.id, 'amount', e.target.value)}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className="remove-tier-btn"
                                            onClick={() => handleRemoveTier(tier.id)}
                                        >
                                            <HiTrash />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="add-tier-btn"
                                    onClick={handleAddTier}
                                >
                                    <HiPlus />
                                    Add Tier
                                </button>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-primary">
                                Create Campaign
                            </button>
                            <button type="button" className="btn-secondary">
                                Save Draft
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Side Sections */}
                <div className="right-sections">
                    {/* Active Campaigns */}
                    <div className="active-campaigns-section">
                        <h3>Active Campaigns</h3>
                        <div className="campaigns-list">
                            {campaigns.map((campaign) => (
                                <div key={campaign.id} className="campaign-item">
                                    <div className="campaign-header">
                                        <h4 className="campaign-name">{campaign.name}</h4>
                                        <span className={`status-tag ${campaign.status.toLowerCase()}`}>
                                            {campaign.status}
                                        </span>
                                    </div>
                                    <div className="campaign-progress">
                                        <div className="progress-info">
                                            <span className="raised-amount">${campaign.raised.toLocaleString()}</span>
                                            <span className="goal-amount">of ${campaign.goal.toLocaleString()} raised</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill" 
                                                style={{ width: `${campaign.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="campaign-actions">
                                        <button 
                                            className="action-btn view"
                                            onClick={() => handleViewClick(campaign)}
                                        >
                                            <HiEye />
                                        </button>
                                        <button 
                                            className="action-btn edit"
                                            onClick={() => handleEditClick(campaign)}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            className="action-btn delete"
                                            onClick={() => handleDeleteClick(campaign)}
                                        >
                                            <HiTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Donations */}
                    <div className="recent-donations-section">
                        <h3>Recent Donations</h3>
                        <div className="donations-list">
                            {loading && <div>Loading...</div>}
                            {error && <div>{error}</div>}
                            {recentDonations.map((donation) => (
                                <div key={donation.id} className="donation-item">
                                    <div className="donor-avatar">
                                        {donation.avatar}
                                    </div>
                                    <div className="donation-details">
                                        <h4 className="donor-name">{donation.name}</h4>
                                        <span className="donation-amount">${donation.amount}</span>
                                        <span className="donation-time">{donation.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <a href="#" className="view-all-btn" onClick={handleViewAllDonations}>
                            View All Donations
                        </a>
                    </div>
                </div>
            </div>

            {/* Edit Campaign Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Campaign</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form className="campaign-form">
                            <div className="form-group">
                                <label>Campaign Name</label>
                                <input
                                    type="text"
                                    name="campaignName"
                                    value={formData.campaignName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Goal Amount</label>
                                <div className="amount-input">
                                    <span className="currency-symbol">$</span>
                                    <input
                                        type="number"
                                        name="goalAmount"
                                        value={formData.goalAmount}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Update Campaign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Campaign Modal */}
            {showViewModal && viewingCampaign && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Campaign Details</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="view-content">
                            <div className="view-header">
                                <h3>{viewingCampaign.name}</h3>
                                <span className={`status-tag ${viewingCampaign.status.toLowerCase()}`}>
                                    {viewingCampaign.status}
                                </span>
                            </div>
                            <div className="view-details">
                                <div className="detail-row">
                                    <span className="detail-label">Goal:</span>
                                    <span className="detail-value">${viewingCampaign.goal.toLocaleString()}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Raised:</span>
                                    <span className="detail-value">${viewingCampaign.raised.toLocaleString()}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Progress:</span>
                                    <span className="detail-value">{viewingCampaign.progress}%</span>
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
                            <h2>Delete Campaign</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="delete-content">
                            <p>Are you sure you want to delete <strong>"{deletingCampaign?.name}"</strong>?</p>
                            <p>This action cannot be undone.</p>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={closeModal}>
                                Cancel
                            </button>
                            <button className="btn-danger" onClick={handleDeleteConfirm}>
                                Delete Campaign
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Add Campaign Modal */}
            {showQuickAddModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content quick-add-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Quick Add Campaign</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <form className="campaign-form" onSubmit={handleQuickAddSubmit}>
                            <div className="form-group">
                                <label>Campaign Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={quickAddData.name}
                                    onChange={handleQuickAddInputChange}
                                    placeholder="Enter campaign name"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Goal Amount</label>
                                <div className="amount-input">
                                    <span className="currency-symbol">$</span>
                                    <input
                                        type="number"
                                        name="goalAmount"
                                        value={quickAddData.goalAmount}
                                        onChange={handleQuickAddInputChange}
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={quickAddData.description}
                                    onChange={handleQuickAddInputChange}
                                    placeholder="Describe your campaign..."
                                    rows="4"
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Create Campaign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View All Donations Modal */}
            {showAllDonationsModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content all-donations-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>All Donations</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        <div className="donations-content">
                            <div className="donations-summary">
                                <div className="summary-item">
                                    <span className="summary-label">Total Donations:</span>
                                    <span className="summary-value">{allDonations.length}</span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Total Amount:</span>
                                    <span className="summary-value">
                                        ${allDonations.reduce((sum, donation) => sum + donation.amount, 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="summary-item">
                                    <span className="summary-label">Average Donation:</span>
                                    <span className="summary-value">
                                        ${Math.round(allDonations.reduce((sum, donation) => sum + donation.amount, 0) / allDonations.length).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <div className="donations-list-all">
                                {allDonations.map((donation) => (
                                    <div key={donation.id} className="donation-item-all">
                                        <div className="donor-avatar-all">
                                            {donation.avatar}
                                        </div>
                                        <div className="donation-details-all">
                                            <div className="donor-info">
                                                <h4 className="donor-name-all">{donation.name}</h4>
                                                <span className="donor-email">{donation.email}</span>
                                            </div>
                                            <div className="donation-info">
                                                <span className="donation-amount-all">${donation.amount.toLocaleString()}</span>
                                                <span className="donation-campaign">{donation.campaign}</span>
                                                <span className="donation-date">{donation.date}</span>
                                            </div>
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

export default NewSupport;
