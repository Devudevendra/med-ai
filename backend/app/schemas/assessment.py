from pydantic import BaseModel

class AssessmentCreate(BaseModel):
    patient_id: int
    department: str
    symptom: str
    severity: str