from langchain_community.llms import Ollama
from core.state import SymptomJournalState
from core.logger import log_event
from agent3_risks.tool import get_risk_assessment

MODEL = "deepseek-r1:7b-qwen-distill-q4_K_M"

SYSTEM_PROMPT = """You are a preventive health advisor.
You are given symptom patterns and weather correlations from a patient journal.
Think carefully. For each significant pattern:
1. Assign a risk level: LOW, MEDIUM, HIGH, or URGENT
2. Give 2 specific lifestyle suggestions
3. State whether the patient should see a doctor
Return your assessment as structured plain text with clear sections.
Do NOT diagnose medical conditions. Base everything on the data given."""


def run_agent3(state: SymptomJournalState) -> SymptomJournalState:
    """Agent 3 (Tharindu): Assess health risks and fetch MedlinePlus article links."""
    state["current_agent"] = "agent3"
    log_event("agent3", "start", {"pattern_count": len(state["patterns"])})

    symptom_list = list(state["patterns"].keys())
    log_event("agent3", "tool_call", {"tool": "get_risk_assessment", "symptoms": symptom_list})
    assessment = get_risk_assessment(symptom_list)
    log_event("agent3", "api_call", {"api": "medlineplus", "links_found": len(assessment["medline_links"])})

    context = (
        f"Patterns: {state['patterns']}\n"
        f"Weather: {state['weather_correlations'].get('llm_analysis', '')}\n"
        f"MedlinePlus: {assessment['medline_links']}"
    )
    llm      = Ollama(model=MODEL, keep_alive=0)
    prompt   = f"{SYSTEM_PROMPT}\n\nData:\n{context}\n\nRisk Assessment:"
    log_event("agent3", "llm_call", {"model": MODEL})
    response = llm.invoke(prompt)
    log_event("agent3", "llm_call", {"response_len": len(response)})

    state["risk_flags"]            = assessment["risk_flags"]
    state["lifestyle_suggestions"] = assessment["lifestyle_suggestions"]
    state["medline_links"]         = assessment["medline_links"]
    log_event("agent3", "output", {"risk_flags": len(state["risk_flags"])})
    return state
