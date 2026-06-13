"""
Gemini AI service — API key is read from the GEMINI_API_KEY environment variable.
Set this in Render: Dashboard → Environment → GEMINI_API_KEY = your_key
"""
import os

API_KEY = os.environ.get("GEMINI_API_KEY")

if not API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY environment variable is not set. "
        "Add it in Render Dashboard → Environment Variables."
    )

try:
    # New google-genai SDK (preferred)
    from google import genai

    client = genai.Client(api_key=API_KEY)

    def analyze_symptom(department: str, symptom: str, severity: str) -> str:
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

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return response.text

except ImportError:
    # Fallback: legacy google.generativeai SDK
    import google.generativeai as genai  # type: ignore

    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel("gemini-2.5-flash")

    def analyze_symptom(department: str, symptom: str, severity: str) -> str:
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

        response = model.generate_content(prompt)
        return response.text