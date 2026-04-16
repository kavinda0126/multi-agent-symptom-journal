import json
from datetime import datetime
from pathlib import Path

LOG_FILE = Path("logs/agent_log.jsonl")
LOG_FILE.parent.mkdir(exist_ok=True)


def log_event(agent: str, event_type: str, data: dict) -> dict:
    """
    Write a single log entry to agent_log.jsonl.

    Args:
        agent:      agent name e.g. 'agent1'
        event_type: 'tool_call' | 'api_call' | 'llm_call' | 'output' | 'error'
        data:       dict of relevant details

    Returns:
        The log entry dict that was written
    """
    entry = {
        "timestamp": datetime.now().isoformat(),
        "agent":     agent,
        "event":     event_type,
        "data":      data
    }
    with open(LOG_FILE, "a") as f:
        f.write(json.dumps(entry) + "\n")
    return entry
