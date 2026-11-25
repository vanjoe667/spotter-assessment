from enum import Enum
from typing import List, Dict, Any


class RiskLevel(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    SEVERE = "SEVERE"
    NO_TRAVEL = "NO_TRAVEL"


RISK_SCORES = {
    RiskLevel.LOW: 1,
    RiskLevel.MODERATE: 2,
    RiskLevel.HIGH: 3,
    RiskLevel.SEVERE: 4,
    RiskLevel.NO_TRAVEL: 5,
}


def _classify_wind(mph: float) -> RiskLevel:
    if mph >= 55:
        return RiskLevel.NO_TRAVEL
    if mph >= 45:
        return RiskLevel.SEVERE
    if mph >= 35:
        return RiskLevel.HIGH
    if mph >= 25:
        return RiskLevel.MODERATE
    return RiskLevel.LOW


def _classify_rain(in_hr: float) -> RiskLevel:
    if in_hr > 1.00:
        return RiskLevel.NO_TRAVEL
    if in_hr >= 0.50:
        return RiskLevel.SEVERE
    if in_hr >= 0.25:
        return RiskLevel.HIGH
    if in_hr >= 0.10:
        return RiskLevel.MODERATE
    return RiskLevel.LOW


def _classify_snow(in_hr: float) -> RiskLevel:
    if in_hr > 3.0:
        return RiskLevel.NO_TRAVEL
    if in_hr >= 2.0:
        return RiskLevel.SEVERE
    if in_hr >= 1.0:
        return RiskLevel.HIGH
    if in_hr >= 0.5:
        return RiskLevel.MODERATE
    return RiskLevel.LOW


def _apply_load_overrides(base_risk: RiskLevel, wind_mph: float, load_weight: float) -> RiskLevel:
    if wind_mph >= 55:
        return RiskLevel.NO_TRAVEL
    if wind_mph >= 45 and load_weight > 30000:
        return RiskLevel.NO_TRAVEL
    if wind_mph >= 35 and load_weight > 40000 and base_risk.value < RiskLevel.SEVERE.value:
        return RiskLevel.SEVERE
    return base_risk


def classify_checkpoint(weather: Dict[str, float], load_weight: float) -> RiskLevel:
    wind_risk = _classify_wind(weather["wind_mph"])
    rain_risk = _classify_rain(weather["rain_in_hr"])
    snow_risk = _classify_snow(weather["snow_in_hr"])

    base_risk = max([wind_risk, rain_risk, snow_risk], key=lambda r: RISK_SCORES[r])
    return _apply_load_overrides(base_risk, weather["wind_mph"], load_weight)


def score_route(checkpoints: List[Dict[str, Any]], duration_hours: float) -> Dict[str, Any]:
    if not checkpoints:
        return {
            "severe_miles": 0.0,
            "high_miles": 0.0,
            "avg_risk_score": 1.0,
            "travel_time_hours": duration_hours,
        }

    severe_miles = sum(
        c["distance_miles"]
        for c in checkpoints
        if c["risk_level"] in (RiskLevel.SEVERE, RiskLevel.NO_TRAVEL)
    )
    high_miles = sum(
        c["distance_miles"] for c in checkpoints if c["risk_level"] == RiskLevel.HIGH
    )
    avg_risk_score = sum(c["risk_score"] for c in checkpoints) / len(checkpoints)

    return {
        "severe_miles": round(severe_miles, 2),
        "high_miles": round(high_miles, 2),
        "avg_risk_score": round(avg_risk_score, 3),
        "travel_time_hours": duration_hours,
    }


def build_risk_summary(checkpoints: List[Dict[str, Any]]) -> Dict[str, int]:
    summary = {r.value.lower(): 0 for r in RiskLevel}
    for c in checkpoints:
        key = c["risk_level"].lower()
        summary[key] = summary.get(key, 0) + 1
    return summary


def recommend_route(routes: List[Dict[str, Any]]) -> int:
    """Returns the index (within the list) of the best route using 4-tier priority."""
    def sort_key(r):
        return (
            r["severe_miles"],
            r["high_miles"],
            r["avg_risk_score"],
            r["travel_time_hours"],
        )

    best = min(range(len(routes)), key=lambda i: sort_key(routes[i]))
    return routes[best]["index"]
