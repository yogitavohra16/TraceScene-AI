/**
 * Polls `callback` every `intervalMs` until `stopCondition(latestResult)`
 * returns true (Section 35: "Polling used on open/investigating Cases to
 * refresh Evidence/Timeline every 5s until correlation completes").
 */
import { useEffect, useRef } from "react";

export function usePolling(callback, { intervalMs = 5000, enabled = true } = {}) {
  const savedCallback = useRef(callback);
  savedCallback.current = callback;

  useEffect(() => {
    if (!enabled) return undefined;
    const id = setInterval(() => savedCallback.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
