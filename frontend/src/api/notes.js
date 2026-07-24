import client from "./client.js";

export const listNotes = (caseId) => client.get(`/cases/${caseId}/notes/`).then((r) => r.data);
export const addNote = (caseId, content) => client.post(`/cases/${caseId}/notes/`, { content }).then((r) => r.data);
