from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
import requests
from django.conf import settings
from ..utils.geo_utils import sample_checkpoints, determine_interval

METERS_TO_MILES = 0.000621371


def get_routes(
    origin: Tuple[float, float],
    destination: Tuple[float, float],
    departure_dt: datetime,
) -> List[Dict[str, Any]]:
    """
    Calls ORS directions API and returns up to 3 route objects with checkpoints.
    origin / destination are (lng, lat) tuples.
    """
    payload = {
        "coordinates": [list(origin), list(destination)],
        "alternative_routes": {"target_count": 3, "weight_factor": 1.6, "share_factor": 0.6},
        "geometry": True,
        "instructions": False,
    }

    response = requests.post(
        f"{settings.ORS_BASE_URL}/v2/directions/driving-hgv",
        json=payload,
        headers={"Authorization": settings.ORS_API_KEY, "Content-Type": "application/json"},
        timeout=30,
    )
    response.raise_for_status()

    raw_routes = response.json().get("routes", [])
    routes = []

    for idx, raw in enumerate(raw_routes[:3]):
        summary = raw["summary"]
        distance_miles = summary["distance"] * METERS_TO_MILES
        duration_seconds = summary["duration"]
        duration_hours = duration_seconds / 3600

        coords = raw["geometry"]["coordinates"]  # [[lng, lat], ...]
        avg_speed_mph = distance_miles / duration_hours if duration_hours > 0 else 60.0

        interval = determine_interval(distance_miles)
        raw_checkpoints = sample_checkpoints(coords, distance_miles, interval)

        checkpoints = []
        for lat, lng, dist_miles in raw_checkpoints:
            travel_hours = dist_miles / avg_speed_mph
            eta = departure_dt + timedelta(hours=travel_hours)
            checkpoints.append({
                "lat": lat,
                "lng": lng,
                "distance_miles": round(dist_miles, 2),
                "eta_iso": eta.isoformat(),
            })

        routes.append({
            "index": idx,
            "distance_miles": round(distance_miles, 2),
            "duration_hours": round(duration_hours, 2),
            "geometry": [[c[1], c[0]] for c in coords],  # convert to [lat, lng] for Leaflet
            "checkpoints": checkpoints,
        })

    return routes
