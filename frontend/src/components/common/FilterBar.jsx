/**
 * FilterBar - reusable filter/search row (Section 11.3).
 * @param {{search:string,onSearchChange:Function,children:React.ReactNode}} props
 */
import { Search } from "lucide-react";

export default function FilterBar({ search, onSearchChange, children }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border-subtle bg-surface p-3">
      <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-md border border-border-subtle bg-bg-primary px-3 py-1.5">
        <Search size={14} className="text-text-secondary" aria-hidden="true" />
        <input
          type="search"
          aria-label="Search cases"
          placeholder="Search by title or ID..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
