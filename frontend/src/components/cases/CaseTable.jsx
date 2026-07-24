/**
 * CaseTable - desktop table rendering of the Case List (Section 11.3).
 * Swaps for CaseCard on narrow screens (handled by the page via CSS).
 */
import { useNavigate } from "react-router-dom";

import ConfidenceRing from "../badges/ConfidenceRing.jsx";
import SeverityBadge from "../badges/SeverityBadge.jsx";
import StatusBadge from "../badges/StatusBadge.jsx";
import { formatDateTime } from "../../utils/formatDate.js";

export default function CaseTable({ cases }) {
  const navigate = useNavigate();

  return (
    <table className="hidden w-full text-left text-sm md:table">
      <thead>
        <tr className="border-b border-border-subtle text-xs text-text-secondary">
          <th className="py-2 pr-3 font-medium">Case</th>
          <th className="py-2 pr-3 font-medium">Service</th>
          <th className="py-2 pr-3 font-medium">Severity</th>
          <th className="py-2 pr-3 font-medium">Status</th>
          <th className="py-2 pr-3 font-medium">Confidence</th>
          <th className="py-2 pr-3 font-medium">Created</th>
          <th className="py-2 pr-3 font-medium">Assigned</th>
        </tr>
      </thead>
      <tbody>
        {cases.map((item) => (
          <tr
            key={item.id}
            onClick={() => navigate(`/cases/${item.id}`)}
            className="cursor-pointer border-b border-border-subtle transition-colors hover:bg-surface-elevated"
          >
            <td className="py-3 pr-3">
              <span className="text-text-secondary">#{item.id}</span> {item.title}
            </td>
            <td className="py-3 pr-3 text-text-secondary">{item.service?.name}</td>
            <td className="py-3 pr-3">
              <SeverityBadge severity={item.severity} />
            </td>
            <td className="py-3 pr-3">
              <StatusBadge status={item.status} />
            </td>
            <td className="py-3 pr-3">
              {item.confidence_score != null ? <ConfidenceRing score={item.confidence_score} size={36} /> : <span className="text-text-secondary">—</span>}
            </td>
            <td className="py-3 pr-3 text-text-secondary">{formatDateTime(item.created_at)}</td>
            <td className="py-3 pr-3 text-text-secondary">{item.assigned_to?.username || "Unassigned"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
