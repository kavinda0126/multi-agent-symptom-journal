# Agent 3 — Risk Assessment (Tharindu)

## Description
Agent 3 evaluates health risks from detected patterns and fetches trusted MedlinePlus health article links. Uses `deepseek-r1:7b-qwen-distill-q4_K_M` for chain-of-thought risk reasoning.

## Model
`deepseek-r1:7b-qwen-distill-q4_K_M` — 4.7 GB, ~5-6 GB RAM, chain-of-thought reasoning.

## Tool
`get_risk_assessment(symptom_names)` — returns:
- `medline_links` — list of `{symptom, title, url}` from MedlinePlus Connect API
- `risk_flags` — list of `{symptom, level}` (LOW / MEDIUM / HIGH / URGENT)
- `lifestyle_suggestions` — deduplicated list of lifestyle advice strings

## MedlinePlus Connect API
- Endpoint: `https://connect.medlineplus.gov/service`
- Free, no API key required
- Uses ICD-10 / SNOMED codes to fetch trusted health articles

## Symptom Code Mapping
| Symptom | Code |
|---|---|
| cephalgia / headache | 000792 |
| fatigue | 003088 |
| nausea | 002862 |
| back pain | 000071 |
| insomnia | 002285 |
| dizziness | 000764 |
| anxiety | 000922 |

## Risk Levels
- **LOW** — Minor, self-manageable
- **MEDIUM** — Monitor closely
- **HIGH** — Consider seeing a doctor
- **URGENT** — Seek medical attention immediately
