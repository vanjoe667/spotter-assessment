export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "SEVERE" | "NO_TRAVEL";

export interface WeatherData {
  wind_mph: number;
  rain_in_hr: number;
  snow_in_hr: number;
}

export interface Checkpoint {
  lat: number;
  lng: number;
  distance_miles: number;
  eta_iso: string;
  risk_level: RiskLevel;
  risk_score: number;
  weather: WeatherData;
}

export interface RiskSummary {
  low: number;
  moderate: number;
  high: number;
  severe: number;
  no_travel: number;
}

export interface Route {
  index: number;
  distance_miles: number;
  duration_hours: number;
  geometry: [number, number][];
  checkpoints: Checkpoint[];
  risk_summary: RiskSummary;
  severe_miles: number;
  high_miles: number;
  avg_risk_score: number;
}

export interface RoutesResponse {
  routes: Route[];
  recommended_route_index: number;
}

export interface RouteFormValues {
  origin: string;
  destination: string;
  departure_datetime: string;
  load_weight: number;
}
