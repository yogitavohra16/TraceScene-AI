/**
 * Icon + color maps (Sections 14/16). Centralized here so every badge/
 * timeline component references the same mapping instead of re-declaring
 * it (Appendix A: "no duplicated logic").
 */
import { Activity, AlertTriangle, FileText, GitBranch, Rocket } from "lucide-react";

export const SOURCE_TYPE_ICONS = {
  log: FileText,
  trace: GitBranch,
  metric: Activity,
  deploy: Rocket,
  alert: AlertTriangle,
  cluster: Activity,
};

export const SEVERITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const STATUS_LABELS = {
  open: "Open",
  investigating: "Investigating",
  closed: "Closed",
};

export const SEVERITY_OPTIONS = ["low", "medium", "high", "critical"];
export const STATUS_OPTIONS = ["open", "investigating", "closed"];
