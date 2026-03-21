from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from typing import Optional
from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from .database import SessionLocal, engine
from .models import Chemical, AnalysisLog, User, Base
from .risk_engine import calculate_product_risk
from .schemas import AnalysisLogResponse, IngredientListRequest, UserCreate, UserLogin
from .core.security import hash_password, verify_password
from .core.auth import create_access_token
from .core.exceptions import (
    http_exception_handler,
    validation_exception_handler,
    generic_exception_handler,
)
from .core.logging import setup_logging
import time

logger = setup_logging()

app = FastAPI(title="Ingrevia API", version="5.0.0")

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (e.g. localhost:3000, localhost:3001)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(
        f"{request.method} {request.url.path} "
        f"Status: {response.status_code} "
        f"Time: {process_time:.4f}s"
    )
    return response

# ----------------------------
# DEPENDENCY
# ----------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----------------------------
# ROOT
# ----------------------------

@app.get("/")
def root():
    return {"message": "Ingrevia API Running - Modular Version"}

# ----------------------------
# ANALYZE LIST
# ----------------------------

@app.post("/analyze-list")
def analyze_list(request: IngredientListRequest, db: Session = Depends(get_db)):
    # Clean and split ingredients
    ingredients_lower = [i.strip().lower() for i in request.ingredients.split(",")]

    # Fetch recognized chemicals from DB (Case-Insensitive)
    chemical_objects = db.query(Chemical).filter(
        func.lower(Chemical.name).in_(ingredients_lower)
    ).all()

    # Calculate risk using the dedicated engine
    overall_score, category, recognized, reasoning = calculate_product_risk(chemical_objects)

    # Identify unrecognized ingredients properly
    recognized_names = [chem.name.lower() for chem in chemical_objects]
    unrecognized = [
        ing for ing in ingredients_lower
        if ing not in recognized_names
    ]

    # Persistent logging for audit history
    log_entry = AnalysisLog(
        ingredient_input=request.ingredients,
        overall_score=overall_score,
        category=category,
        analysis_reasoning=reasoning
    )
    db.add(log_entry)
    db.commit()

    return {
        "product_analysis": {
            "overall_weighted_risk_score": overall_score,
            "overall_risk_category": category,
            "analysis_reasoning": reasoning
        },
        "recognized_ingredients": recognized,
        "unrecognized_ingredients": unrecognized
    }

# ----------------------------
# AUDIT LOGS
# ----------------------------

@app.get("/analysis-logs", response_model=list[AnalysisLogResponse])
def get_logs(
    category: Optional[str] = None,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    query = db.query(AnalysisLog)

    if category:
        query = query.filter(AnalysisLog.category == category)

    logs = query.order_by(AnalysisLog.timestamp.desc()).limit(limit).all()
    return logs

# ----------------------------
# ANALYTICS
# ----------------------------

@app.get("/analytics/summary")
def risk_summary(db: Session = Depends(get_db)):
    total = db.query(func.count(AnalysisLog.id)).scalar()

    high = db.query(func.count(AnalysisLog.id))\
        .filter(AnalysisLog.category == "High")\
        .scalar()

    moderate = db.query(func.count(AnalysisLog.id))\
        .filter(AnalysisLog.category == "Moderate")\
        .scalar()

    low = db.query(func.count(AnalysisLog.id))\
        .filter(AnalysisLog.category == "Low")\
        .scalar()

    return {
        "total_analyses": total,
        "high_risk": high,
        "moderate_risk": moderate,
        "low_risk": low
    }

# ----------------------------
# GET ALL CHEMICALS
# ----------------------------

@app.get("/chemicals")
def get_chemicals(db: Session = Depends(get_db)):
    chemicals = db.query(Chemical).all()
    return chemicals

# ----------------------------
# USER AUTHENTICATION
# ----------------------------

@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        age=user.age,
        phone=user.phone
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully"}

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": db_user.email})

    return {"access_token": token}