---
title: MediAI Backend
emoji: 🏥
colorFrom: indigo
colorTo: purple
sdk: docker
pinned: false
license: mit
---

# MediAI — Medical Triage Assistant API

FastAPI backend for AI-powered patient registration, medical assessment, and triage.

## Endpoints
- `GET /` — Health check
- `POST /patients` — Register patient
- `GET /patients` — List patients
- `POST /assessments` — Save assessment
- `GET /assessments` — List assessments
- `GET /patient-history/{id}` — Patient history
- `POST /ai-analysis` — Gemini AI triage
- `GET /docs` — Interactive API docs
