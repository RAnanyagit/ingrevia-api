import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("https://ingrevia-api.onrender.com/analysis-logs");
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const getRiskClass = (category) => {
    switch (category?.toLowerCase()) {
      case "low": return "low";
      case "moderate":
      case "medium": return "medium";
      case "high": return "high";
      default: return "low";
    }
  };

  return (
    <div className="page-container" style={{ animation: "fadeIn 0.5s ease-out" }}>
      <button className="back-nav-btn" onClick={() => navigate("/")}>
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path>
        </svg>
        Back to Dashboard
      </button>

      <header className="page-header">
        <h1>Analysis History</h1>
        <p>Review your previous ingredient assessments and track your product safety reports.</p>
      </header>

      {loading ? (
        <div className="spinner"></div>
      ) : (
        <div className="history-grid">
          {history.length > 0 ? (
            history.map((item) => {
              const riskLvl = getRiskClass(item.category);
              return (
                <div key={item.id} className="history-item glass-panel">
                  <div className="history-info">
                    <div className="history-input">{item.ingredient_input.substring(0, 100)}...</div>
                    <div className="history-date">
                      {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className={`badge badge-${riskLvl}`}>
                    {item.category}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="glass-panel no-data-card">
              <p>No analysis reports found in your history.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
