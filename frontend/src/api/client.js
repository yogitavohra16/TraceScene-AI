/**
 * Shared axios instance. Every api/*.js module imports this instead of
 * calling axios directly, so the base URL and auth header logic live in
 * exactly one place (Appendix A: "no duplicated logic").
 */
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

const client = axios.create({ baseURL: BASE_URL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("tracescene_token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

/** Pulls the standard {error: {code, message, field}} shape (Section 23)
 * out of a failed axios response, falling back to a generic message. */
export function extractErrorMessage(error) {
  return error?.response?.data?.error?.message || "Something went wrong. Please try again.";
}

export default client;
