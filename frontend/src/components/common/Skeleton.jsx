/**
 * Skeleton - loading placeholder block matching the shape of the eventual
 * content (Section 35: "never a generic spinner for primary content areas").
 */
export default function Skeleton({ className = "h-4 w-full" }) {
  return <div className={`skeleton animate-shimmer rounded-md ${className}`} aria-hidden="true" />;
}
