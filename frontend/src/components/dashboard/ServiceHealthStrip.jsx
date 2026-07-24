/**
 * ServiceHealthStrip - horizontal row of service chips colored by open-case
 * count (Section 11.2: green/amber/red).
 */
import { Link } from "react-router-dom";

function healthColor(openCount) {
  if (openCount === 0) return "border-severity-low/40 text-severity-low";
  if (openCount <= 2) return "border-severity-medium/40 text-severity-medium";
  return "border-severity-critical/40 text-severity-critical";
}

export default function ServiceHealthStrip({ services }) {
  if (!services?.length) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Service health">
      {services.map((service) => (
        <li key={service.id}>
          <Link
            to={`/services/${service.id}`}
            className={`inline-flex items-center gap-1.5 rounded-full border bg-surface px-3 py-1 text-xs font-medium hover:bg-surface-elevated ${healthColor(service.open_case_count)}`}
          >
            {service.name}
            <span className="opacity-80">· {service.open_case_count} open</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
