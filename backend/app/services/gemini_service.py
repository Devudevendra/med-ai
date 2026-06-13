"""
Gemini AI service — uses pure HTTP REST (no gRPC), works on Vercel.
Set GEMINI_API_KEY in your Vercel backend environment variables.
"""
import os
import time
import requests

API_KEY = os.environ.get("GEMINI_API_KEY", "")

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.0-flash:generateContent"
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

    # ── Retry up to 3 times with backoff on rate limit ────────
    for attempt in range(3):
        try:
            response = requests.post(
                f"{GEMINI_URL}?key={API_KEY}",
                json=payload,
                timeout=30,
            )

            if response.status_code == 429:
                wait = 2 ** attempt  # 1s, 2s, 4s backoff
                time.sleep(wait)
                continue

            response.raise_for_status()
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]

        except requests.exceptions.Timeout:
            return "⏱️ AI analysis timed out. Please try again in a moment."

        except requests.exceptions.HTTPError as e:
            code = e.response.status_code if e.response else "?"
            if code == 429:
                return (
                    "⚠️ AI is busy right now (rate limit reached). "
                    "Please wait 30 seconds and try again."
                )
            return f"⚠️ AI service error ({code}). Please try again."

        except Exception as e:
            return f"⚠️ Unexpected error during AI analysis. Please try again."

    return "⚠️ AI is temporarily unavailable due to high demand. Please try again in 1 minute."