import { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from "react-leaflet";
import type { LatLngBounds } from "leaflet";
import L from "leaflet";
import type { Route } from "../types";
import { RISK_COLORS } from "../utils/riskColors";

interface Props {
  routes: Route[];
  recommendedIndex: number;
  selectedIndex: number;
}

function BoundsFitter({ routes }: { routes: Route[] }) {
  const map = useMap();
  useEffect(() => {
    if (!routes.length) return;
    const allPoints = routes.flatMap((r) => r.geometry);
    if (!allPoints.length) return;
    const bounds = L.latLngBounds(allPoints as [number, number][]);
    map.fitBounds(bounds as unknown as LatLngBounds, { padding: [40, 40] });
  }, [routes, map]);
  return null;
}

export function MapView({ routes, recommendedIndex, selectedIndex }: Props) {
  const activeRoutes = routes.filter((r) => r.index === selectedIndex);
  const otherRoutes = routes.filter((r) => r.index !== selectedIndex);

  return (
    <MapContainer
      center={[39.5, -98.35]}
      zoom={4}
      className="w-full h-full rounded-xl"
      style={{ minHeight: 480 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
      />
      <BoundsFitter routes={routes} />

      {otherRoutes.map((route) => (
        <Polyline
          key={route.index}
          positions={route.geometry as [number, number][]}
          pathOptions={{ color: "#94a3b8", weight: 3, opacity: 0.6 }}
        />
      ))}

      {activeRoutes.map((route) => (
        <Polyline
          key={route.index}
          positions={route.geometry as [number, number][]}
          pathOptions={{
            color: route.index === recommendedIndex ? "#16a34a" : "#3b82f6",
            weight: 5,
            opacity: 0.9,
          }}
        />
      ))}

      {routes
        .filter((r) => r.index === selectedIndex)
        .flatMap((route) =>
          route.checkpoints.map((cp, i) => (
            <CircleMarker
              key={`${route.index}-${i}`}
              center={[cp.lat, cp.lng]}
              radius={6}
              pathOptions={{
                fillColor: RISK_COLORS[cp.risk_level],
                color: "#fff",
                weight: 1.5,
                fillOpacity: 1,
              }}
            >
              <Popup>
                <div className="text-xs space-y-1 min-w-[160px]">
                  <p className="font-semibold">{cp.distance_miles} mi from origin</p>
                  <p className="text-gray-500">ETA: {new Date(cp.eta_iso).toLocaleString()}</p>
                  <p>
                    Risk:{" "}
                    <span style={{ color: RISK_COLORS[cp.risk_level] }} className="font-semibold">
                      {cp.risk_level.replace("_", " ")}
                    </span>
                  </p>
                  <hr />
                  <p>Wind: {cp.weather.wind_mph} mph</p>
                  <p>Rain: {cp.weather.rain_in_hr} in/hr</p>
                  <p>Snow: {cp.weather.snow_in_hr} in/hr</p>
                </div>
              </Popup>
            </CircleMarker>
          ))
        )}
    </MapContainer>
  );
}
