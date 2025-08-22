import React, { useEffect, useState } from "react";
import "../styles/commission.css"; // Import CSS for styling
import { FaDrum } from "react-icons/fa6";; //import drums to be used later
// import Luminosity from '/src/assets/LightHolder.png'
import HolderOfLight from "/src/assets/HolderOfLight.jpg";
//import the united family icon
import Union from "/src/assets/familyUnion.jpg"
//import the bible icon
import { FaBible } from "react-icons/fa";
import { CommissionApi } from "../api/endpoints.js";

const CommissionGrid = () => {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await CommissionApi.list({ limit: 50, sort: '-createdAt' });
        if (!mounted) return;
        setCommissions(Array.isArray(data.items) ? data.items : []);
      } catch (err) {
        setError(err?.message || 'Failed to load commissions');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <section className="commission-section">
      <h2 className="commission-title">
        <span>Our commissions</span>
      </h2>
      <div className="commission-grid">
        {loading && <div className="commission-card"><p>Loading...</p></div>}
        {error && <div className="commission-card"><p>{error}</p></div>}
        {!loading && !error && commissions.length === 0 && (
          <div className="commission-card"><p>No commissions yet.</p></div>
        )}
        {!loading && !error && commissions.map((c) => (
          <div className="commission-card" key={c._id}>
            <div className="commission-icon">
              {/* simple icon fallback */}
              <FaDrum />
            </div>
            <h3 className="commission-name">{c.name}</h3>
            <p className="commission-description">{c.description || '—'}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CommissionGrid;
