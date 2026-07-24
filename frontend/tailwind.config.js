/**
 * Tailwind theme extension. Every color here is a semantic alias for a CSS
 * custom property defined in src/index.css (Section 14 of the PRD), so
 * components use classes like `bg-surface` / `text-secondary` instead of
 * raw hex values.
 */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "bg-primary": "var(--bg-primary)",
        surface: "var(--bg-surface)",
        "surface-elevated": "var(--bg-surface-elevated)",
        "border-subtle": "var(--border-subtle)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "accent-primary": "var(--accent-primary)",
        "accent-primary-hover": "var(--accent-primary-hover)",
        "severity-low": "var(--severity-low)",
        "severity-medium": "var(--severity-medium)",
        "severity-high": "var(--severity-high)",
        "severity-critical": "var(--severity-critical)",
        "confidence-low": "var(--confidence-low)",
        "confidence-medium": "var(--confidence-medium)",
        "confidence-high": "var(--confidence-high)",
        "status-open": "var(--status-open)",
        "status-investigating": "var(--status-investigating)",
        "status-closed": "var(--status-closed)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      keyframes: {
        "fade-in-up": { "0%": { opacity: 0, transform: "translateY(6px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        "pulse-new": { "0%,100%": { boxShadow: "0 0 0 0 rgba(91,140,255,0.5)" }, "50%": { boxShadow: "0 0 0 6px rgba(91,140,255,0)" } },
        "ring-fill": { "0%": { strokeDashoffset: "283" }, "100%": { strokeDashoffset: "var(--ring-offset, 0)" } },
        shimmer: { "0%": { backgroundPosition: "-400px 0" }, "100%": { backgroundPosition: "400px 0" } },
        "modal-scale-in": { "0%": { opacity: 0, transform: "scale(0.96)" }, "100%": { opacity: 1, transform: "scale(1)" } },
      },
      animation: {
        "fade-in-up": "fade-in-up 200ms ease-out",
        "pulse-new": "pulse-new 1200ms ease-in-out 2",
        shimmer: "shimmer 1500ms infinite linear",
        "modal-scale-in": "modal-scale-in 150ms ease-out",
      },
    },
  },
  plugins: [],
};
