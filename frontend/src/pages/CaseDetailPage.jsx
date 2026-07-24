/**
 * CaseDetailPage - "Investigation Room" (Section 11.4), the signature
 * screen. Three-column layout: Timeline | Evidence | Finding/Notes/
 * Assistant tabs. Header bar spans full width with inline-editable title,
 * status dropdown, and Close/Export actions.
 */
import { useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, Gauge, Sparkles, StickyNote } from "lucide-react";

import { useCaseDetail } from "../hooks/useCaseDetail.js";
import { closeCase, updateCase } from "../api/cases.js";
import { extractErrorMessage } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import AppShell from "../components/layout/AppShell.jsx";
import Button from "../components/common/Button.jsx";
import Modal from "../components/common/Modal.jsx";
import Skeleton from "../components/common/Skeleton.jsx";
import Tabs from "../components/common/Tabs.jsx";
import SeverityBadge from "../components/badges/SeverityBadge.jsx";
import StatusBadge from "../components/badges/StatusBadge.jsx";
import TimelinePanel from "../components/investigation/TimelinePanel.jsx";
import EvidencePanel from "../components/investigation/EvidencePanel.jsx";
import FindingPanel from "../components/investigation/FindingPanel.jsx";
import NotesList from "../components/investigation/NotesList.jsx";
import NoteComposer from "../components/investigation/NoteComposer.jsx";
import AssistantChat from "../components/investigation/AssistantChat.jsx";
import { STATUS_OPTIONS } from "../utils/constants.js";

const TABS = [
  { id: "finding", label: "Finding", icon: Gauge },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "assistant", label: "Assistant", icon: Sparkles },
];

export default function CaseDetailPage() {
  const { id } = useParams();
  const { caseData, evidence, timeline, finding, notes, loadingHeader, refreshAll, loadEvidence, loadFinding, loadNotes } = useCaseDetail(id);
  const [activeTab, setActiveTab] = useState("finding");
  const [selectedEvidenceId, setSelectedEvidenceId] = useState(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [closing, setClosing] = useState(false);
  const { showToast } = useToast();

  const handleStatusChange = async (status) => {
    try {
      await updateCase(id, { status });
      refreshAll();
    } catch (error) {
      showToast(extractErrorMessage(error), "error");
    }
  };

  const handleClose = async (event) => {
    event.preventDefault();
    setClosing(true);
    try {
      await closeCase(id, resolutionSummary);
      showToast("Case closed.", "success");
      setShowCloseModal(false);
      refreshAll();
    } catch (error) {
      showToast(extractErrorMessage(error), "error");
    } finally {
      setClosing(false);
    }
  };

  if (loadingHeader && !caseData) {
    return (
      <AppShell>
        <Skeleton className="mb-4 h-16 w-full" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </AppShell>
    );
  }

  if (!caseData) return null;

  const isGatheringEvidence = caseData.status === "investigating" && (!evidence || evidence.length === 0);

  return (
    <AppShell>
      {/* Header bar (Section 11.4) */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-subtle bg-surface p-4">
        <div>
          <p className="text-xs text-text-secondary">
            #{caseData.id} · {caseData.service?.name}
          </p>
          <h1 className="text-2xl font-semibold">{caseData.title}</h1>
          <div className="mt-1.5 flex gap-1.5">
            <SeverityBadge severity={caseData.severity} />
            <StatusBadge status={caseData.status} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            aria-label="Case status"
            value={caseData.status}
            onChange={(event) => handleStatusChange(event.target.value)}
            disabled={caseData.status === "closed"}
            className="rounded-md border border-border-subtle bg-bg-primary px-2 py-1.5 text-sm capitalize text-text-primary focus:outline-none"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <Button variant="secondary" onClick={() => window.print()}>
            Export
          </Button>
          {caseData.status !== "closed" && (
            <Button variant="danger" onClick={() => setShowCloseModal(true)}>
              <CheckCircle2 size={15} aria-hidden="true" /> Close Case
            </Button>
          )}
        </div>
      </div>

      {/* Three-column Investigation Room */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TimelinePanel timeline={timeline} loading={!timeline} selectedEvidenceId={selectedEvidenceId} onSelectEvidence={setSelectedEvidenceId} />
        </div>
        <div className="lg:col-span-1">
          <EvidencePanel
            evidence={evidence}
            loading={!evidence}
            isGathering={isGatheringEvidence}
            selectedEvidenceId={selectedEvidenceId}
            onRelevanceChanged={() => {
              loadFinding();
              refreshAll();
            }}
          />
        </div>
        <div className="lg:col-span-1 rounded-lg border border-border-subtle bg-surface p-4">
          <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
          <div className="mt-4 h-[26rem] overflow-y-auto">
            {activeTab === "finding" && (
              <FindingPanel caseId={id} finding={finding} onSelectEvidence={setSelectedEvidenceId} onFindingChanged={loadFinding} />
            )}
            {activeTab === "notes" && (
              <div>
                <NotesList notes={notes} />
                <NoteComposer caseId={id} onNoteAdded={loadNotes} />
              </div>
            )}
            {activeTab === "assistant" && <AssistantChat caseId={id} onSelectEvidence={setSelectedEvidenceId} />}
          </div>
        </div>
      </div>

      {showCloseModal && (
        <Modal
          title="Close Case"
          onClose={() => setShowCloseModal(false)}
          footer={null}
        >
          <form onSubmit={handleClose} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-xs text-text-secondary">
              Resolution summary
              <textarea
                required
                rows={4}
                value={resolutionSummary}
                onChange={(event) => setResolutionSummary(event.target.value)}
                placeholder="What was the root cause, and how was it resolved?"
                className="rounded-md border border-border-subtle bg-bg-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowCloseModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" loading={closing}>
                Close Case
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AppShell>
  );
}
