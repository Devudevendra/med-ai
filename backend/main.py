import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Generator

from app.database.db import engine, SessionLocal, Base
from app.models.patient import Patient
from app.schemas.patient import PatientCreate
from app.models.assessment import Assessment
from app.schemas.assessment import AssessmentCreate
from app.services.gemini_service import analyze_symptom

# ── App Setup ──────────────────────────────────────────────────────────────────
app = FastAPI(
    title="MediAI — Medical Triage Assistant",
    description="AI-powered patient registration, medical assessment, and triage system.",
    version="1.0.0",
)

Base.metadata.create_all(bind=engine)

# ── CORS ───────────────────────────────────────────────────────────────────────
_extra_origin = os.environ.get("FRONTEND_URL", "")

ALLOWED_ORIGINS = [
    "https://med-ai-brown.vercel.app",          # Production Vercel frontend
    *([_extra_origin] if _extra_origin else []), # Extra origin from env var
    # ── Hosted backends ───────────────────────────────────────
    "https://*.hf.space",
    "https://*.pythonanywhere.com",
    # ── Local development ─────────────────────────────────────
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
    "http://localhost:5178",
    "http://localhost:5179",
    "http://localhost:5180",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:5176",
    "http://127.0.0.1:5177",
    "http://127.0.0.1:5178",
    "http://127.0.0.1:5179",
    "http://127.0.0.1:5180",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── DB Dependency ──────────────────────────────────────────────────────────────
def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ── Health Check ───────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def home():
    return {"message": "MediAI Backend is running", "status": "ok"}

# ── Patients ───────────────────────────────────────────────────────────────────
@app.post("/patients", tags=["Patients"])
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    if patient.height <= 0:
        raise HTTPException(status_code=400, detail="Height must be greater than 0")
    bmi = patient.weight / ((patient.height / 100) ** 2)
    new_patient = Patient(
        name=patient.name, age=patient.age, gender=patient.gender,
        height=patient.height, weight=patient.weight, bmi=round(bmi, 2),
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return {"message": "Patient saved successfully", "patient_id": new_patient.id, "bmi": new_patient.bmi}

@app.get("/patients", tags=["Patients"])
def get_patients(db: Session = Depends(get_db)):
    return db.query(Patient).all()

# ── Assessments ────────────────────────────────────────────────────────────────
@app.post("/assessments", tags=["Assessments"])
def create_assessment(assessment: AssessmentCreate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == assessment.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {assessment.patient_id} not found")
    new_assessment = Assessment(
        patient_id=assessment.patient_id, department=assessment.department,
        symptom=assessment.symptom, severity=assessment.severity,
    )
    db.add(new_assessment)
    db.commit()
    db.refresh(new_assessment)
    return {"message": "Assessment saved successfully", "assessment_id": new_assessment.id}

@app.get("/assessments", tags=["Assessments"])
def get_assessments(db: Session = Depends(get_db)):
    return db.query(Assessment).all()

# ── Patient History ────────────────────────────────────────────────────────────
@app.get("/patient-history/{patient_id}", tags=["Assessments"])
def patient_history(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")
    return db.query(Assessment).filter(Assessment.patient_id == patient_id).all()

# ── AI Analysis ────────────────────────────────────────────────────────────────
@app.post("/ai-analysis", tags=["AI"])
def ai_analysis(data: dict):
    for field in ["department", "symptom", "severity"]:
        if field not in data or not data[field]:
            raise HTTPException(status_code=400, detail=f"Missing field: '{field}'")
    try:
        result = analyze_symptom(data["department"], data["symptom"], data["severity"])
        return {"analysis": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")