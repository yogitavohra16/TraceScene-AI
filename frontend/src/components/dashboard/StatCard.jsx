/**
 * StatCard - dashboard stat tile (Section 12). Every number shown maps to
 * a decision the user needs to make (Section 13) - no vanity KPIs.
 */
export default function StatCard({ icon: Icon, label, value, accent = "text-text-primary" }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface p-4 animate-fade-in-up">
      {Icon && (
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-bg-primary text-accent-primary">
          <Icon size={16} aria-hidden="true" />
        </div>
      )}
      <div>
        <p className={`text-xl font-semibold ${accent}`}>{value}</p>
        <p className="text-xs text-text-secondary">{label}</p>
      </div>
    </div>
  );
}
