import { useState, useEffect } from "react";
import "./App.css";

function Profile({ user }) {
  const [allergies, setAllergies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllergies() {
      try {
        const res = await fetch(`https://ingrevia-api.onrender.com/get-allergies?user_email=${user}`);
        const data = await res.json();
        setAllergies(data);
      } catch (err) {
        console.error("Failed to fetch allergies:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAllergies();
  }, [user]);

  return (
    <div className="page-container" style={{ animation: "fadeIn 0.5s ease-out" }}>
      <header className="page-header">
        <h1>User Profile</h1>
        <p>Manage your account settings and personal allergy profile.</p>
      </header>

      <div className="glass-panel profile-grid">
        <div className="profile-section">
          <h3><span>👤</span> Account Details</h3>
          <div className="info-group">
            <div className="info-label">Email Address</div>
            <div className="info-value">{user}</div>
          </div>
        </div>

        <div className="profile-section">
          <h3><span>🛡️</span> My Allergies</h3>
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <div className="allergy-list">
              {allergies.length > 0 ? (
                allergies.map((allergy, i) => (
                  <span key={i} className="allergy-tag">{allergy}</span>
                ))
              ) : (
                <p className="no-data">No allergies saved yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
