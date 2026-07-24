import client from "./client.js";

export const login = (username, password) => client.post("/auth/login/", { username, password }).then((r) => r.data);
export const logout = () => client.post("/auth/logout/").then((r) => r.data);
