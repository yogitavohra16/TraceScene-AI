/**
 * TimelineItem - single timeline entry with icon, time, summary, relevance
 * (Section 12/11.4). Larger dot for the "key evidence" item (Section 30).
 */
import { formatTime } from "../../utils/formatDate.js";
import { SOURCE_TYPE_ICONS } from "../../utils/constants.js";

export default function TimelineItem({ entry, onClick, isActive }) {
  const Icon = SOURCE_TYPE_ICONS[entry.type] || SOURCE_TYPE_ICONS.log;

  return (
    <li className="relative flex gap-3 pb-6 pl-1 last:pb-0">
      <svg width="2" height="100%" className="absolute left-[15px] top-6 -z-10" aria-hidden="true">
        <line x1="1" y1="0" x2="1" y2="9999" stroke="var(--border-subtle)" strokeWidth="2" className="draw-line" />
      </svg>
      <button
        onClick={onClick}
        aria-label={`View evidence: ${entry.summary}`}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
          entry.is_key_evidence ? "h-9 w-9 border-accent-primary bg-accent-primary/20 text-accent-primary" : "border-border-subtle bg-surface text-text-secondary"
        }`}
      >
        <Icon size={14} aria-hidden="true" />
      </button>
      <button onClick={onClick} className={`flex-1 rounded-md px-2 py-1 text-left ${isActive ? "bg-surface-elevated" : ""}`}>
        <p className="text-xs text-text-secondary">{formatTime(entry.timestamp)}</p>
        <p className="text-sm text-text-primary">{entry.summary}</p>
      </button>
    </li>
  );
}
