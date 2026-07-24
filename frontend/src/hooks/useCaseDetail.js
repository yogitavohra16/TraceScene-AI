/**
 * Loads everything the Investigation Room needs (Section 11.4): case
 * header, evidence, timeline, finding, notes - each independently, so a
 * slow panel doesn't block the others from rendering (Section 35).
 * Polls evidence/timeline/finding while the case is still investigating.
 */
import { useCallback, useEffect, useState } from "react";

import { getCase } from "../api/cases.js";
import { extractErrorMessage } from "../api/client.js";
import { listEvidence } from "../api/evidence.js";
import { getFinding } from "../api/findings.js";
import { getTimeline } from "../api/cases.js";
import { listNotes } from "../api/notes.js";
import { useToast } from "../context/ToastContext.jsx";
import { usePolling } from "./usePolling.js";

export function useCaseDetail(caseId) {
  const [caseData, setCaseData] = useState(null);
  const [evidence, setEvidence] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [finding, setFinding] = useState(null);
  const [notes, setNotes] = useState(null);
  const [loadingHeader, setLoadingHeader] = useState(true);
  const { showToast } = useToast();

  const loadHeader = useCallback(async () => {
    setLoadingHeader(true);
    try {
      setCaseData(await getCase(caseId));
    } catch (error) {
      showToast(extractErrorMessage(error), "error");
    } finally {
      setLoadingHeader(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const loadEvidence = useCallback(async () => {
    try {
      const data = await listEvidence(caseId);
      setEvidence(data.results ?? data);
    } catch (error) {
      showToast(extractErrorMessage(error), "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const loadTimeline = useCallback(async () => {
    try {
      setTimeline(await getTimeline(caseId));
    } catch (error) {
      showToast(extractErrorMessage(error), "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const loadFinding = useCallback(async () => {
    try {
      setFinding(await getFinding(caseId));
    } catch {
      setFinding(null); // 404 just means "not generated yet" (Section 34)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const loadNotes = useCallback(async () => {
    try {
      setNotes(await listNotes(caseId));
    } catch (error) {
      showToast(extractErrorMessage(error), "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const refreshAll = useCallback(() => {
    loadHeader();
    loadEvidence();
    loadTimeline();
    loadFinding();
    loadNotes();
  }, [loadHeader, loadEvidence, loadTimeline, loadFinding, loadNotes]);

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  const stillInvestigating = caseData && caseData.status !== "closed";
  usePolling(
    () => {
      loadEvidence();
      loadTimeline();
      loadFinding();
      loadHeader();
    },
    { intervalMs: 5000, enabled: !!stillInvestigating }
  );

  return {
    caseData,
    evidence,
    timeline,
    finding,
    notes,
    loadingHeader,
    refreshAll,
    loadEvidence,
    loadFinding,
    loadNotes,
  };
}
