# AI-Powered Symptom Analysis and Health Intelligence System

A multi-agent AI system that analyses personal symptom journals, detects health patterns, correlates symptoms with weather data, assesses risk levels, and generates personalised medical reports — all running locally using open-source LLMs via Ollama.

---

## Overview

The system is built on a sequential four-agent pipeline where each agent specialises in a distinct stage of health intelligence processing. Agents communicate through a shared state graph powered by LangGraph, with a FastAPI backend exposing a REST API and a React frontend providing real-time pipeline visibility.

```
Symptom Journal (.txt)
        │
        ▼
┌───────────────────┐
│  Agent 1          │  Reads the journal, extracts structured symptom
│  Symptom Intake   │  entries (date, name, severity, duration) using
│  llama3.2:3b      │  medical terminology via LLM
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Agent 2          │  Analyses symptom frequency, detects recurring
│  Pattern Detection│  patterns, fetches live weather data (Open-Meteo)
│  deepseek-r1:7b   │  and correlates symptoms with environmental factors
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Agent 3          │  Assigns risk levels (LOW / MEDIUM / HIGH / URGENT)
│  Risk Assessment  │  to each symptom, fetches MedlinePlus health articles,
│  deepseek-r1:7b   │  and generates lifestyle recommendations
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Agent 4          │  Synthesises all agent outputs into a structured
│  Report Writer    │  Markdown health report and saves it to disk
│  llama3.2:3b      │
└───────────────────┘
         │
         ▼
  report_YYYYMMDD_HHMMSS.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| LLM Runtime | [Ollama](https://ollama.com) (local, no API key required) |
| Agent Orchestration | [LangGraph](https://github.com/langchain-ai/langgraph) |
| LLM Interface | [langchain-ollama](https://pypi.org/project/langchain-ollama/) |
| Backend API | [FastAPI](https://fastapi.tiangolo.com) + Uvicorn |
| Frontend | [React](https://react.dev) + [Vite](https://vitejs.dev) + [Tailwind CSS](https://tailwindcss.com) |
| Weather Data | [Open-Meteo API](https://open-meteo.com) (free, no key) |
| Health Articles | [MedlinePlus Connect API](https://medlineplus.gov/connect/overview.html) (free, no key) |

---

## Models

| Agent | Model | Purpose |
|---|---|---|
| Agent 1 | `llama3.2:3b-instruct-q4_K_M` | Symptom extraction from free-text journal |
| Agent 2 | `deepseek-r1:7b-qwen-distill-q4_K_M` | Pattern analysis and weather correlation |
| Agent 3 | `deepseek-r1:7b-qwen-distill-q4_K_M` | Risk assessment and recommendations |
| Agent 4 | `llama3.2:3b-instruct-q4_K_M` | Report synthesis and writing |

---

## Prerequisites

- [Ollama](https://ollama.com/download) installed and running
- Python 3.10+
- Node.js 18+

---

## Setup

### 1. Pull the required models

```bash
ollama pull llama3.2:3b-instruct-q4_K_M
ollama pull deepseek-r1:7b-qwen-distill-q4_K_M
```

> To store models on a specific drive, set the `OLLAMA_MODELS` environment variable before starting Ollama:
> ```bash
> # Windows
> set OLLAMA_MODELS=D:\ollama\models
> # macOS / Linux
> export OLLAMA_MODELS=/path/to/models
> ```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Start the backend

```bash
python backend/main.py
# API available at http://localhost:8000
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
# UI available at http://localhost:5173
```

### 5. Run tests

```bash
pytest -v
```

---

## Usage

1. Open `http://localhost:5173` in your browser
2. Upload a `.txt` symptom journal **or** paste journal text directly
3. Enter your city name for weather correlation
4. Click **Analyse Journal** — the pipeline starts and each agent's progress is shown in real time
5. View symptom patterns, risk flags, weather correlations, and lifestyle tips
6. Read the generated health report and click **Download PDF** to save it
   - A formatted print view opens in a new tab
   - Select **Save as PDF** as the printer destination to download the file

### Example journal format

```
Day 1 - Monday:
Headache, severity 7, started at 2pm, lasted 3 hours
Fatigue, severity 5, all day

Day 2 - Tuesday:
Headache, severity 4, morning
Nausea, severity 6, after meals, lasted 1 hour
```

---

## Project Structure

```
.
├── backend/
│   └── main.py                  # FastAPI app, job queue, polling endpoint
├── core/
│   ├── pipeline.py              # LangGraph StateGraph definition
│   ├── state.py                 # Shared TypedDict state schema
│   └── logger.py                # JSONL event logger
├── agent1_intake/
│   ├── agent.py                 # LLM-based symptom extraction
│   └── tool.py                  # Journal file reader
├── agent2_patterns/
│   ├── agent.py                 # Pattern and weather correlation agent
│   └── tool.py                  # Frequency counter + Open-Meteo API client
├── agent3_risks/
│   ├── agent.py                 # Risk assessment agent
│   └── tool.py                  # MedlinePlus API client + risk scorer
├── agent4_reporter/
│   ├── agent.py                 # Report synthesis agent
│   └── tool.py                  # Markdown report file writer
├── frontend/
│   └── src/
│       ├── App.jsx              # Main app shell and polling logic
│       └── components/
│           ├── JournalInput.jsx # File upload / paste text input
│           ├── Sidebar.jsx      # Pipeline progress + risk flags + tips
│           ├── FindingsPanel.jsx# Frequency chart + timeline + weather
│           └── ActivityLog.jsx  # Health report viewer + PDF download
├── reports/                     # Generated reports saved here
├── uploads/                     # Uploaded journal files (transient)
└── requirements.txt
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/review` | Upload a `.txt` journal file (`multipart/form-data`) and optional `city` query param |
| `POST` | `/review-text` | Submit journal as plain text (`{ "text": "...", "city": "..." }`) |
| `GET` | `/status/{job_id}` | Poll pipeline status; returns `running`, `complete`, or `error` |
| `GET` | `/health` | Health check |

### Status response (complete)

```json
{
  "status": "complete",
  "symptoms": [...],
  "patterns": { "headache": 5, "fatigue": 3 },
  "weather": { "llm_analysis": "..." },
  "risks": [{ "symptom": "headache", "level": "MEDIUM" }],
  "suggestions": ["Stay hydrated", "Maintain regular sleep schedule"],
  "medline_links": [{ "title": "...", "url": "...", "symptom": "headache" }],
  "report": "## Executive Summary\n...",
  "report_path": "reports/report_20240417_143022.md"
}
```

---

## License

MIT
