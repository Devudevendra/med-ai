"""
Gemini AI service — uses pure HTTP REST, works on Vercel free tier.
Set GEMINI_API_KEY in your Vercel backend environment variables.
"""
import os
import requests

API_KEY = os.environ.get("GEMINI_API_KEY", "")

# Models tried in order — falls back if one is rate-limited
MODELS = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-2.0-flash",
]

GEMINI_BASE = (
    "https://generativelanguage.googleapis.com/v1beta/models"
    "/{model}:generateContent"
)


def analyze_symptom(department: str, symptom: str, severity: str) -> str:
    if not API_KEY:
        return (
            "⚠️ AI analysis unavailable — GEMINI_API_KEY is not configured. "
            "Please set it in your Vercel backend project's Environment Variables."
        )

    prompt = f"""You are a professional medical triage assistant reviewing a patient case.

Patient Presentation:
- Department: {department}
- Symptom: {symptom}
- Severity: {severity}

Please provide a concise, structured assessment:

1. **Risk Level** — (Low / Medium / High / Critical)
2. **Possible Cause(s)** — Most likely diagnosis or differential
3. **Recommended Specialist** — Which type of doctor to consult
4. **Immediate Advice** — What the patient should do right now

Keep your response professional, clear, and under 150 words."""

    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    # ── Try each model once (keep total time under Vercel's 10s limit) ─────
    for model in MODELS:
        url = GEMINI_BASE.format(model=model) + f"?key={API_KEY}"
        try:
            response = requests.post(
                url,
                json=payload,
                timeout=7,          # Stay well under Vercel's 10s function limit
            )

            # Rate limited — try next model immediately (no sleep on Vercel)
            if response.status_code == 429:
                continue

            # Bad API key or invalid request
            if response.status_code == 400:
                error_body = response.json() if response.content else {}
                msg = error_body.get("error", {}).get("message", "Bad Request")
                return f"⚠️ API Key error: {msg}. Please check your GEMINI_API_KEY in Vercel."

            # Auth error
            if response.status_code == 403:
                return "⚠️ API Key is invalid or expired. Please update GEMINI_API_KEY in Vercel."

            response.raise_for_status()
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]

        except requests.exceptions.Timeout:
            continue   # Try next model

        except requests.exceptions.ConnectionError:
            return "⚠️ Cannot reach Gemini API. Check network connectivity."

        except Exception as e:
            continue   # Try next model

    return (
        "⚠️ All AI models are currently busy. "
        "Please wait 1 minute and try again."
    )