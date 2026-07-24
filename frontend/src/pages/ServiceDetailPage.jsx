/**
 * ServiceDetailPage (Section 11.6): health chip, total cases, list of past
 * Cases for the service (reuses CaseTable/CaseCard filtered by service).
 */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getService } from "../api/services.js";
import { listCases } from "../api/cases.js";
import AppShell from "../components/layout/AppShell.jsx";
import CaseTable from "../components/cases/CaseTable.jsx";
import CaseCard from "../components/cases/CaseCard.jsx";
import Skeleton from "../components/common/Skeleton.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import { Server } from "lucide-react";

export default function ServiceDetailPage() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [cases, setCases] = useState(null);

  useEffect(() => {
    getService(id).then(setService);
    listCases({ service: id, page_size: 50 }).then((data) => setCases(data.results ?? data));
  }, [id]);

  if (!service) {
    return (
      <AppShell>
        <Skeleton className="h-40 w-full" />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-4 flex items-center gap-2">
        <Server size={20} className="text-accent-primary" aria-hidden="true" />
        <h1 className="text-2xl font-semibold">{service.name}</h1>
      </div>
      <p className="mb-6 text-sm text-text-secondary">
        {service.open_case_count} open · {service.closed_case_count} closed investigations
      </p>

      {cases && cases.length === 0 && (
        <EmptyState title="This service has no investigation history" description="That's a good sign." />
      )}
      {cases && cases.length > 0 && (
        <div className="rounded-lg border border-border-subtle bg-surface p-2 md:p-4">
          <CaseTable cases={cases} />
          <div className="flex flex-col gap-2 md:hidden">
            {cases.map((item) => (
              <CaseCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
