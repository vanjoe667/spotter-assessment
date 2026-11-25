import type { Route, RiskLevel } from "../types";
import { RiskBadge } from "./RiskBadge";

interface Props {
  route: Route;
  isRecommended: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

const RISK_ORDER: RiskLevel[] = ["NO_TRAVEL", "SEVERE", "HIGH", "MODERATE", "LOW"];

function dominantRisk(summary: Route["risk_summary"]): RiskLevel {
  for (const level of RISK_ORDER) {
    if (summary[level.toLowerCase() as keyof typeof summary] > 0) return level;
  }
  return "LOW";
}

export function RouteCard({ route, isRecommended, isSelected, onSelect }: Props) {
  const topRisk = dominantRisk(route.risk_summary);

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-gray-900 text-sm">Route {route.index + 1}</span>
          {isRecommended && (
            <span className="text-xs font-semibold bg-blue-600 text-white px-2 py-0.5 rounded-full">
              Recommended
            </span>
          )}
        </div>
        <RiskBadge level={topRisk} size="sm" />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600 mb-3">
        <span>{route.distance_miles.toFixed(0)} mi</span>
        <span>{route.duration_hours.toFixed(1)} hrs</span>
        <span>Avg risk: {route.avg_risk_score.toFixed(2)}</span>
        <span>Severe: {route.severe_miles.toFixed(0)} mi</span>
      </div>

      <div className="flex flex-wrap gap-1">
        {(["NO_TRAVEL", "SEVERE", "HIGH", "MODERATE", "LOW"] as RiskLevel[]).map((level) => {
          const count = route.risk_summary[level.toLowerCase() as keyof typeof route.risk_summary];
          if (!count) return null;
          return (
            <span key={level} className="flex items-center gap-1 text-xs text-gray-500">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{
                  backgroundColor: {
                    LOW: "#22c55e",
                    MODERATE: "#eab308",
                    HIGH: "#f97316",
                    SEVERE: "#ef4444",
                    NO_TRAVEL: "#7f1d1d",
                  }[level],
                }}
              />
              {count}× {level.replace("_", " ").toLowerCase()}
            </span>
          );
        })}
      </div>
    </button>
  );
}
