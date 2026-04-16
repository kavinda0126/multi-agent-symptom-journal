from pathlib import Path
from typing import Dict, Any


def parse_symptoms(file_path: str) -> Dict[str, Any]:
    """
    Read a symptom journal .txt file from disk.

    Args:
        file_path: Path to the .txt journal file

    Returns:
        Dict with keys: raw_text (str), line_count (int), has_content (bool)

    Raises:
        FileNotFoundError: If file does not exist
        ValueError: If file is not a .txt file
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Journal file not found: {file_path}")
    if path.suffix != ".txt":
        raise ValueError(f"Expected .txt file, got: {path.suffix}")

    raw_text = path.read_text(encoding="utf-8")
    lines    = [l for l in raw_text.splitlines() if l.strip()]

    return {
        "raw_text":    raw_text,
        "line_count":  len(lines),
        "has_content": len(lines) > 0
    }
