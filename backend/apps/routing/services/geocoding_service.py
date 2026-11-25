from typing import Tuple
import requests
from django.conf import settings


def geocode(location: str) -> Tuple[float, float]:
    """Returns (lng, lat) for the given location string."""
    response = requests.get(
        f"{settings.ORS_BASE_URL}/geocode/search",
        params={"api_key": settings.ORS_API_KEY, "text": location, "size": 1},
        timeout=10,
    )
    response.raise_for_status()

    features = response.json().get("features", [])
    if not features:
        raise ValueError(f"No geocoding results for: {location}")

    coords = features[0]["geometry"]["coordinates"]
    return coords[0], coords[1]  # lng, lat
