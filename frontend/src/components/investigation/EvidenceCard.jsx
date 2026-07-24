/**
 * EvidenceCard - source badge, timestamp, raw snippet (collapsible),
 * correlation score, relevance toggle (Section 11.4/12). `raw_content` is
 * always rendered as plain text, never dangerouslySetInnerHTML, per
 * Section 36's XSS-prevention rule.
 */
import { useState } from "react";
import { Check, X } from "lucide-react";

import { updateEvidenceRelevance } from "../../api/evidence.js";
import { extractErrorMessage } from "../../api/client.js";
import { useToast } from "../../context/ToastContext.jsx";
import { formatDateTime } from "../../utils/formatDate.js";
import { confidenceColorVar } from "../../utils/scoreColor.js";
import { SOURCE_TYPE_ICONS } from "../../utils/constants.js";
import TraceWaterfallMini from "./TraceWaterfallMini.jsx";

export default function EvidenceCard({ item, isHighlighted, onRelevanceChanged, forwardedRef }) {
  const [expanded, setExpanded] = useState(false);
  const [relevance, setRelevance] = useState(item.relevance);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const Icon = SOURCE_TYPE_ICONS[item.source_type] || SOURCE_TYPE_ICONS.log;
  const scoreColor = confidenceColorVar(item.correlation_score);

  const setRelevanceValue = async (value) => {
    const next = relevance === value ? "unreviewed" : value;
    setSaving(true);
    try {
      await updateEvidenceRelevance(item.id, next);
      setRelevance(next);
      onRelevanceChanged?.();
    } catch (error) {
      showToast(extractErrorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <li
      ref={forwardedRef}
      className={`rounded-lg border p-3 transition-shadow ${isHighlighted ? "animate-pulse-new border-accent-primary" : "border-border-subtle"} bg-surface`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-bg-primary text-text-secondary">
            <Icon size={13} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-medium capitalize text-text-primary">{item.source_type}</p>
            <p className="text-xs text-text-secondary">{formatDateTime(item.event_timestamp)}</p>
          </div>
        </div>
        <span className="text-sm font-semibold" style={{ color: scoreColor }}>
          {Math.round(item.correlation_score)}
        </span>
      </div>

      <button
        onClick={() => setExpanded((prev) => !prev)}
        className={`mt-2 w-full text-left font-mono text-xs text-text-primary ${expanded ? "" : "line-clamp-2"}`}
      >
        {item.raw_content}
      </button>

      {item.source_type === "trace" && <TraceWaterfallMini metadata={item.metadata} />}

      <div className="mt-3 flex items-center gap-2">
        <button
          disabled={saving}
          onClick={() => setRelevanceValue("relevant")}
          aria-pressed={relevance === "relevant"}
          className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs ${
            relevance === "relevant" ? "border-severity-low text-severity-low" : "border-border-subtle text-text-secondary hover:text-text-primary"
          }`}
        >
          <Check size={12} aria-hidden="true" /> Relevant
        </button>
        <button
          disabled={saving}
          onClick={() => setRelevanceValue("irrelevant")}
          aria-pressed={relevance === "irrelevant"}
          className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xs ${
            relevance === "irrelevant" ? "border-severity-critical text-severity-critical" : "border-border-subtle text-text-secondary hover:text-text-primary"
          }`}
        >
          <X size={12} aria-hidden="true" /> Irrelevant
        </button>
      </div>
    </li>
  );
}
