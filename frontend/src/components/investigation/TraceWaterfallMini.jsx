/**
 * TraceWaterfallMini - compact span visualization for trace-type evidence
 * (Section 11.4: "MVP shows span count + duration + service hops as a
 * compact bar" - the full waterfall is explicitly Post-MVP, Section 55).
 */
export default function TraceWaterfallMini({ metadata }) {
  const spanCount = metadata?.span_count ?? 1;
  const durationMs = metadata?.duration_ms ?? 0;
  const hopService = metadata?.service_name;

  return (
    <div className="mt-2 flex items-center gap-2 text-xs text-text-secondary">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-primary">
        <div className="h-full rounded-full bg-accent-primary" style={{ width: `${Math.min(100, (durationMs / 3000) * 100)}%` }} />
      </div>
      <span>{spanCount} spans</span>
      <span>· {durationMs}ms</span>
      {hopService && <span>· hop: {hopService}</span>}
    </div>
  );
}
