from typing import Tuple
import requests


def geocode(location: str) -> Tuple[float, float]:
    """
    Returns (lng, lat) for the given location string.
    Uses Nominatim (OpenStreetMap) — free, no API key required.
    """
    response = requests.get(
        "https://nominatim.openstreetmap.org/search",
        params={"q": location, "format": "json", "limit": 1},
        headers={"User-Agent": "spotter-assessment/1.0"},
        timeout=10,
    )
    response.raise_for_status()

    results = response.json()
    if not results:
        raise ValueError(f"No geocoding results for: {location}")

    hit = results[0]
    return float(hit["lon"]), float(hit["lat"])  # lng, lat
