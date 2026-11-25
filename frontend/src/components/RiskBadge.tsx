import type { RiskLevel } from "../types";
import { RISK_LABELS, RISK_TEXT_CLASSES } from "../utils/riskColors";

interface Props {
  level: RiskLevel;
  size?: "sm" | "md";
}

export function RiskBadge({ level, size = "md" }: Props) {
  const sizeClass = size === "sm" ? "text-xs px-1.5 py-0.5" : "text-sm px-2.5 py-1";
  return (
    <span className={`inline-block rounded-full font-semibold ${sizeClass} ${RISK_TEXT_CLASSES[level]}`}>
      {RISK_LABELS[level]}
    </span>
  );
}
