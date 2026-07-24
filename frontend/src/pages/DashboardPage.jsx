/**
 * DashboardPage - Home screen (Section 11.2): active cases summary, recent
 * findings, service health strip.
 */
import { useEffect, useState } from "react";
import { FolderSearch, Lightbulb, Server, TrendingUp } from "lucide-react";

import { listCases } from "../api/cases.js";
import { listServices } from "../api/services.js";
import { extractErrorMessage } from "../api/client.js";
import { useToast } from "../context/ToastContext.jsx";
import AppShell from "../components/layout/AppShell.jsx";
import StatCard from "../components/dashboard/StatCard.jsx";
import ServiceHealthStrip from "../components/dashboard/ServiceHealthStrip.jsx";
import CaseTable from "../components/cases/CaseTable.jsx";
import CaseCard from "../components/cases/CaseCard.jsx";
import Skeleton from "../components/common/Skeleton.jsx";
import EmptyState from "../components/common/EmptyState.jsx";

export default function DashboardPage() {
  const [cases, setCases] = useState(null);
  const [services, setServices] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const [caseData, serviceData] = await Promise.all([listCases({ page_size: 50 }), listServices()]);
        setCases(caseData.results ?? caseData);
        setServices(serviceData.results ?? serviceData);
      } catch (error) {
        showToast(extractErrorMessage(error), "error");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCount = cases?.filter((item) => item.status !== "closed").length ?? 0;
  const closedCount = cases?.filter((item) => item.status === "closed").length ?? 0;
  const avgConfidence = cases?.length
    ? Math.round(cases.filter((item) => item.confidence_score != null).reduce((sum, item) => sum + item.confidence_score, 0) / (cases.filter((item) => item.confidence_score != null).length || 1))
    : null;
  const recent = cases?.slice(0, 5) ?? [];

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-semibold">Dashboard</h1>

      {!cases ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((key) => (
            <Skeleton key={key} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon={FolderSearch} label="Open investigations" value={openCount} />
          <StatCard icon={Lightbulb} label="Closed cases" value={closedCount} />
          <StatCard icon={TrendingUp} label="Avg. confidence" value={avgConfidence != null ? `${avgConfidence}%` : "—"} />
          <StatCard icon={Server} label="Services tracked" value={services.length} />
        </div>
      )}

      <h2 className="mb-2 mt-8 text-lg font-semibold">Service health</h2>
      <ServiceHealthStrip services={services} />

      <h2 className="mb-2 mt-8 text-lg font-semibold">Recent investigations</h2>
      {cases && recent.length === 0 && (
        <EmptyState icon={FolderSearch} title="No investigations yet" description="Create your first case or connect a SigNoz alert." />
      )}
      {recent.length > 0 && (
        <div className="rounded-lg border border-border-subtle bg-surface p-2 md:p-4">
          <CaseTable cases={recent} />
          <div className="flex flex-col gap-2 md:hidden">
            {recent.map((item) => (
              <CaseCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
