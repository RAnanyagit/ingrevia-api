from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    """Test the root endpoint for a successful response."""
    response = client.get("/")
    assert response.status_code == 200

def test_analyze_list_success():
    """Test the ingredient analysis endpoint with valid input."""
    response = client.post(
        "/analyze-list",
        json={"ingredients": "Paraben, SLS, Glycerin"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "product_analysis" in data
    assert "recognized_ingredients" in data
    assert "overall_risk_category" in data["product_analysis"]

def test_analysis_logs_endpoint():
    """Test the audit logs endpoint for a successful response."""
    response = client.get("/analysis-logs")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_validation_error():
    """Test the analysis endpoint with missing payload to trigger a validation error."""
    response = client.post("/analyze-list", json={})
    # FastAPI returns 422 Unprocessable Entity for schema validation errors
    assert response.status_code == 422
