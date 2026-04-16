from typing import TypedDict, List, Dict, Any, Optional


class SymptomJournalState(TypedDict):
    # Input
    journal_path:           str
    raw_text:               str
    user_city:              str

    # Kavinda — Agent 1 output (llama3.2:3b-instruct-q4_K_M)
    structured_symptoms:    List[Dict]
    symptom_terms:          Dict

    # Rachith — Agent 2 output (deepseek-r1:7b-qwen-distill-q4_K_M)
    patterns:               Dict
    weather_correlations:   Dict

    # Tharindu — Agent 3 output (deepseek-r1:7b-qwen-distill-q4_K_M)
    risk_flags:             List[Dict]
    lifestyle_suggestions:  List[str]
    medline_links:          List[Dict]

    # Githadi — Agent 4 output (llama3.2:3b-instruct-q4_K_M)
    final_report:           str
    report_path:            str

    # System
    current_agent:          str
    status:                 str
    logs:                   List[Dict]
    error:                  Optional[str]
