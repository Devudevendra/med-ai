"""
Gemini AI service — uses pure HTTP REST (no gRPC) so it works on Vercel.
Set GEMINI_API_KEY in your Vercel environment variables.
"""
import os
import requests

API_KEY = os.environ.get("GEMINI_API_KEY", "")

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.0-flash:generateContent"
)


def analyze_symptom(department: str, symptom: str, severity: str) -> str:
    if not API_KEY:
        return (
            "AI analysis unavailable — GEMINI_API_KEY is not configured. "
            "Please set it in your deployment environment variables."
        )

    prompt = f"""You are a professional medical triage assistant reviewing a patient case.

Patient Presentation:
- Department: {department}
- Symptom: {symptom}
- Severity: {severity}

Please provide a concise, structured assessment with the following sections:

1. **Risk Level** — (Low / Medium / High / Critical)
2. **Possible Cause(s)** — Most likely diagnosis or differential
3. **Recommended Specialist** — Which type of doctor to consult
4. **Immediate Advice** — What the patient should do right now

Keep your response professional, clear, and under 150 words. Do NOT provide a definitive diagnosis."""

    try:
        response = requests.post(
            f"{GEMINI_URL}?key={API_KEY}",
            json={"contents": [{"parts": [{"text": prompt}]}]},
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except requests.exceptions.Timeout:
        return "AI analysis timed out. Please try again."
    except Exception as e:
        return f"AI analysis error: {str(e)}"