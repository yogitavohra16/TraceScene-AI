/**
 * Topbar - shows the signed-in user and a logout action.
 */
import { LogOut } from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";

export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 shrink-0 items-center justify-end gap-3 border-b border-border-subtle bg-surface px-5">
      {user && <span className="text-xs text-text-secondary">{user.username}</span>}
      <button
        onClick={logout}
        aria-label="Log out"
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
      >
        <LogOut size={14} aria-hidden="true" />
        Log out
      </button>
    </header>
  );
}
