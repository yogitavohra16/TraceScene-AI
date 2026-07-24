/**
 * Button - Primary/secondary/danger/ghost variants (Section 12).
 * @param {"primary"|"secondary"|"danger"|"ghost"} variant
 */
const VARIANT_CLASSES = {
  primary: "bg-accent-primary text-white hover:bg-accent-primary-hover",
  secondary: "bg-surface-elevated text-text-primary border border-border-subtle hover:bg-surface",
  danger: "bg-severity-critical text-white hover:opacity-90",
  ghost: "bg-transparent text-text-secondary hover:text-text-primary",
};

export default function Button({ variant = "primary", loading = false, disabled, children, className = "", ...rest }) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />}
      {children}
    </button>
  );
}
