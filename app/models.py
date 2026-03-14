from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from .database import Base

class Chemical(Base):
    __tablename__ = "chemicals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    family = Column(String)
    risk_score = Column(Integer)
    risk_category = Column(String)
    explanation = Column(Text)
    irritation_index = Column(Integer, default=0)
    endocrine_disruptor = Column(Boolean, default=False)
    carcinogenic_flag = Column(Boolean, default=False)
    regulatory_status = Column(String)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    synonyms = relationship("ChemicalSynonym", back_populates="chemical")


class ChemicalSynonym(Base):
    __tablename__ = "chemical_synonyms"

    id = Column(Integer, primary_key=True)
    chemical_id = Column(Integer, ForeignKey("chemicals.id", ondelete="CASCADE"))
    synonym_name = Column(String, unique=True, nullable=False)

    chemical = relationship("Chemical", back_populates="synonyms")


class AnalysisLog(Base):
    __tablename__ = "analysis_logs"

    id = Column(Integer, primary_key=True, index=True)
    ingredient_input = Column(Text)  # Changed to Text to support long ingredient lists
    overall_score = Column(Integer)
    category = Column(String)
    analysis_reasoning = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)