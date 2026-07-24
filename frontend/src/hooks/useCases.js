/**
 * Fetches and filters the Case List (Section 11.3). Data-fetching lives
 * here, not inline in CaseListPage, per Section 42's coding standard.
 */
import { useCallback, useEffect, useState } from "react";

import { listCases } from "../api/cases.js";
import { extractErrorMessage } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";

export function useCases(filters) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listCases(filters);
      setCases(data.results ?? data);
    } catch (error) {
      showToast(extractErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { cases, loading, refresh };
}
