import React, { useState } from 'react';
import '../styles/SupportUs.css';

const SupportUs = () => {
    const [showDonationModal, setShowDonationModal] = useState(false);
    const [donationAmount, setDonationAmount] = useState('');
    const [donorInfo, setDonorInfo] = useState({
        name: '',
        email: '',
        message: ''
    });

    const handleDonationSubmit = (e) => {
        e.preventDefault();
        console.log('Donation submitted:', {
            amount: donationAmount,
            donor: donorInfo
        });
        
        alert('Thank you for your donation! You will receive a confirmation email shortly.');
        setShowDonationModal(false);
        setDonationAmount('');
        setDonorInfo({ name: '', email: '', message: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDonorInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const closeModal = () => {
        setShowDonationModal(false);
        setDonationAmount('');
        setDonorInfo({ name: '', email: '', message: '' });
    };

    return (
        <div className="support-us-page">
            <div className="support-hero">
                <div className="hero-content">
                    <h1>Support Our Choir</h1>
                    <p>Help us create beautiful music and bring joy to our community</p>
                    <button 
                        className="donate-btn"
                        onClick={() => setShowDonationModal(true)}
                    >
                        Donate Now
                    </button>
                </div>
            </div>

            <div className="support-content">
                <section className="why-support">
                    <h2>Why Support Our Choir?</h2>
                    <div className="reasons-grid">
                        <div className="reason-card">
                            <h3>Community Impact</h3>
                            <p>We bring people together through the universal language of music, creating lasting bonds in our community.</p>
                        </div>
                        <div className="reason-card">
                            <h3>Cultural Enrichment</h3>
                            <p>We preserve and promote diverse musical traditions, from classical masterpieces to contemporary compositions.</p>
                        </div>
                        <div className="reason-card">
                            <h3>Youth Development</h3>
                            <p>We provide opportunities for young musicians to develop their talents and discover their passion for music.</p>
                        </div>
                    </div>
                </section>

                <section className="donation-tiers">
                    <h2>Donation Tiers</h2>
                    <div className="tiers-grid">
                        <div className="tier-card">
                            <h3>Supporter</h3>
                            <div className="tier-amount">$25</div>
                            <ul>
                                <li>Thank you card</li>
                                <li>Name in program</li>
                            </ul>
                            <button 
                                className="tier-donate-btn"
                                onClick={() => {
                                    setDonationAmount(25);
                                    setShowDonationModal(true);
                                }}
                            >
                                Choose This Tier
                            </button>
                        </div>
                        <div className="tier-card">
                            <h3>Patron</h3>
                            <div className="tier-amount">$100</div>
                            <ul>
                                <li>VIP seating</li>
                                <li>Meet & greet</li>
                                <li>Signed program</li>
                            </ul>
                            <button 
                                className="tier-donate-btn"
                                onClick={() => {
                                    setDonationAmount(100);
                                    setShowDonationModal(true);
                                }}
                            >
                                Choose This Tier
                            </button>
                        </div>
                        <div className="tier-card">
                            <h3>Benefactor</h3>
                            <div className="tier-amount">$250</div>
                            <ul>
                                <li>All Patron benefits</li>
                                <li>Private performance</li>
                                <li>Recognition plaque</li>
                            </ul>
                            <button 
                                className="tier-donate-btn"
                                onClick={() => {
                                    setDonationAmount(250);
                                    setShowDonationModal(true);
                                }}
                            >
                                Choose This Tier
                            </button>
                        </div>
                        <div className="tier-card">
                            <h3>Champion</h3>
                            <div className="tier-amount">$500</div>
                            <ul>
                                <li>All Benefactor benefits</li>
                                <li>Dedicated song</li>
                                <li>Annual report mention</li>
                            </ul>
                            <button 
                                className="tier-donate-btn"
                                onClick={() => {
                                    setDonationAmount(500);
                                    setShowDonationModal(true);
                                }}
                            >
                                Choose This Tier
                            </button>
                        </div>
                    </div>
                </section>
            </div>

            {/* Donation Modal */}
            {showDonationModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Make a Donation</h2>
                            <button className="modal-close" onClick={closeModal}>×</button>
                        </div>
                        
                        <form onSubmit={handleDonationSubmit} className="donation-form">
                            <div className="form-group">
                                <label>Donation Amount</label>
                                <div className="amount-input">
                                    <span className="currency">$</span>
                                    <input
                                        type="number"
                                        value={donationAmount}
                                        onChange={(e) => setDonationAmount(e.target.value)}
                                        placeholder="0.00"
                                        min="1"
                                        step="0.01"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Your Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={donorInfo.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={donorInfo.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Message (Optional)</label>
                                <textarea
                                    name="message"
                                    value={donorInfo.message}
                                    onChange={handleInputChange}
                                    placeholder="Share why you're supporting us..."
                                    rows="3"
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Complete Donation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportUs;
