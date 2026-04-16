from langchain_community.llms import Ollama
from core.state import SymptomJournalState
from core.logger import log_event
from agent2_patterns.tool import analyze_patterns

MODEL = "deepseek-r1:7b-qwen-distill-q4_K_M"

SYSTEM_PROMPT = """You are a health data analyst with expertise in pattern recognition.
You are given structured symptom data and weather information for each day.
Think step by step. Identify:
1. The top 3 most frequent symptoms and their average severity
2. Time-of-day patterns (morning / afternoon / evening / night)
3. Any correlation between weather conditions and symptom severity
State each finding clearly. Cite the data. Do NOT diagnose. Do NOT suggest treatments."""


def run_agent2(state: SymptomJournalState) -> SymptomJournalState:
    """Agent 2 (Rachith): Detect symptom patterns and weather correlations."""
    state["current_agent"] = "agent2"
    log_event("agent2", "start", {"symptom_count": len(state["structured_symptoms"])})

    log_event("agent2", "tool_call", {"tool": "analyze_patterns", "city": state["user_city"]})
    analysis = analyze_patterns(state["structured_symptoms"], state["user_city"])
    log_event("agent2", "api_call", {"api": "open_meteo", "days_fetched": analysis.get("weather_days", 0)})

    context  = f"Symptom frequency: {analysis['frequency']}\nWeather data: {analysis['weather']}"
    llm      = Ollama(model=MODEL, keep_alive=0)
    prompt   = f"{SYSTEM_PROMPT}\n\nData:\n{context}\n\nAnalysis:"
    log_event("agent2", "llm_call", {"model": MODEL})
    response = llm.invoke(prompt)
    log_event("agent2", "llm_call", {"response_len": len(response), "has_thinking": "<think>" in response})

    state["patterns"]             = analysis["frequency"]
    state["weather_correlations"] = {"raw_weather": analysis["weather"], "llm_analysis": response}
    log_event("agent2", "output", {"patterns_found": len(analysis["frequency"])})
    return state
