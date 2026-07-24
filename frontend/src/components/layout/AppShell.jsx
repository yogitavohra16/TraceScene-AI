/**
 * AppShell - sidebar + topbar + content slot layout wrapper (Section 12).
 */
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

export default function AppShell({ children }) {
  return (
    <div className="flex h-screen bg-bg-primary text-text-primary">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
