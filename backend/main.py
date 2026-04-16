import sys, os, threading, uuid, tempfile
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import Request
from pydantic import BaseModel
from pathlib import Path
import shutil, uvicorn

from core.state    import SymptomJournalState
from core.pipeline import build_pipeline

app = FastAPI(title="Agentic AI Symptom Journal MAS")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
pipeline = build_pipeline()

# Job store for tracking pipeline progress
jobs = {}

AGENT_ORDER = ["agent1", "agent2", "agent3", "agent4"]


def run_pipeline(job_id: str, initial_state: SymptomJournalState):
    """Run pipeline in background thread, updating job status after each agent."""
    try:
        jobs[job_id]["current_agent"] = "agent1"
        final_state = None

        # stream_mode="values" yields the full accumulated state after each node
        for full_state in pipeline.stream(initial_state, stream_mode="values"):
            completed = full_state.get("current_agent", "")
            final_state = full_state

            # Advance indicator to the next agent
            idx = AGENT_ORDER.index(completed) if completed in AGENT_ORDER else -1
            if idx >= 0 and idx < len(AGENT_ORDER) - 1:
                jobs[job_id]["current_agent"] = AGENT_ORDER[idx + 1]
            else:
                jobs[job_id]["current_agent"] = "done"

        if final_state:
            jobs[job_id]["status"]  = "complete"
            jobs[job_id]["result"]  = final_state
        else:
            jobs[job_id]["status"]  = "error"
            jobs[job_id]["error"]   = "Pipeline returned no state"

    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"]  = str(e)


def make_initial_state(journal_path: str, city: str) -> SymptomJournalState:
    return {
        "journal_path": journal_path, "raw_text": "", "user_city": city,
        "structured_symptoms": [], "symptom_terms": {},
        "patterns": {}, "weather_correlations": {},
        "risk_flags": [], "lifestyle_suggestions": [], "medline_links": [],
        "final_report": "", "report_path": "",
        "current_agent": "", "status": "running", "logs": [], "error": None
    }


def start_job(initial_state: SymptomJournalState) -> str:
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "running", "current_agent": "agent1", "result": None, "error": None}
    thread = threading.Thread(target=run_pipeline, args=(job_id, initial_state), daemon=True)
    thread.start()
    return job_id


@app.post("/review")
async def review_journal(file: UploadFile = File(...), city: str = "Colombo"):
    """Accept a .txt journal file, start pipeline in background, return job_id."""
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    file_path = upload_dir / file.filename
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    job_id = start_job(make_initial_state(str(file_path), city))
    return JSONResponse({"job_id": job_id})


class TextReviewRequest(BaseModel):
    text: str
    city: str = "Colombo"


@app.post("/review-text")
async def review_text(req: TextReviewRequest):
    """Accept pasted journal text, write to temp file, start pipeline."""
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    file_path = upload_dir / "pasted_journal.txt"
    file_path.write_text(req.text, encoding="utf-8")

    job_id = start_job(make_initial_state(str(file_path), req.city))
    return JSONResponse({"job_id": job_id})


@app.get("/status/{job_id}")
def get_status(job_id: str):
    """Poll this endpoint for pipeline progress."""
    job = jobs.get(job_id)
    if not job:
        return JSONResponse({"status": "not_found"}, status_code=404)

    if job["status"] == "complete":
        result = job["result"]
        return JSONResponse({
            "status":        "complete",
            "current_agent": "done",
            "symptoms":      result.get("structured_symptoms", []),
            "patterns":      result.get("patterns", {}),
            "weather":       result.get("weather_correlations", {}),
            "risks":         result.get("risk_flags", []),
            "suggestions":   result.get("lifestyle_suggestions", []),
            "medline_links": result.get("medline_links", []),
            "report":        result.get("final_report", ""),
            "report_path":   result.get("report_path", "")
        })

    if job["status"] == "error":
        return JSONResponse({"status": "error", "message": job["error"]}, status_code=500)

    return JSONResponse({"status": "running", "current_agent": job["current_agent"]})


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
