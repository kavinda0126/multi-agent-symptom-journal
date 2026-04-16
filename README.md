# AI Symptom Journal MAS

Agentic AI-Powered Multi-Agent System for Symptom Journal Analysis, Health Pattern Detection and Personalised Medical Report Generation.

**SE4010 CTSE — Assignment 2**

## Team

| Member | Agent | Model |
|---|---|---|
| Kavinda | Agent 1 — Symptom Intake | llama3.2:3b-instruct-q4_K_M |
| Rachith | Agent 2 — Pattern Detection | deepseek-r1:7b-qwen-distill-q4_K_M |
| Tharindu | Agent 3 — Risk Assessment | deepseek-r1:7b-qwen-distill-q4_K_M |
| Githadi | Agent 4 — Report Writer | llama3.2:3b-instruct-q4_K_M |

## Setup

### 1. Pull Ollama models
```bash
ollama pull llama3.2:3b-instruct-q4_K_M
ollama pull deepseek-r1:7b-qwen-distill-q4_K_M
```

### 2. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the backend
```bash
python backend/main.py
```

### 4. Run the frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Run tests
```bash
pytest -v
```

## Usage

1. Open `http://localhost:5173` in your browser
2. Upload a `.txt` symptom journal file
3. Enter your city name for weather correlation
4. Click **Analyse Journal** — the 4-agent pipeline runs sequentially
5. View patterns, risk flags, and the generated health report

## Architecture

```
journal.txt → Agent1 (llama3.2) → Agent2 (deepseek-r1) → Agent3 (deepseek-r1) → Agent4 (llama3.2) → report.md
```

External APIs: Open-Meteo (weather), MedlinePlus Connect (health articles)
