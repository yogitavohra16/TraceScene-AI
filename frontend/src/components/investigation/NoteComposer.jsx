/**
 * NoteComposer - add-note textbox (Section 11.4/12).
 */
import { useState } from "react";

import { addNote } from "../../api/notes.js";
import { extractErrorMessage } from "../../api/client.js";
import { useToast } from "../../context/ToastContext.jsx";
import Button from "../common/Button.jsx";

export default function NoteComposer({ caseId, onNoteAdded }) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await addNote(caseId, content.trim());
      setContent("");
      onNoteAdded();
    } catch (error) {
      showToast(extractErrorMessage(error), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
      <label className="sr-only" htmlFor="note-composer">
        Add a note
      </label>
      <textarea
        id="note-composer"
        rows={2}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Add an observation…"
        className="flex-1 rounded-md border border-border-subtle bg-bg-primary px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
      />
      <Button type="submit" loading={submitting}>
        Add
      </Button>
    </form>
  );
}
