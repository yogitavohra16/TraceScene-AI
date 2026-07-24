import client from "./client.js";

export const getSignozSettings = () => client.get("/settings/signoz/").then((r) => r.data);
export const updateSignozSettings = (payload) => client.put("/settings/signoz/", payload).then((r) => r.data);
export const testSignozConnection = () => client.post("/settings/signoz/test/").then((r) => r.data);
