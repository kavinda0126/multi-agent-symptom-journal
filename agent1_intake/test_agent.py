import pytest, tempfile, os
from unittest.mock import patch
from agent1_intake.agent import run_agent1
from agent1_intake.tool  import parse_symptoms


def base_state():
    return {
        "journal_path": "", "raw_text": "", "user_city": "Colombo",
        "structured_symptoms": [], "symptom_terms": {},
        "patterns": {}, "weather_correlations": {},
        "risk_flags": [], "lifestyle_suggestions": [], "medline_links": [],
        "final_report": "", "report_path": "",
        "current_agent": "", "status": "running", "logs": [], "error": None
    }


def test_parse_symptoms_reads_file():
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
        f.write("Day 1: headache severity 7\nDay 2: fatigue severity 5\n")
        path = f.name
    result = parse_symptoms(path)
    assert result["line_count"] == 2
    assert result["has_content"] is True
    os.unlink(path)


def test_parse_symptoms_missing_file():
    with pytest.raises(FileNotFoundError):
        parse_symptoms("nonexistent.txt")


def test_parse_symptoms_wrong_extension():
    with pytest.raises(ValueError):
        parse_symptoms("journal.pdf")


@patch("agent1_intake.agent.Ollama")
@patch("agent1_intake.agent.parse_symptoms")
def test_agent1_sets_raw_text(mock_tool, mock_llm):
    mock_tool.return_value = {"raw_text": "Day 1: headache", "line_count": 1, "has_content": True}
    mock_llm.return_value.invoke.return_value = '[{"symptom_name":"cephalgia","severity":7}]'
    state = base_state()
    state["journal_path"] = "test.txt"
    result = run_agent1(state)
    assert result["raw_text"] == "Day 1: headache"


@patch("agent1_intake.agent.Ollama")
@patch("agent1_intake.agent.parse_symptoms")
def test_agent1_extracts_symptoms(mock_tool, mock_llm):
    mock_tool.return_value = {"raw_text": "Day 1: headache", "line_count": 1, "has_content": True}
    mock_llm.return_value.invoke.return_value = '[{"symptom_name":"cephalgia","severity":7}]'
    state = base_state()
    state["journal_path"] = "test.txt"
    result = run_agent1(state)
    assert len(result["structured_symptoms"]) == 1
    assert result["structured_symptoms"][0]["symptom_name"] == "cephalgia"


@patch("agent1_intake.agent.Ollama")
@patch("agent1_intake.agent.parse_symptoms")
def test_agent1_handles_bad_llm_json(mock_tool, mock_llm):
    mock_tool.return_value = {"raw_text": "Day 1: headache", "line_count": 1, "has_content": True}
    mock_llm.return_value.invoke.return_value = "Sorry I cannot help."
    state = base_state()
    state["journal_path"] = "test.txt"
    result = run_agent1(state)
    assert result["structured_symptoms"] == []
