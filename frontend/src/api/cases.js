import client from "./client.js";

export const listCases = (params) => client.get("/cases/", { params }).then((r) => r.data);
export const getCase = (id) => client.get(`/cases/${id}/`).then((r) => r.data);
export const createCase = (payload) => client.post("/cases/", payload).then((r) => r.data);
export const updateCase = (id, payload) => client.patch(`/cases/${id}/`, payload).then((r) => r.data);
export const closeCase = (id, resolutionSummary) =>
  client.post(`/cases/${id}/close/`, { resolution_summary: resolutionSummary }).then((r) => r.data);
export const getTimeline = (id) => client.get(`/cases/${id}/timeline/`).then((r) => r.data);
