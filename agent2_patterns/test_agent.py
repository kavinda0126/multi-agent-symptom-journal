import pytest
from unittest.mock import patch
from agent2_patterns.agent import run_agent2
from agent2_patterns.tool  import analyze_patterns


def base_state():
    return {
        "journal_path": "", "raw_text": "", "user_city": "Colombo",
        "structured_symptoms": [
            {"symptom_name": "cephalgia", "severity": 7, "time_of_day": "afternoon"},
            {"symptom_name": "fatigue",   "severity": 5, "time_of_day": "morning"},
            {"symptom_name": "cephalgia", "severity": 8, "time_of_day": "afternoon"},
        ],
        "symptom_terms": {}, "patterns": {}, "weather_correlations": {},
        "risk_flags": [], "lifestyle_suggestions": [], "medline_links": [],
        "final_report": "", "report_path": "",
        "current_agent": "", "status": "running", "logs": [], "error": None
    }


@patch("agent2_patterns.tool.requests.get")
def test_analyze_patterns_frequency(mock_get):
    mock_get.return_value.json.return_value = {"results": []}
    result = analyze_patterns(base_state()["structured_symptoms"], "Colombo")
    assert result["frequency"]["cephalgia"] == 2
    assert result["frequency"]["fatigue"]   == 1


@patch("agent2_patterns.tool.requests.get")
def test_analyze_patterns_weather_api_called(mock_get):
    mock_get.return_value.json.side_effect = [
        {"results": [{"latitude": 6.9, "longitude": 79.8}]},
        {"daily": {"time": ["2026-04-01"], "temperature_2m_max": [32]}}
    ]
    result = analyze_patterns(base_state()["structured_symptoms"], "Colombo")
    assert result["weather_days"] == 1


@patch("agent2_patterns.tool.requests.get")
def test_analyze_patterns_handles_api_failure(mock_get):
    import requests as req
    mock_get.side_effect = req.RequestException("timeout")
    result = analyze_patterns(base_state()["structured_symptoms"], "Colombo")
    assert "error" in result["weather"]


@patch("agent2_patterns.agent.Ollama")
@patch("agent2_patterns.agent.analyze_patterns")
def test_agent2_sets_patterns(mock_tool, mock_llm):
    mock_tool.return_value = {"frequency": {"cephalgia": 2}, "weather": {}, "weather_days": 0}
    mock_llm.return_value.invoke.return_value = "Cephalgia is most frequent."
    result = run_agent2(base_state())
    assert result["patterns"]["cephalgia"] == 2


@patch("agent2_patterns.agent.Ollama")
@patch("agent2_patterns.agent.analyze_patterns")
def test_agent2_weather_correlations_populated(mock_tool, mock_llm):
    mock_tool.return_value = {"frequency": {}, "weather": {"temp": [32]}, "weather_days": 1}
    mock_llm.return_value.invoke.return_value = "<think>Thinking...</think> High temp correlates."
    result = run_agent2(base_state())
    assert "llm_analysis" in result["weather_correlations"]
