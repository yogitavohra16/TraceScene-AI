import client from "./client.js";

export const listEvidence = (caseId) => client.get(`/cases/${caseId}/evidence/`).then((r) => r.data);
export const updateEvidenceRelevance = (evidenceId, relevance) =>
  client.patch(`/evidence/${evidenceId}/`, { relevance }).then((r) => r.data);
