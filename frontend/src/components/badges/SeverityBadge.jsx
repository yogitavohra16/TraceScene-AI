/**
 * SeverityBadge - colored badge for Low/Medium/High/Critical (Section 12).
 * Pairs color with a text label, never color alone (Section 18 a11y rule).
 */
import { SEVERITY_LABELS } from "../../utils/constants.js";

const DOT_COLOR = {
  low: "bg-severity-low",
  medium: "bg-severity-medium",
  high: "bg-severity-high",
  critical: "bg-severity-critical",
};

export default function SeverityBadge({ severity }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface px-2 py-0.5 text-xs font-medium text-text-primary">
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_COLOR[severity] || "bg-text-secondary"}`} aria-hidden="true" />
      {SEVERITY_LABELS[severity] || severity}
    </span>
  );
}
