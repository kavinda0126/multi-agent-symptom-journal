# Agent 1 — Symptom Intake

## Description
Agent 1 reads a patient's plain-text symptom journal and converts it into structured JSON using `llama3.2:3b-instruct-q4_K_M` via Ollama.

## Model
`llama3.2:3b-instruct-q4_K_M` — 2.0 GB, ~3 GB RAM, 128K context

## Tool
`parse_symptoms(file_path)` — reads a `.txt` journal file from disk and returns:
- `raw_text` — full file content as string
- `line_count` — number of non-empty lines
- `has_content` — boolean

## Agent Flow
1. Call `parse_symptoms` to load the journal file
2. Send raw text to `llama3.2` with a medical extraction prompt
3. Parse the JSON array from the LLM response
4. Write `structured_symptoms` and `symptom_terms` to state

## Example Journal Input
```
Day 1 - Monday April 7:
Headache severity 7, started at 2pm, lasted 3 hours
Fatigue severity 5, all day
```

## Example Output (structured_symptoms)
```json
[
  {"date": "2026-04-07", "symptom_name": "cephalgia", "severity": 7, "time_of_day": "afternoon", "duration_hours": 3},
  {"date": "2026-04-07", "symptom_name": "fatigue", "severity": 5, "time_of_day": "all day", "duration_hours": 24}
]
```
