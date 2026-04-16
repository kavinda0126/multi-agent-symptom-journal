import pytest, os, tempfile
from unittest.mock import patch
from agent4_reporter.agent import run_agent4
from agent4_reporter.tool  import write_report


def base_state():
    return {
        "journal_path": "", "raw_text": "", "user_city": "Colombo",
        "structured_symptoms": [{"symptom_name": "cephalgia", "severity": 7}],
        "symptom_terms": {},
        "patterns": {"cephalgia": 3},
        "weather_correlations": {"llm_analysis": "Headaches on humid days."},
        "risk_flags": [{"symptom": "cephalgia", "level": "MEDIUM"}],
        "lifestyle_suggestions": ["Drink more water"],
        "medline_links": [{"title": "Headache", "url": "https://medlineplus.gov/headache.html"}],
        "final_report": "", "report_path": "",
        "current_agent": "", "status": "running", "logs": [], "error": None
    }


def test_write_report_creates_file():
    with tempfile.TemporaryDirectory() as tmp:
        path = write_report("# Test Report\n- finding 1", output_dir=tmp)
        assert os.path.exists(path)
        assert path.endswith(".md")


def test_write_report_content_correct():
    with tempfile.TemporaryDirectory() as tmp:
        path  = write_report("# Health Report\n## Summary\n- headache", output_dir=tmp)
        saved = open(path).read()
        assert "Health Report" in saved


def test_write_report_raises_on_empty():
    with pytest.raises(ValueError):
        write_report("   ")


@patch("agent4_reporter.agent.Ollama")
@patch("agent4_reporter.agent.write_report")
def test_agent4_sets_final_report(mock_tool, mock_llm):
    mock_tool.return_value = "/tmp/health_report.md"
    mock_llm.return_value.invoke.return_value = "# Health Report\n## Summary\n- All good"
    result = run_agent4(base_state())
    assert "Health Report" in result["final_report"]


@patch("agent4_reporter.agent.Ollama")
@patch("agent4_reporter.agent.write_report")
def test_agent4_sets_status_complete(mock_tool, mock_llm):
    mock_tool.return_value = "/tmp/health_report.md"
    mock_llm.return_value.invoke.return_value = "# Report"
    result = run_agent4(base_state())
    assert result["status"] == "complete"


@patch("agent4_reporter.agent.Ollama")
@patch("agent4_reporter.agent.write_report")
def test_agent4_report_has_required_sections(mock_tool, mock_llm):
    sections = ["## Executive Summary", "## Risk Flags", "## Lifestyle Recommendations"]
    mock_tool.return_value = "/tmp/report.md"
    mock_llm.return_value.invoke.return_value = "\n".join(sections)
    result = run_agent4(base_state())
    for s in sections:
        assert s in result["final_report"]
