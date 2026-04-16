import pytest
from unittest.mock import patch
from agent3_risks.agent import run_agent3
from agent3_risks.tool  import get_risk_assessment


def base_state():
    return {
        "journal_path": "", "raw_text": "", "user_city": "Colombo",
        "structured_symptoms": [],
        "symptom_terms": {},
        "patterns": {"cephalgia": 3, "fatigue": 2},
        "weather_correlations": {"llm_analysis": "Headaches on humid days."},
        "risk_flags": [], "lifestyle_suggestions": [], "medline_links": [],
        "final_report": "", "report_path": "",
        "current_agent": "", "status": "running", "logs": [], "error": None
    }


@patch("agent3_risks.tool.requests.get")
def test_get_risk_assessment_returns_medline_links(mock_get):
    mock_get.return_value.json.return_value = {
        "feed": {"entry": [{"title": {"_value": "Headache"}, "link": [{"href": "https://medlineplus.gov/headache.html"}]}]}
    }
    result = get_risk_assessment(["cephalgia"])
    assert len(result["medline_links"]) == 1
    assert "medlineplus" in result["medline_links"][0]["url"]


@patch("agent3_risks.tool.requests.get")
def test_get_risk_assessment_handles_api_failure(mock_get):
    import requests as req
    mock_get.side_effect = req.RequestException("timeout")
    result = get_risk_assessment(["cephalgia"])
    assert result["medline_links"][0]["url"] == "https://medlineplus.gov"


def test_get_risk_assessment_lifestyle_suggestions():
    result = get_risk_assessment(["fatigue"])
    assert len(result["lifestyle_suggestions"]) > 0


@patch("agent3_risks.agent.Ollama")
@patch("agent3_risks.agent.get_risk_assessment")
def test_agent3_sets_risk_flags(mock_tool, mock_llm):
    mock_tool.return_value = {
        "medline_links": [{"symptom": "cephalgia", "url": "https://medlineplus.gov/headache.html"}],
        "risk_flags": [{"symptom": "cephalgia", "level": "MEDIUM"}],
        "lifestyle_suggestions": ["Drink more water"]
    }
    mock_llm.return_value.invoke.return_value = "MEDIUM risk for cephalgia."
    result = run_agent3(base_state())
    assert len(result["risk_flags"]) == 1


@patch("agent3_risks.agent.Ollama")
@patch("agent3_risks.agent.get_risk_assessment")
def test_agent3_sets_medline_links(mock_tool, mock_llm):
    mock_tool.return_value = {
        "medline_links": [{"symptom": "cephalgia", "url": "https://medlineplus.gov/headache.html"}],
        "risk_flags": [], "lifestyle_suggestions": []
    }
    mock_llm.return_value.invoke.return_value = "Risk assessment complete."
    result = run_agent3(base_state())
    assert len(result["medline_links"]) == 1
