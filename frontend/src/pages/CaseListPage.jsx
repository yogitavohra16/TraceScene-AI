/**
 * CaseListPage - Case List (Section 11.3): filter/search/sort, New Case
 * button that opens NewCaseModal.
 */
import { useEffect, useState } from "react";
import { FolderSearch, Plus } from "lucide-react";

import { useCases } from "../hooks/useCases.js";
import { useDebounce } from "../hooks/useDebounce.js";
import { listServices } from "../api/services.js";
import AppShell from "../components/layout/AppShell.jsx";
import CaseTable from "../components/cases/CaseTable.jsx";
import CaseCard from "../components/cases/CaseCard.jsx";
import NewCaseModal from "../components/cases/NewCaseModal.jsx";
import FilterBar from "../components/common/FilterBar.jsx";
import Dropdown from "../components/common/Dropdown.jsx";
import Button from "../components/common/Button.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import Skeleton from "../components/common/Skeleton.jsx";
import { SEVERITY_OPTIONS, STATUS_OPTIONS } from "../utils/constants.js";

export default function CaseListPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [showNewCase, setShowNewCase] = useState(false);
  const [services, setServices] = useState([]);

  const debouncedSearch = useDebounce(search, 300);
  const { cases, loading, refresh } = useCases({ search: debouncedSearch, status, severity });

  useEffect(() => {
    listServices().then((data) => setServices(data.results ?? data));
  }, []);

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cases</h1>
        <Button onClick={() => setShowNewCase(true)}>
          <Plus size={15} aria-hidden="true" /> New Case
        </Button>
      </div>

      <div className="mb-4">
        <FilterBar search={search} onSearchChange={setSearch}>
          <Dropdown label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} includeAll allLabel="All statuses" />
          <Dropdown label="Severity" value={severity} onChange={setSeverity} options={SEVERITY_OPTIONS} includeAll allLabel="All severities" />
        </FilterBar>
      </div>

      {loading && (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-14 w-full" />
          ))}
        </div>
      )}

      {!loading && cases.length === 0 && (
        <EmptyState
          icon={FolderSearch}
          title="No investigations yet"
          description="Create your first case or connect a SigNoz alert."
          action={<Button onClick={() => setShowNewCase(true)}>New Case</Button>}
        />
      )}

      {!loading && cases.length > 0 && (
        <div className="rounded-lg border border-border-subtle bg-surface p-2 md:p-4">
          <CaseTable cases={cases} />
          <div className="flex flex-col gap-2 md:hidden">
            {cases.map((item) => (
              <CaseCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {showNewCase && (
        <NewCaseModal
          services={services}
          onClose={() => {
            setShowNewCase(false);
            refresh();
          }}
        />
      )}
    </AppShell>
  );
}
