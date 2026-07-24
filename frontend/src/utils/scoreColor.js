/** Maps a 0-100 confidence/correlation score to the semantic color tokens
 * from Section 14, so the same thresholds are used everywhere. */
export function confidenceLevel(score) {
  if (score == null) return "medium";
  if (score < 40) return "low";
  if (score <= 70) return "medium";
  return "high";
}

export function confidenceColorVar(score) {
  return `var(--confidence-${confidenceLevel(score)})`;
}
