from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
import requests

from ..utils.geo_utils import sample_checkpoints, determine_interval

METERS_TO_MILES = 0.000621371
OSRM_BASE_URL = "http://router.project-osrm.org"


def get_routes(
    origin: Tuple[float, float],
    destination: Tuple[float, float],
    departure_dt: datetime,
) -> List[Dict[str, Any]]:
    """
    Calls OSRM public API and returns up to 3 route objects with checkpoints.
    origin / destination are (lng, lat) tuples.
    """
    lng1, lat1 = origin
    lng2, lat2 = destination
    coords_str = f"{lng1},{lat1};{lng2},{lat2}"

    response = requests.get(
        f"{OSRM_BASE_URL}/route/v1/driving/{coords_str}",
        params={
            "alternatives": "true",
            "geometries": "geojson",
            "overview": "full",
            "steps": "false",
        },
        timeout=30,
    )
    response.raise_for_status()

    data = response.json()
    if data.get("code") != "Ok":
        raise RuntimeError(f"OSRM error: {data.get('message', data.get('code'))}")

    raw_routes = data.get("routes", [])
    routes = []

    for idx, raw in enumerate(raw_routes[:3]):
        distance_meters = raw["distance"]
        duration_seconds = raw["duration"]
        distance_miles = distance_meters * METERS_TO_MILES
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
            "geometry": [[c[1], c[0]] for c in coords],  # [lng,lat] → [lat,lng] for Leaflet
            "checkpoints": checkpoints,
        })

    return routes
