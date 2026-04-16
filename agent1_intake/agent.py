from langchain_ollama import OllamaLLM as Ollama
from core.state import SymptomJournalState
from core.logger import log_event
from agent1_intake.tool import parse_symptoms

MODEL = "llama3.2:3b-instruct-q4_K_M"

SYSTEM_PROMPT = """You are a medical data extraction specialist.
Read the patient symptom journal and convert it into structured JSON.
For each day extract: date, symptom_name, severity (1-10), time_of_day, duration_hours.
Use proper medical terminology (e.g. 'tired' -> 'fatigue', 'headache' -> 'cephalgia').
Return ONLY a valid JSON array. No explanation. No markdown. Just the JSON."""


def run_agent1(state: SymptomJournalState) -> SymptomJournalState:
    """Agent 1 (Kavinda): Read journal file and extract structured symptom data."""
    state["current_agent"] = "agent1"
    log_event("agent1", "start", {"file": state["journal_path"]})

    log_event("agent1", "tool_call", {"tool": "parse_symptoms"})
    raw = parse_symptoms(state["journal_path"])
    state["raw_text"] = raw["raw_text"]
    log_event("agent1", "tool_call", {"lines_read": raw["line_count"]})

    llm    = Ollama(model=MODEL, keep_alive=0)
    prompt = f"{SYSTEM_PROMPT}\n\nJournal:\n{state['raw_text']}\n\nReturn JSON:"
    log_event("agent1", "llm_call", {"model": MODEL, "prompt_len": len(prompt)})
    response = llm.invoke(prompt)
    log_event("agent1", "llm_call", {"response_len": len(response)})

    import json, re
    try:
        json_str = re.search(r'\[.*\]', response, re.DOTALL).group()
        parsed = json.loads(json_str)
        # ensure each item is a dict with a string symptom_name
        symptoms = []
        for s in parsed:
            if isinstance(s, dict):
                name = s.get("symptom_name", "")
                if isinstance(name, list):
                    s["symptom_name"] = str(name[0]) if name else "unknown"
                elif isinstance(name, dict):
                    s["symptom_name"] = str(next(iter(name.values()), "unknown"))
                elif not isinstance(name, str):
                    s["symptom_name"] = str(name) if name else "unknown"
                symptoms.append(s)
        state["structured_symptoms"] = symptoms
    except Exception:
        state["structured_symptoms"] = []

    state["symptom_terms"] = {
        s.get("symptom_name", ""): s.get("symptom_name", "")
        for s in state["structured_symptoms"]
        if isinstance(s, dict) and isinstance(s.get("symptom_name", ""), str)
    }
    log_event("agent1", "output", {"symptoms_extracted": len(state["structured_symptoms"])})
    return state
