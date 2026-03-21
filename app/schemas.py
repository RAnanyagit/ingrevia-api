from pydantic import BaseModel
from datetime import datetime

class AnalysisLogResponse(BaseModel):
    id: int
    ingredient_input: str
    overall_score: int
    category: str
    timestamp: datetime

    class Config:
        orm_mode = True

class IngredientListRequest(BaseModel):
    ingredients: str


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    age: int
    phone: str

class UserLogin(BaseModel):
    email: str
    password: str
