import client from "./client.js";

export const getFinding = (caseId) => client.get(`/cases/${caseId}/finding/`).then((r) => r.data);
export const regenerateFinding = (caseId) => client.post(`/cases/${caseId}/finding/regenerate/`).then((r) => r.data);
export const acceptFinding = (findingId) => client.post(`/findings/${findingId}/accept/`).then((r) => r.data);
export const rejectFinding = (findingId) => client.post(`/findings/${findingId}/reject/`).then((r) => r.data);
