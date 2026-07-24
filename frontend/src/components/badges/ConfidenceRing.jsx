/**
 * ConfidenceRing - circular progress indicator for a 0-100 confidence
 * score (Section 11.4). Color follows Section 14's thresholds: red <40,
 * amber 40-70, green >70. Animates fill on mount per Section 17, unless
 * prefers-reduced-motion is set (handled globally in index.css).
 */
import { confidenceColorVar } from "../../utils/scoreColor.js";

export default function ConfidenceRing({ score, size = 88 }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score ?? 0));
  const offset = circumference - (clamped / 100) * circumference;
  const color = confidenceColorVar(clamped);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--border-subtle)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease-out" }}
        />
      </svg>
      <span className="absolute text-lg font-semibold" style={{ color }}>
        {score == null ? "—" : Math.round(score)}
      </span>
    </div>
  );
}
