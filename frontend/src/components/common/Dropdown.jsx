/**
 * Select - generic labeled dropdown form control (Section 12).
 */
export default function Dropdown({ label, value, onChange, options, includeAll = false, allLabel = "All" }) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-text-secondary">
      {label && <span className="sr-only">{label}</span>}
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-border-subtle bg-bg-primary px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
      >
        {includeAll && <option value="">{allLabel}</option>}
        {options.map((option) => (
          <option key={option.value ?? option} value={option.value ?? option}>
            {option.label ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}
