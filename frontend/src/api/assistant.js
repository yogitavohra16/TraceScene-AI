import client from "./client.js";

export const queryAssistant = (caseId, question) =>
  client.post(`/cases/${caseId}/assistant/query/`, { question }).then((r) => r.data);
