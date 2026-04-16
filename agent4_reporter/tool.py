from pathlib import Path
from datetime import datetime


def write_report(content: str, output_dir: str = "reports") -> str:
    """
    Write the final Markdown health report to disk.

    Args:
        content:    Full Markdown string for the report
        output_dir: Directory to save the file (created if missing)

    Returns:
        Absolute path string to the saved .md file

    Raises:
        ValueError: If content is empty or whitespace only
        OSError:    If file cannot be written to disk
    """
    if not content.strip():
        raise ValueError("Report content cannot be empty")

    out_dir   = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_path = out_dir / f"health_report_{timestamp}.md"
    file_path.write_text(content, encoding="utf-8")
    return str(file_path.resolve())
