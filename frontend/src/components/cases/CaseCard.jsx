/**
 * CaseCard - mobile card rendering of a single Case (Section 11.3).
 */
import { Link } from "react-router-dom";

import ConfidenceRing from "../badges/ConfidenceRing.jsx";
import SeverityBadge from "../badges/SeverityBadge.jsx";
import StatusBadge from "../badges/StatusBadge.jsx";
import { formatDateTime } from "../../utils/formatDate.js";

export default function CaseCard({ item }) {
  return (
    <Link
      to={`/cases/${item.id}`}
      className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle bg-surface p-4 md:hidden"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">
          <span className="text-text-secondary">#{item.id}</span> {item.title}
        </p>
        <p className="mt-1 text-xs text-text-secondary">{item.service?.name} · {formatDateTime(item.created_at)}</p>
        <div className="mt-2 flex gap-1.5">
          <SeverityBadge severity={item.severity} />
          <StatusBadge status={item.status} />
        </div>
      </div>
      {item.confidence_score != null && <ConfidenceRing score={item.confidence_score} size={40} />}
    </Link>
  );
}
