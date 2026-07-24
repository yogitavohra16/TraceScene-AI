/**
 * EvidencePanel - center column of the Investigation Room (Section 11.4).
 * Renders a card per Evidence item, handles the three empty-state variants
 * from Section 34 (still gathering / nothing above threshold / no evidence).
 */
import { useRef } from "react";
import { FileSearch } from "lucide-react";

import EmptyState from "../common/EmptyState.jsx";
import Skeleton from "../common/Skeleton.jsx";
import EvidenceCard from "./EvidenceCard.jsx";

export default function EvidencePanel({ evidence, loading, isGathering, selectedEvidenceId, onRelevanceChanged }) {
  const cardRefs = useRef({});

  if (loading) {
    return (
      <section aria-label="Evidence" className="flex h-full flex-col rounded-lg border border-border-subtle bg-surface p-4">
        <h2 className="mb-3 text-lg font-semibold">Evidence</h2>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-24 w-full" />
          ))}
        </div>
      </section>
    );
  }

  if (isGathering) {
    return (
      <section aria-label="Evidence" className="flex h-full flex-col rounded-lg border border-border-subtle bg-surface p-4">
        <h2 className="mb-3 text-lg font-semibold">Evidence</h2>
        <p className="mb-3 text-xs text-text-secondary">Gathering evidence from SigNoz…</p>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-24 w-full" />
          ))}
        </div>
      </section>
    );
  }

  if (!evidence || evidence.length === 0) {
    return (
      <section aria-label="Evidence" className="flex h-full flex-col rounded-lg border border-border-subtle bg-surface p-4">
        <h2 className="mb-3 text-lg font-semibold">Evidence</h2>
        <EmptyState
          icon={FileSearch}
          title="No strongly correlated evidence found in this window"
          description="Try widening the correlation time window in Settings, or check back shortly."
        />
      </section>
    );
  }

  return (
    <section aria-label="Evidence" className="flex h-full flex-col rounded-lg border border-border-subtle bg-surface p-4">
      <h2 className="mb-3 text-lg font-semibold">Evidence ({evidence.length})</h2>
      <ul className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {evidence.map((item) => (
          <EvidenceCard
            key={item.id}
            item={item}
            isHighlighted={item.id === selectedEvidenceId}
            forwardedRef={(node) => {
              cardRefs.current[item.id] = node;
              if (item.id === selectedEvidenceId && node) node.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }}
            onRelevanceChanged={onRelevanceChanged}
          />
        ))}
      </ul>
    </section>
  );
}
