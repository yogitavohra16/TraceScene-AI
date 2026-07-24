import client from "./client.js";

export const listServices = () => client.get("/services/").then((r) => r.data);
export const getService = (id) => client.get(`/services/${id}/`).then((r) => r.data);
