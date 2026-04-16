from langchain_ollama import OllamaLLM as Ollama
from core.state import SymptomJournalState
from core.logger import log_event
from agent4_reporter.tool import write_report

MODEL = "llama3.2:3b-instruct-q4_K_M"

SYSTEM_PROMPT = """You are a professional medical report writer.
Write a clean structured Markdown report a doctor can read in under 3 minutes.
Use EXACTLY these sections in this order:
## Executive Summary
## Symptom Timeline
## Patterns Detected
## Weather Correlations
## Risk Flags
## Lifestyle Recommendations
## Resources for Doctor
Be concise. Use bullet points. Include all data provided."""


def run_agent4(state: SymptomJournalState) -> SymptomJournalState:
    """Agent 4 (Githadi): Synthesise all findings into a professional Markdown report."""
    state["current_agent"] = "agent4"
    log_event("agent4", "start", {"risk_count": len(state["risk_flags"])})

    symptoms_text  = "\n".join([f"- {s.get('symptom_name')} (severity {s.get('severity')})" for s in state["structured_symptoms"]])
    patterns_text  = "\n".join([f"- {k}: {v} occurrences" for k, v in state["patterns"].items()])
    risks_text     = "\n".join([f"- {r['symptom']}: {r['level']}" for r in state["risk_flags"]]) if state["risk_flags"] else "No risk flags identified."
    lifestyle_text = "\n".join([f"- {s}" for s in state["lifestyle_suggestions"]])
    medline_text   = "\n".join([f"- {m['title']}: {m['url']}" for m in state["medline_links"]])
    weather_text   = state["weather_correlations"].get("llm_analysis", "No weather data available")

    context = f"Symptoms:\n{symptoms_text}\n\nPatterns:\n{patterns_text}\n\nWeather:\n{weather_text}\n\nRisks:\n{risks_text}\n\nLifestyle:\n{lifestyle_text}\n\nResources:\n{medline_text}"

    llm      = Ollama(model=MODEL, keep_alive=0)
    prompt   = f"{SYSTEM_PROMPT}\n\nData:\n{context}\n\nReport:"
    log_event("agent4", "llm_call", {"model": MODEL, "context_len": len(context)})
    report   = llm.invoke(prompt)
    log_event("agent4", "llm_call", {"report_len": len(report)})

    log_event("agent4", "tool_call", {"tool": "write_report"})
    path = write_report(report)
    log_event("agent4", "tool_call", {"saved_to": path})

    state["final_report"] = report
    state["report_path"]  = path
    state["status"]       = "complete"
    log_event("agent4", "output", {"report_path": path})
    return state
