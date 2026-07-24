/**
 * FindingPanel - hypothesis + confidence ring + accept/reject actions
 * (Section 11.4). Supporting evidence chips link back to the Evidence
 * Panel (Section 34: shows "Finding will appear..." empty state).
 */
import { Lightbulb } from "lucide-react";

import { acceptFinding, rejectFinding, regenerateFinding } from "../../api/findings.js";
import { extractErrorMessage } from "../../api/client.js";
import { useToast } from "../../context/ToastContext.jsx";
import ConfidenceRing from "../badges/ConfidenceRing.jsx";
import Button from "../common/Button.jsx";
import EmptyState from "../common/EmptyState.jsx";

export default function FindingPanel({ caseId, finding, onSelectEvidence, onFindingChanged }) {
  const { showToast } = useToast();

  const handleAccept = async () => {
    try {
      await acceptFinding(finding.id);
      showToast("Finding accepted.", "success");
      onFindingChanged();
    } catch (error) {
      showToast(extractErrorMessage(error), "error");
    }
  };

  const handleReject = async () => {
    try {
      await rejectFinding(finding.id);
      showToast("Finding rejected.", "success");
      onFindingChanged();
    } catch (error) {
      showToast(extractErrorMessage(error), "error");
    }
  };

  const handleRegenerate = async () => {
    try {
      await regenerateFinding(caseId);
      showToast("Finding regenerated from current evidence.", "success");
      onFindingChanged();
    } catch (error) {
      showToast(extractErrorMessage(error), "error");
    }
  };

  if (!finding) {
    return (
      <EmptyState
        icon={Lightbulb}
        title="Finding will appear once evidence correlation completes"
        description="This usually takes a few seconds."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <ConfidenceRing score={finding.confidence_score} />
        <div>
          <p className="text-xs uppercase tracking-wide text-text-secondary">Confidence</p>
          <p className="text-xs text-text-secondary capitalize">Status: {finding.status}</p>
        </div>
      </div>

      <p className="text-sm text-text-primary">{finding.hypothesis}</p>

      {finding.supporting_evidence_ids?.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs text-text-secondary">Supporting evidence</p>
          <div className="flex flex-wrap gap-1.5">
            {finding.supporting_evidence_ids.map((evidenceId) => (
              <button
                key={evidenceId}
                onClick={() => onSelectEvidence(evidenceId)}
                className="rounded-full border border-border-subtle px-2 py-0.5 text-xs text-accent-primary hover:bg-accent-primary/10"
              >
                #{evidenceId}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={handleAccept} disabled={finding.status === "accepted"}>
          Accept Finding
        </Button>
        <Button variant="ghost" onClick={handleReject} disabled={finding.status === "rejected"}>
          Reject Finding
        </Button>
        <Button variant="ghost" onClick={handleRegenerate}>
          Regenerate
        </Button>
      </div>
    </div>
  );
}
