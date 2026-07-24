/**
 * SettingsPage (Section 11.7): SigNoz Connection card + Webhook
 * Configuration card with copy-to-clipboard.
 */
import { useEffect, useState } from "react";
import { Copy, Settings as SettingsIcon } from "lucide-react";

import { getSignozSettings, testSignozConnection, updateSignozSettings } from "../api/settings.js";
import { extractErrorMessage } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import AppShell from "../components/layout/AppShell.jsx";
import Button from "../components/common/Button.jsx";
import Skeleton from "../components/common/Skeleton.jsx";

export default function SettingsPage() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const { showToast } = useToast();
  const webhookUrl = `${(import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1")}/webhooks/signoz/`;

  useEffect(() => {
    getSignozSettings().then(setForm).catch((error) => showToast(extractErrorMessage(error), "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await updateSignozSettings(form);
      setForm(updated);
      showToast("Settings saved.", "success");
    } catch (error) {
      showToast(extractErrorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const result = await testSignozConnection();
      showToast(result.message, result.ok ? "success" : "error");
    } catch (error) {
      showToast(extractErrorMessage(error), "error");
    } finally {
      setTesting(false);
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    showToast("Webhook URL copied.", "success");
  };

  if (!form) {
    return (
      <AppShell>
        <Skeleton className="h-64 w-full" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-4 flex items-center gap-2">
        <SettingsIcon size={20} className="text-accent-primary" aria-hidden="true" />
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      <form onSubmit={handleSave} className="mb-6 flex max-w-lg flex-col gap-3 rounded-lg border border-border-subtle bg-surface p-4">
        <h2 className="text-lg font-semibold">SigNoz Connection</h2>
        <label className="flex flex-col gap-1 text-xs text-text-secondary">
          Base URL
          <input
            value={form.base_url}
            onChange={(event) => setForm({ ...form, base_url: event.target.value })}
            className="rounded-md border border-border-subtle bg-bg-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-secondary">
          API Key / Token
          <input
            type="password"
            value={form.api_key}
            onChange={(event) => setForm({ ...form, api_key: event.target.value })}
            className="rounded-md border border-border-subtle bg-bg-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
          />
        </label>
        <div className="flex gap-2">
          <Button type="submit" loading={saving}>
            Save
          </Button>
          <Button type="button" variant="secondary" loading={testing} onClick={handleTest}>
            Test Connection
          </Button>
        </div>
      </form>

      <div className="max-w-lg rounded-lg border border-border-subtle bg-surface p-4">
        <h2 className="mb-2 text-lg font-semibold">Webhook Configuration</h2>
        <p className="mb-2 text-xs text-text-secondary">Point a SigNoz Alert Rule's webhook channel at this URL:</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-md border border-border-subtle bg-bg-primary px-3 py-2 text-xs">{webhookUrl}</code>
          <button onClick={copyWebhookUrl} aria-label="Copy webhook URL" className="rounded-md border border-border-subtle p-2 text-text-secondary hover:text-text-primary">
            <Copy size={14} aria-hidden="true" />
          </button>
        </div>
        <label className="mt-3 flex flex-col gap-1 text-xs text-text-secondary">
          Webhook secret (sent as X-Signoz-Webhook-Secret header)
          <input
            value={form.webhook_secret}
            onChange={(event) => setForm({ ...form, webhook_secret: event.target.value })}
            className="rounded-md border border-border-subtle bg-bg-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
          />
        </label>
      </div>
    </AppShell>
  );
}
