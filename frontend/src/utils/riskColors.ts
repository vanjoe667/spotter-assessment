import type { RiskLevel } from "../types";

export const RISK_COLORS: Record<RiskLevel, string> = {
  LOW: "#22c55e",
  MODERATE: "#eab308",
  HIGH: "#f97316",
  SEVERE: "#ef4444",
  NO_TRAVEL: "#7f1d1d",
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  LOW: "Low",
  MODERATE: "Moderate",
  HIGH: "High",
  SEVERE: "Severe",
  NO_TRAVEL: "No Travel",
};

export const RISK_BG_CLASSES: Record<RiskLevel, string> = {
  LOW: "bg-green-500",
  MODERATE: "bg-yellow-500",
  HIGH: "bg-orange-500",
  SEVERE: "bg-red-500",
  NO_TRAVEL: "bg-red-900",
};

export const RISK_TEXT_CLASSES: Record<RiskLevel, string> = {
  LOW: "text-green-700 bg-green-100",
  MODERATE: "text-yellow-700 bg-yellow-100",
  HIGH: "text-orange-700 bg-orange-100",
  SEVERE: "text-red-700 bg-red-100",
  NO_TRAVEL: "text-white bg-red-900",
};
