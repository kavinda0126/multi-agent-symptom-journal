# Agent 4 — Report Writer (Githadi)

## Description
Agent 4 synthesises all findings from Agents 1–3 into a structured, doctor-ready Markdown health report using `llama3.2:3b-instruct-q4_K_M`.

## Model
`llama3.2:3b-instruct-q4_K_M` — 2.0 GB, ~3 GB RAM, 128K context.

## Tool
`write_report(content, output_dir)` — saves a timestamped `.md` file to `reports/`:
- Returns absolute path to the saved file
- Raises `ValueError` if content is empty

## Report Format (Markdown Sections)
```
## Executive Summary
## Symptom Timeline
## Patterns Detected
## Weather Correlations
## Risk Flags
## Lifestyle Recommendations
## Resources for Doctor
```

## Example Output
```markdown
## Executive Summary
- Patient reported 5 days of symptoms including recurrent cephalgia and fatigue.
- Headaches peak in the afternoon, correlating with high humidity days.

## Risk Flags
- cephalgia: MEDIUM
- fatigue: MEDIUM

## Lifestyle Recommendations
- Stay hydrated — drink 2.5L of water daily
- Maintain a consistent sleep schedule of 7-8 hours
```

## File Naming
Reports are saved as `reports/health_report_YYYYMMDD_HHMMSS.md`.
