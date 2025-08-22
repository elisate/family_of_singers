import React, { useEffect, useState } from 'react';
import '../styles/Schedule.css';
import { FaDrum, FaPeopleGroup} from "react-icons/fa6";
import { ScheduleApi } from '../api/endpoints.js';
// import familyIcon from '../assets/family-icon.png';
// import technicalIcon from '../assets/technical-icon.png';

const Schedule = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await ScheduleApi.list({ limit: 50, sort: '-createdAt' });
        if (!mounted) return;
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch (err) {
        setError(err?.message || 'Failed to load schedule');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="schedule-page">
      {/* Header Section */}
      <div className="schedule-header">
        <div className="schedule-header-overlay">
          <h1>Our Schedule</h1>
          <div className="breadcrumb">
            <span>HOME</span> / <span className="current">OUR SCHEDULE</span>
          </div>
        </div>
      </div>

      {/* Schedule Content */}
      <div className="schedule-content">
        <div className="section-heading">
          <hr className="title-line" />
          <h2>Our Schedule</h2>
          <hr className="title-line" />
        </div>

        <h3 className="practices-title">Practices</h3>

        <div className="choir-groups">
          <div className='choir fos'>
          <div className="choir-group">
          <FaPeopleGroup className="drum-icon" /></div>
          <div className="group-info">
              <h4>FOS</h4>
              <p>Family of Singers</p> 
          </div>
          </div>
          <div className='choir technical-team'>
          <div className="choir-group">
          <FaDrum className="drum-icon" /></div>
            <div className="group-info">
              <h4>Reduction</h4>
              <p>Technical Team</p>
              </div> 
          </div>
        </div>

        <div className="schedule-grid">
          {loading && (
            <div className="schedule-day"><p className="schedule-location">Loading schedule...</p></div>
          )}
          {error && (
            <div className="schedule-day"><p className="schedule-location">{error}</p></div>
          )}
          {!loading && !error && items.length === 0 && (
            <div className="schedule-day"><p className="schedule-location">No schedule yet.</p></div>
          )}
          {!loading && !error && items.map((item) => {
            const date = item.date ? new Date(item.date) : null;
            const dateLabel = date ? date.toLocaleDateString() : 'Date TBA';
            const category = item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'Other';
            return (
              <div className="schedule-day" key={item._id}>
                <div className="day-header">
                  <h4>{item.title || category}</h4>
                  <span className="schedule-time">{dateLabel}</span>
                </div>
                <hr className="day-divider" />
                <p className="schedule-location">{item.description || category}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Schedule;