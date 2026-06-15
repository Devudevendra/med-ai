"""
Gemini AI service — uses pure HTTP REST (no gRPC), works on Vercel.
Set GEMINI_API_KEY in your Vercel backend environment variables.
"""
import os
import time
import requests

API_KEY = os.environ.get("GEMINI_API_KEY", "")

# Models tried in order — automatically falls back if one is rate-limited
MODELS = [
    "gemini-1.5-flash",       # Best free quota: 15 RPM, 1500 RPD
    "gemini-1.5-flash-8b",    # Higher quota, smaller model
    "gemini-2.0-flash",       # Latest model, stricter quota
]

GEMINI_BASE = (
    "https://generativelanguage.googleapis.com/v1beta/models"
    "/{model}:generateContent"
)


def analyze_symptom(department: str, symptom: str, severity: str) -> str:
    if not API_KEY:
        return (
            "⚠️ AI analysis unavailable — GEMINI_API_KEY is not configured. "
            "Please set it in your Vercel backend environment variables."
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

    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    # ── Try each model, falling back on 429 rate limits ───────
    for model in MODELS:
        url = GEMINI_BASE.format(model=model) + f"?key={API_KEY}"
        for attempt in range(2):          # 2 tries per model
            try:
                response = requests.post(url, json=payload, timeout=30)

                if response.status_code == 429:
                    time.sleep(2 ** attempt)  # wait 1s then 2s
                    continue                   # retry same model

                response.raise_for_status()
                data = response.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]

            except requests.exceptions.Timeout:
                return "⏱️ AI analysis timed out. Please try again."

            except requests.exceptions.HTTPError as e:
                code = e.response.status_code if e.response else "?"
                if code == 429:
                    break   # 429 again → try next model
                return f"⚠️ AI service error ({code}). Please try again."

            except Exception:
                return "⚠️ Unexpected error. Please try again."

        # rate-limited on this model → try the next one immediately

    return (
        "⚠️ AI is temporarily rate-limited. "
        "Please wait 1 minute and try again."
    )