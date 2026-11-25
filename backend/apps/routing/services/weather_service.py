from datetime import datetime
from typing import Dict, Any, List
import requests
from django.conf import settings

KMH_TO_MPH = 0.621371
MM_TO_INCHES = 1 / 25.4


def _fetch_hourly_forecast(lat: float, lng: float) -> Dict[str, Any]:
    response = requests.get(
        f"{settings.OPEN_METEO_BASE_URL}/forecast",
        params={
            "latitude": lat,
            "longitude": lng,
            "hourly": "windspeed_10m,precipitation,snowfall",
            "forecast_days": 3,
            "timezone": "auto",
        },
        timeout=10,
    )
    response.raise_for_status()
    return response.json()


def _closest_hour_index(times: List[str], target_iso: str) -> int:
    """Find the index of the hourly slot closest to the target ISO timestamp."""
    target = datetime.fromisoformat(target_iso.replace("Z", "+00:00"))

    best_idx = 0
    best_delta = None

    for i, t in enumerate(times):
        slot = datetime.fromisoformat(t)
        # make both offset-naive for comparison if needed
        if slot.tzinfo and not target.tzinfo:
            slot = slot.replace(tzinfo=None)
        elif target.tzinfo and not slot.tzinfo:
            target = target.replace(tzinfo=None)

        delta = abs((slot - target).total_seconds())
        if best_delta is None or delta < best_delta:
            best_delta = delta
            best_idx = i

    return best_idx


def get_weather_at_checkpoint(lat: float, lng: float, eta_iso: str) -> Dict[str, float]:
    data = _fetch_hourly_forecast(lat, lng)
    hourly = data.get("hourly", {})
    times = hourly.get("time", [])

    idx = _closest_hour_index(times, eta_iso)

    wind_kmh = hourly.get("windspeed_10m", [0])[idx] or 0
    rain_mm = hourly.get("precipitation", [0])[idx] or 0
    snow_mm = hourly.get("snowfall", [0])[idx] or 0

    return {
        "wind_mph": round(wind_kmh * KMH_TO_MPH, 2),
        "rain_in_hr": round(rain_mm * MM_TO_INCHES, 4),
        "snow_in_hr": round(snow_mm * MM_TO_INCHES, 4),
    }
