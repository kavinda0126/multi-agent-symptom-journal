import requests
from collections import Counter
from typing import List, Dict, Any


def analyze_patterns(symptoms: List[Dict], city: str) -> Dict[str, Any]:
    """
    Analyse symptom frequency and fetch weather data from Open-Meteo API.

    Args:
        symptoms: List of structured symptom dicts from Agent 1
        city:     City name string for weather lookup e.g. 'Colombo'

    Returns:
        Dict with keys: frequency (dict), weather (dict), weather_days (int)

    Raises:
        requests.RequestException: If weather API call fails
    """
    symptom_names = []
    for s in symptoms:
        if not isinstance(s, dict):
            continue
        name = s.get("symptom_name", "unknown")
        if isinstance(name, (list, dict)):
            name = "unknown"
        symptom_names.append(str(name) if name else "unknown")
    frequency = dict(Counter(symptom_names))

    weather_data = {}
    weather_days = 0
    try:
        if not city or not city.strip():
            raise requests.RequestException("No city provided")
        geo_url  = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=en"
        geo_resp = requests.get(geo_url, timeout=10).json()
        results  = geo_resp.get("results", [])
        if results:
            lat    = results[0]["latitude"]
            lon    = results[0]["longitude"]
            wx_url = (
                f"https://api.open-meteo.com/v1/forecast"
                f"?latitude={lat}&longitude={lon}"
                f"&daily=temperature_2m_max,precipitation_sum,relative_humidity_2m_max"
                f"&past_days=7&forecast_days=0&timezone=auto"
            )
            wx_resp      = requests.get(wx_url, timeout=10).json()
            weather_data = wx_resp.get("daily", {})
            weather_days = len(weather_data.get("time", []))
    except requests.RequestException:
        weather_data = {"error": "Weather API unavailable"}

    return {"frequency": frequency, "weather": weather_data, "weather_days": weather_days}
