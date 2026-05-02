# Agent 2 — Pattern Detection

## Description
Agent 2 analyses symptom frequency from Agent 1's output and fetches 7-day weather data from the Open-Meteo API. It uses `deepseek-r1:7b-qwen-distill-q4_K_M` to reason about correlations.

## Model
`deepseek-r1:7b-qwen-distill-q4_K_M` — 4.7 GB, ~5-6 GB RAM, 128K context, chain-of-thought reasoning via `<think>` tokens.

## Tool
`analyze_patterns(symptoms, city)` — returns:
- `frequency` — dict of symptom name → occurrence count
- `weather` — Open-Meteo daily weather data (temp, precipitation, humidity)
- `weather_days` — number of days of weather data fetched

## Open-Meteo API
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast: `https://api.open-meteo.com/v1/forecast`
- Free, no API key required
- `past_days=7` retrieves the past week of data

## Pattern Detection Logic
1. Count frequency of each symptom across all journal entries
2. Fetch weather for the user's city
3. Pass both to deepseek-r1 with a step-by-step reasoning prompt
4. LLM identifies top symptoms, time-of-day patterns, and weather correlations
