# Truck Route Planner

A weather-aware truck routing application that evaluates up to 3 route alternatives between any two locations and recommends the safest one based on real-time weather conditions, load weight, and travel time. Weather risk is sampled at checkpoints along each route using the truck's estimated arrival time at that point — not departure-time weather — which makes the analysis meaningfully more accurate for long-haul trips.

## Features

- 3 alternative route options via OpenRouteService (HGV profile)
- Time-aware weather sampling: checkpoint ETAs computed from route avg speed, then matched to Open-Meteo hourly forecast
- Risk classification per checkpoint (Low → No Travel) for wind, rain, and snow independently
- Load-weight overrides that escalate wind risk based on cargo weight
- 4-tier route recommendation: fewest severe miles → fewest high miles → lowest avg risk → shortest time
- Interactive Leaflet map with color-coded checkpoints and route polylines
- Weather risk corridor heatmap with 0–48h forecast slider

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Leaflet / react-leaflet |
| Backend | Django 5, Django REST Framework |
| Routing | OpenRouteService Directions API (driving-hgv) |
| Geocoding | OpenRouteService Geocode API |
| Weather | Open-Meteo Forecast API (no key required) |
| Deploy | Railway (backend), Vercel (frontend) |

## Local Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env — add your ORS_API_KEY and a SECRET_KEY

python manage.py migrate
python manage.py runserver
```

API available at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install

cp .env.example .env
# VITE_API_BASE_URL=http://localhost:8000 (default, no change needed for local)

npm run dev
```

App available at `http://localhost:5173`.

## API Reference

### `POST /api/routes/`

**Request**
```json
{
  "origin": "Chicago, IL",
  "destination": "St. Louis, MO",
  "departure_datetime": "2026-11-26T08:00:00",
  "load_weight": 35000
}
```

`departure_datetime` — ISO 8601, local time accepted.  
`load_weight` — in pounds.

**Response**
```json
{
  "recommended_route_index": 0,
  "routes": [
    {
      "index": 0,
      "distance_miles": 294.5,
      "duration_hours": 4.8,
      "geometry": [[lat, lng], ...],
      "checkpoints": [
        {
          "lat": 41.85,
          "lng": -87.65,
          "distance_miles": 25.0,
          "eta_iso": "2026-11-26T08:25:00",
          "risk_level": "LOW",
          "risk_score": 1,
          "weather": {
            "wind_mph": 12.3,
            "rain_in_hr": 0.02,
            "snow_in_hr": 0.0
          }
        }
      ],
      "risk_summary": { "low": 8, "moderate": 2, "high": 1, "severe": 0, "no_travel": 0 },
      "severe_miles": 0.0,
      "high_miles": 25.0,
      "avg_risk_score": 1.36
    }
  ]
}
```

## Deployment

See `docs/DEPLOY.md` (gitignored).

## Architecture Notes

**Why OpenRouteService?** Free tier (500 req/day), native HGV vehicle profile, returns genuine route alternatives via `alternative_routes` parameter. Mapbox would be better for production but costs money immediately.

**Why Open-Meteo?** No API key, 3-day hourly forecast, global coverage, `snowfall` field included. The key variable is querying it at the checkpoint's ETA rather than at departure — a 300-mile trip spans 5+ hours of weather evolution.

**Checkpoint interval scaling:** Short routes (≤100 mi) use 10-mile intervals; medium (≤300 mi) use 25-mile; long trips use 50-mile. This keeps weather API calls bounded while maintaining useful resolution.

**Load overrides:** Applied after base classification so the worst-case condition always wins. Wind thresholds are asymmetric because high-sided trucks flip at lower speeds than the base thresholds assume.
