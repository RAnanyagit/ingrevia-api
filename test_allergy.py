from fastapi.testclient import TestClient
from app.main import app
from app.database import engine, Base
import json

# Ensure tables exist
Base.metadata.create_all(bind=engine)

client = TestClient(app)

# 1. Signup (might fail if already exists, that's fine)
email = "test_allergy@gmail.com"
client.post("/signup", json={
    "name": "Test User",
    "email": email,
    "password": "password123",
    "age": 25,
    "phone": "9999999999"
})

# 2. Add Allergies
print("\n--- Adding Allergies ---")
add_resp = client.post("/add-allergies", json={
    "user_email": email,
    "allergies": ["Paraben", "Fragrance"]
})
print("Add Resp:", add_resp.json())

# 3. Get Allergies
print("\n--- Getting Allergies ---")
get_resp = client.get(f"/get-allergies?user_email={email}")
print("Get Resp:", get_resp.json())

# 4. Analyze List (Personalized)
print("\n--- Analyzing List (Personalized) ---")
# Paraben has risk_score=2 in DB but should be flagged as High due to allergy
analyze_resp = client.post("/analyze-list", json={
    "ingredients": "Paraben, SLS, Glycerin",
    "user_email": email
})
res = analyze_resp.json()
print("Category:", res["product_analysis"]["overall_risk_category"])
print("Reasoning:", res["product_analysis"]["analysis_reasoning"])

if res["product_analysis"]["overall_risk_category"] == "High" and "Paraben" in res["product_analysis"]["analysis_reasoning"]:
    print("\n✅ Verification Successful!")
else:
    print("\n❌ Verification Failed!")
