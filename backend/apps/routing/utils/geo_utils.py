import math
from typing import List, Tuple


def haversine_miles(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 3958.8
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def sample_checkpoints(
    coords: List[List[float]],
    total_distance_miles: float,
    interval_miles: float,
) -> List[Tuple[float, float, float]]:
    """
    Walk the route geometry and return (lat, lng, cumulative_miles) for each
    checkpoint that falls on an interval boundary.
    coords are [lng, lat] pairs from ORS.
    """
    if total_distance_miles <= 0 or not coords:
        return []

    checkpoints: List[Tuple[float, float, float]] = []
    cumulative = 0.0
    next_target = interval_miles

    for i in range(1, len(coords)):
        lng1, lat1 = coords[i - 1]
        lng2, lat2 = coords[i]
        segment_dist = haversine_miles(lat1, lon1=lng1, lat2=lat2, lon2=lng2)

        while next_target <= cumulative + segment_dist and next_target <= total_distance_miles:
            fraction = (next_target - cumulative) / segment_dist if segment_dist > 0 else 0
            interp_lat = lat1 + fraction * (lat2 - lat1)
            interp_lng = lng1 + fraction * (lng2 - lng1)
            checkpoints.append((interp_lat, interp_lng, next_target))
            next_target += interval_miles

        cumulative += segment_dist

    return checkpoints


def determine_interval(total_distance_miles: float) -> float:
    """Pick checkpoint interval based on route length."""
    if total_distance_miles <= 100:
        return 10.0
    elif total_distance_miles <= 300:
        return 25.0
    return 50.0
