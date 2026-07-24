/**
 * TimelinePanel - left column of the Investigation Room (Section 11.4).
 * Filter chips (All/Logs/Traces/Metrics/Deploys/Alerts) + vertical
 * chronological list. Clicking an entry highlights the matching Evidence
 * card in the center column via `onSelectEvidence`.
 */
import { useState } from "react";
import { History } from "lucide-react";

import EmptyState from "../common/EmptyState.jsx";
import Skeleton from "../common/Skeleton.jsx";
import TimelineItem from "./TimelineItem.jsx";

const FILTERS = ["all", "log", "trace", "metric", "deploy", "alert"];

export default function TimelinePanel({ timeline, loading, selectedEvidenceId, onSelectEvidence }) {
  const [filter, setFilter] = useState("all");

  const entries = timeline?.entries || [];
  const filtered = filter === "all" ? entries : entries.filter((entry) => entry.type === filter);

  return (
    <section aria-label="Timeline" className="flex h-full flex-col rounded-lg border border-border-subtle bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <History size={16} className="text-accent-primary" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Timeline</h2>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {FILTERS.map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-full border px-2.5 py-1 text-xs capitalize transition-colors ${
              filter === value ? "border-accent-primary bg-accent-primary/15 text-accent-primary" : "border-border-subtle text-text-secondary hover:text-text-primary"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((key) => (
              <Skeleton key={key} className="h-10 w-full" />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <EmptyState icon={History} title="No timeline events yet" description="Mark evidence relevant to sharpen the timeline, or wait for correlation to complete." />
        )}

        {!loading && filtered.length > 0 && (
          <ul aria-label="Timeline entries">
            {filtered.map((entry, index) => (
              <TimelineItem
                key={entry.evidence_id ?? `${entry.type}-${index}`}
                entry={entry}
                isActive={entry.evidence_id === selectedEvidenceId}
                onClick={() => entry.evidence_id && onSelectEvidence(entry.evidence_id)}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
