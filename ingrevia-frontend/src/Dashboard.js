import { useState, useEffect } from "react";
import "./App.css";

function Dashboard({ user }) {
  const [ingredients, setIngredients] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred while analyzing the ingredients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (category) => {
    switch (category?.toLowerCase()) {
      case "low": return "var(--risk-low)";
      case "moderate":
      case "medium": return "var(--risk-medium)";
      case "high": return "var(--risk-high)";
      default: return "var(--text-muted)";
    }
  };

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
      <header className="page-header">
        <h1>Ingredient Analysis</h1>
        <p>Personalized safety assessment for your cosmetic products.</p>
      </header>

      <div className="glass-panel input-section">
        <label htmlFor="ingredients-input">Paste Ingredients List</label>
        <textarea
          id="ingredients-input"
          placeholder="e.g. Water, Glycerin, Niacinamide, Parabens..."
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
        {error && <p className="error-text">{error}</p>}
        <button 
          className="btn-primary" 
          onClick={analyzeIngredients}
          disabled={loading || !ingredients.trim()}
        >
          {loading ? <><span className="spinner"></span> Analyzing...</> : "Analyze Product"}
        </button>
      </div>

      {result && (
        <div style={{ animation: "fadeIn 0.5s ease" }}>
          <div className="dashboard-section glass-panel">
            <div className="score-card">
              <div className="score-glow" style={{ background: getRiskColor(result.product_analysis.overall_risk_category) }}></div>
              <span className="score-label">Risk Score</span>
              <div className="score-value" style={{ color: getRiskColor(result.product_analysis.overall_risk_category) }}>
                {parseFloat(result.product_analysis.overall_weighted_risk_score).toFixed(1)}
              </div>
              <div className="score-category" style={{ color: getRiskColor(result.product_analysis.overall_risk_category) }}>
                {result.product_analysis.overall_risk_category} Risk
              </div>
            </div>
            <div className="reason-card">
              <h3><span>📊</span> Analysis Breakdown</h3>
              <p>{result.product_analysis.analysis_reasoning}</p>
            </div>
          </div>

          <div className="ingredients-section">
            <div className="ingredients-header">
              <h3><span>🧊</span> Identified Ingredients</h3>
              <span className="ingredients-count">{result.recognized_ingredients?.length || 0} found</span>
            </div>
            <div className="cards-grid">
              {result.recognized_ingredients?.map((item, index) => {
                const riskLvl = getRiskClass(item.regulatory_status);
                return (
                  <div key={index} className={`ingredient-card card-${riskLvl}`}>
                    <div className="ingredient-title-row">
                      <div className="ingredient-name">{item.name}</div>
                      <div className={`badge badge-${riskLvl}`}>{item.regulatory_status || "Unknown"}</div>
                    </div>
                    {item.description && <div className="ingredient-desc">{item.description}</div>}
                    <div className="ingredient-status">{item.regulatory_status}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
