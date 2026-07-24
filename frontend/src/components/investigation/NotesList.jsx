/**
 * NotesList - free-text notes feed, newest first (Section 11.4/12).
 */
import { StickyNote } from "lucide-react";

import EmptyState from "../common/EmptyState.jsx";
import { formatDateTime } from "../../utils/formatDate.js";

export default function NotesList({ notes }) {
  if (!notes || notes.length === 0) {
    return <EmptyState icon={StickyNote} title="No notes yet" description="Add the first observation." />;
  }

  const sorted = [...notes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <ul className="flex flex-col gap-3">
      {sorted.map((note) => (
        <li key={note.id} className="rounded-lg border border-border-subtle bg-surface p-3">
          <p className="mb-1 text-xs text-text-secondary">
            {note.author?.username || "Unknown"} · {formatDateTime(note.created_at)}
          </p>
          <p className="text-sm text-text-primary">{note.content}</p>
        </li>
      ))}
    </ul>
  );
}
