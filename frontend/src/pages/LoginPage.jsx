/**
 * LoginPage - single-user token login (Section 11.1/36).
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderSearch } from "lucide-react";

import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { extractErrorMessage } from "../api/client.js";
import Button from "../components/common/Button.jsx";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (error) {
      showToast(extractErrorMessage(error), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl border border-border-subtle bg-surface p-6">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary/20 text-accent-primary">
            <FolderSearch size={20} aria-hidden="true" />
          </div>
          <h1 className="text-lg font-semibold">TraceScene AI</h1>
          <p className="text-xs text-text-secondary">Turn telemetry into an investigation, not a wall of dashboards.</p>
        </div>

        <label className="mb-3 flex flex-col gap-1 text-xs text-text-secondary">
          Username
          <input
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="rounded-md border border-border-subtle bg-bg-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
          />
        </label>
        <label className="mb-5 flex flex-col gap-1 text-xs text-text-secondary">
          Password
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-md border border-border-subtle bg-bg-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
          />
        </label>
        <Button type="submit" loading={submitting} className="w-full">
          Log in
        </Button>
      </form>
    </div>
  );
}
