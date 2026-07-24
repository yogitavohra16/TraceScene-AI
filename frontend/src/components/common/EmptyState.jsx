/**
 * EmptyState - reusable icon + message + optional CTA block (Section 34).
 */
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-subtle px-6 py-10 text-center">
      {Icon && <Icon size={28} className="text-text-secondary" aria-hidden="true" />}
      <p className="text-sm font-medium text-text-primary">{title}</p>
      {description && <p className="max-w-xs text-xs text-text-secondary">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
