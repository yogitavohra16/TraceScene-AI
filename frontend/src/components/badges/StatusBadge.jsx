/**
 * StatusBadge - colored badge for Open/Investigating/Closed (Section 12).
 */
import { STATUS_LABELS } from "../../utils/constants.js";

const TEXT_COLOR = {
  open: "text-status-open",
  investigating: "text-status-investigating",
  closed: "text-status-closed",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full border border-border-subtle bg-surface px-2 py-0.5 text-xs font-medium ${TEXT_COLOR[status] || "text-text-secondary"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
