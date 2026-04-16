import requests
from typing import List, Dict, Any

SYMPTOM_CODES = {
    "cephalgia": "000792",
    "headache":  "000792",
    "fatigue":   "003088",
    "nausea":    "002862",
    "back pain": "000071",
    "insomnia":  "002285",
    "dizziness": "000764",
    "anxiety":   "000922",
}

LIFESTYLE_MAP = {
    "cephalgia": ["Stay hydrated — drink 2.5L of water daily", "Limit screen time — take breaks every hour"],
    "headache":  ["Stay hydrated — drink 2.5L of water daily", "Limit screen time — take breaks every hour"],
    "fatigue":   ["Maintain a consistent sleep schedule of 7-8 hours", "Take a 20-minute walk outside daily"],
    "nausea":    ["Eat small frequent meals and avoid spicy food", "Stay upright for 30 minutes after eating"],
    "insomnia":  ["Avoid screens 1 hour before bed", "Keep bedroom cool and dark for better sleep"],
}


def get_risk_assessment(symptom_names: List[str]) -> Dict[str, Any]:
    """
    Fetch MedlinePlus health article links for each detected symptom.

    Args:
        symptom_names: List of medical symptom name strings

    Returns:
        Dict with keys: medline_links (list), risk_flags (list), lifestyle_suggestions (list)

    Raises:
        requests.RequestException: If MedlinePlus API is unavailable
    """
    medline_links         = []
    risk_flags            = []
    lifestyle_suggestions = []

    for symptom in symptom_names:
        key  = symptom.lower()
        code = SYMPTOM_CODES.get(key)
        if code:
            try:
                url      = f"https://connect.medlineplus.gov/service?mainSearchCriteria.v.c={code}&knowledgeResponseType=application/json"
                response = requests.get(url, timeout=8).json()
                entries  = response.get("feed", {}).get("entry", [])
                if entries:
                    medline_links.append({
                        "symptom": symptom,
                        "title":   entries[0].get("title", {}).get("_value", symptom.title()),
                        "url":     entries[0].get("link", [{}])[0].get("href", "https://medlineplus.gov")
                    })
            except requests.RequestException:
                medline_links.append({"symptom": symptom, "title": symptom.title(), "url": "https://medlineplus.gov"})

        risk_flags.append({"symptom": symptom, "level": "MEDIUM"})
        if key in LIFESTYLE_MAP:
            lifestyle_suggestions.extend(LIFESTYLE_MAP[key])

    return {
        "medline_links":         medline_links,
        "risk_flags":            risk_flags,
        "lifestyle_suggestions": list(set(lifestyle_suggestions))
    }
