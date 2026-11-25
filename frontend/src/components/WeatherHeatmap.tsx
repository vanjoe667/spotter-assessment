import { useState } from "react";
import type { Route } from "../types";
import { RISK_COLORS, RISK_LABELS } from "../utils/riskColors";
import type { RiskLevel } from "../types";

interface Props {
  routes: Route[];
  selectedIndex: number;
  departureIso: string;
}

export function WeatherHeatmap({ routes, selectedIndex, departureIso }: Props) {
  const [offsetHours, setOffsetHours] = useState(0);

  const route = routes.find((r) => r.index === selectedIndex);
  if (!route || !route.checkpoints.length) return null;

  const departure = new Date(departureIso).getTime();
  const sliderMs = offsetHours * 3600 * 1000;

  // For each checkpoint, determine what the risk would look like at the slider's time offset.
  // Since we only have ETA-based risk, we show the actual risk data and annotate
  // which checkpoints are within the slider's forecast window.
  const checkpoints = route.checkpoints;
  const maxDist = checkpoints[checkpoints.length - 1].distance_miles;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Weather Risk Corridor</h3>
        <span className="text-xs text-gray-500">
          T+{offsetHours}h from departure
        </span>
      </div>

      <div className="mb-4">
        <input
          type="range"
          min={0}
          max={48}
          step={1}
          value={offsetHours}
          onChange={(e) => setOffsetHours(parseInt(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Now</span>
          <span>+24h</span>
          <span>+48h</span>
        </div>
      </div>

      {/* Heatmap strip */}
      <div className="relative h-10 rounded-lg overflow-hidden flex">
        {checkpoints.map((cp, i) => {
          const nextDist = checkpoints[i + 1]?.distance_miles ?? maxDist;
          const widthPct = ((nextDist - cp.distance_miles) / maxDist) * 100;
          const cpEta = new Date(cp.eta_iso).getTime();
          const inWindow = cpEta >= departure + sliderMs - 1800000 &&
                           cpEta <= departure + sliderMs + 3600000 * 2;

          return (
            <div
              key={i}
              title={`${cp.distance_miles} mi — ${RISK_LABELS[cp.risk_level]}`}
              style={{
                width: `${widthPct}%`,
                backgroundColor: RISK_COLORS[cp.risk_level],
                opacity: inWindow ? 1 : 0.4,
                transition: "opacity 0.2s",
              }}
              className="relative"
            >
              {inWindow && (
                <div className="absolute inset-0 ring-2 ring-white ring-inset" />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-3 flex-wrap">
        {(["LOW", "MODERATE", "HIGH", "SEVERE", "NO_TRAVEL"] as RiskLevel[]).map((level) => (
          <span key={level} className="flex items-center gap-1 text-xs text-gray-600">
            <span
              className="w-3 h-3 rounded-sm inline-block"
              style={{ backgroundColor: RISK_COLORS[level] }}
            />
            {RISK_LABELS[level]}
          </span>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-2">
        Highlighted segments fall within the selected forecast window.
      </p>
    </div>
  );
}
