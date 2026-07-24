/**
 * ServiceListPage - simple list of tracked services, linking into
 * ServiceDetailPage (supports Section 11.6).
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Server } from "lucide-react";

import { listServices } from "../api/services.js";
import AppShell from "../components/layout/AppShell.jsx";
import Skeleton from "../components/common/Skeleton.jsx";
import EmptyState from "../components/common/EmptyState.jsx";

export default function ServiceListPage() {
  const [services, setServices] = useState(null);

  useEffect(() => {
    listServices().then((data) => setServices(data.results ?? data));
  }, []);

  return (
    <AppShell>
      <h1 className="mb-4 text-2xl font-semibold">Services</h1>
      {!services && <Skeleton className="h-40 w-full" />}
      {services && services.length === 0 && <EmptyState icon={Server} title="No services registered yet" />}
      {services && services.length > 0 && (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li key={service.id}>
              <Link
                to={`/services/${service.id}`}
                className="flex flex-col gap-1 rounded-lg border border-border-subtle bg-surface p-4 hover:bg-surface-elevated"
              >
                <p className="font-medium">{service.name}</p>
                <p className="text-xs text-text-secondary">
                  {service.open_case_count} open · {service.closed_case_count} closed
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
