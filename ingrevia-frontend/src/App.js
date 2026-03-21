import { useState, useEffect } from "react";
import "./App.css";
import Login from "./Login";

function App() {
  const [user, setUser] = useState(null);
  const [ingredients, setIngredients] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("email");
    if (savedUser) setUser(savedUser);
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`https://ingrevia-api.onrender.com/analysis-logs`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const analyzeIngredients = async () => {
    if (!ingredients.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        "https://ingrevia-api.onrender.com/analyze-list",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            ingredients,
            user_email: user
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch analysis");
      }

      const data = await response.json();
      setResult(data);
      fetchHistory();
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred while analyzing the ingredients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setResult(null);
    setIngredients("");
  };

  const getRiskColor = (category) => {
    switch (category?.toLowerCase()) {
      case "low":
        return "var(--risk-low)";
      case "moderate":
      case "medium":
        return "var(--risk-medium)";
      case "high":
        return "var(--risk-high)";
      default:
        return "var(--text-muted)";
    }
  };

  const getRiskClass = (category) => {
    switch (category?.toLowerCase()) {
      case "low":
        return "low";
      case "moderate":
      case "medium":
        return "medium";
      case "high":
        return "high";
      default:
        return "low";
    }
  };

  if (!user) return <Login setUser={setUser} />;

  return (
    <div className="app-container">
      <header className="header">
        <div className="user-nav">
          <span className="user-badge">👤 {user}</span>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
        <h1>
          <span>🧪</span> AllerSafe
        </h1>
        <p>Advanced cosmetic safety dashboard. Paste your ingredients below for personalized allergy-aware analysis.</p>
      </header>

      <div className="glass-panel input-section">
        <label htmlFor="ingredients-input">Ingredients List</label>
        <textarea
          id="ingredients-input"
          placeholder="e.g. Water, Glycerin, Niacinamide, Sodium Lauryl Sulfate, Parabens..."
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
        {error && <p style={{ color: "var(--risk-high)", fontSize: "0.9rem" }}>{error}</p>}
        <button 
          className="btn-primary" 
          onClick={analyzeIngredients}
          disabled={loading || !ingredients.trim()}
        >
          {loading ? (
            <>
              <span className="spinner"></span> Analyzing...
            </>
          ) : (
            "Analyze Product"
          )}
        </button>
      </div>

      {result && (
        <div style={{ animation: "fadeIn 0.5s ease" }}>
          <div className="dashboard-section glass-panel">
            <div className="score-card">
              <div 
                className="score-glow" 
                style={{ background: getRiskColor(result.product_analysis.overall_risk_category) }}
              ></div>
              <span className="score-label">Risk Score</span>
              <div 
                className="score-value"
                style={{ color: getRiskColor(result.product_analysis.overall_risk_category) }}
              >
                {parseFloat(result.product_analysis.overall_weighted_risk_score).toFixed(1)}
              </div>
              <div 
                className="score-category"
                style={{ color: getRiskColor(result.product_analysis.overall_risk_category) }}
              >
                {result.product_analysis.overall_risk_category} Risk
              </div>
            </div>

            <div className="reason-card">
              <h3><span>📊</span> Personalized Results</h3>
              <p>{result.product_analysis.analysis_reasoning}</p>
            </div>
          </div>

          <div className="ingredients-section bg-section">
            <div className="ingredients-header">
              <h3><span>🧊</span> Identified Ingredients</h3>
              <span className="ingredients-count">
                {result.recognized_ingredients?.length || 0} found
              </span>
            </div>
            
            <div className="cards-grid">
              {result.recognized_ingredients?.map((item, index) => {
                const riskLvl = getRiskClass(item.regulatory_status);
                return (
                  <div key={index} className={`ingredient-card card-${riskLvl}`}>
                    <div className="ingredient-title-row">
                      <div className="ingredient-name">{item.name}</div>
                      <div className={`badge badge-${riskLvl}`}>
                        {item.regulatory_status || "Unknown"}
                      </div>
                    </div>
                    {item.description && (
                      <div className="ingredient-desc">
                        {item.description}
                      </div>
                    )}
                    <div className="ingredient-status">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                      {item.regulatory_status}
                    </div>
                  </div>
                );
              })}
            </div>

            {result.unrecognized_ingredients?.length > 0 && (
              <p className="unrecognized-p">
                <strong>Not recognized:</strong> {result.unrecognized_ingredients.join(', ')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* HISTORY SECTION */}
      <div className="history-section" style={{ marginTop: "60px" }}>
        <div className="ingredients-header">
          <h3><span>📜</span> Previous Reports</h3>
          <span className="ingredients-count">{history.length} reports</span>
        </div>
        
        <div className="history-grid">
          {history.map((item) => {
            const riskLvl = getRiskClass(item.category);
            return (
              <div key={item.id} className="history-item glass-panel">
                <div className="history-info">
                  <div className="history-input">{item.ingredient_input.substring(0, 60)}...</div>
                  <div className="history-date">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <div className={`badge badge-${riskLvl}`}>
                  {item.category}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;

