from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pathlib import Path
import shutil, uvicorn

from core.state    import SymptomJournalState
from core.pipeline import build_pipeline

app = FastAPI(title="Agentic AI Symptom Journal MAS")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
pipeline = build_pipeline()


@app.post("/review")
async def review_journal(file: UploadFile = File(...), city: str = "Colombo"):
    """Accept a .txt journal and city, run the full pipeline, return results."""
    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)
    file_path  = upload_dir / file.filename
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    initial_state: SymptomJournalState = {
        "journal_path": str(file_path), "raw_text": "", "user_city": city,
        "structured_symptoms": [], "symptom_terms": {},
        "patterns": {}, "weather_correlations": {},
        "risk_flags": [], "lifestyle_suggestions": [], "medline_links": [],
        "final_report": "", "report_path": "",
        "current_agent": "", "status": "running", "logs": [], "error": None
    }

    try:
        result = pipeline.invoke(initial_state)
        return JSONResponse({
            "status":        result["status"],
            "symptoms":      result["structured_symptoms"],
            "patterns":      result["patterns"],
            "weather":       result["weather_correlations"],
            "risks":         result["risk_flags"],
            "suggestions":   result["lifestyle_suggestions"],
            "medline_links": result["medline_links"],
            "report":        result["final_report"],
            "report_path":   result["report_path"]
        })
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
