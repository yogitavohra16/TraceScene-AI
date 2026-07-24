/**
 * NewCaseModal - manual Case creation (Section 11.5, FR-2). On submit,
 * creates the Case (which triggers correlation server-side) and redirects
 * to the Investigation Room.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createCase } from "../../api/cases.js";
import { extractErrorMessage } from "../../api/client.js";
import { useToast } from "../../context/ToastContext.jsx";
import { SEVERITY_OPTIONS } from "../../utils/constants.js";
import Button from "../common/Button.jsx";
import Dropdown from "../common/Dropdown.jsx";
import Modal from "../common/Modal.jsx";

export default function NewCaseModal({ services, onClose }) {
  const [title, setTitle] = useState("");
  const [serviceId, setServiceId] = useState(services[0]?.id || "");
  const [severity, setSeverity] = useState("medium");
  const [description, setDescription] = useState("");
  const [linkedAlertId, setLinkedAlertId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const created = await createCase({
        title,
        service: Number(serviceId),
        severity,
        description,
        linked_alert_id: linkedAlertId || null,
      });
      showToast("Case created - gathering evidence…", "success");
      navigate(`/cases/${created.id}`);
    } catch (error) {
      showToast(extractErrorMessage(error), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="New Case" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-xs text-text-secondary">
          Title
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-md border border-border-subtle bg-bg-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-secondary">
          Service
          <Dropdown
            label="Service"
            value={serviceId}
            onChange={setServiceId}
            options={services.map((service) => ({ value: service.id, label: service.name }))}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-secondary">
          Severity
          <Dropdown label="Severity" value={severity} onChange={setSeverity} options={SEVERITY_OPTIONS} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-secondary">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="rounded-md border border-border-subtle bg-bg-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-text-secondary">
          Linked Alert ID (optional)
          <input
            value={linkedAlertId}
            onChange={(event) => setLinkedAlertId(event.target.value)}
            className="rounded-md border border-border-subtle bg-bg-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
          />
        </label>
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Create Case
          </Button>
        </div>
      </form>
    </Modal>
  );
}
