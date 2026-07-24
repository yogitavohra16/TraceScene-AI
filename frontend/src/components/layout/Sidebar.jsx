/**
 * Sidebar - persistent left navigation (Section 12/19).
 */
import { NavLink } from "react-router-dom";
import { FolderSearch, LayoutDashboard, Server, Settings } from "lucide-react";

const LINKS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/cases", label: "Cases", icon: FolderSearch },
  { to: "/services", label: "Services", icon: Server },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <nav aria-label="Primary" className="flex w-56 shrink-0 flex-col gap-1 border-r border-border-subtle bg-surface p-3">
      <div className="mb-4 flex items-center gap-2 px-2 py-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-primary/20 text-accent-primary">
          <FolderSearch size={16} aria-hidden="true" />
        </div>
        <span className="text-sm font-semibold">TraceScene AI</span>
      </div>
      {LINKS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
              isActive ? "bg-accent-primary/15 text-accent-primary" : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
            }`
          }
        >
          <Icon size={16} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
