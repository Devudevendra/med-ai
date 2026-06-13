from sqlalchemy import Column, Integer, String
from app.database.db import Base

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer)
    department = Column(String)
    symptom = Column(String)
    severity = Column(String)