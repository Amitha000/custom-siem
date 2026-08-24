import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Server,
  User,
} from "lucide-react";

type Alert = {
  id: number;
  created_at: string;
  rule_name: string;
  severity: string;
  host?: string;
  username?: string;
  event_count: number;
  status: string;
  description: string;
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/alerts")
      .then((res) => res.json())
      .then(setAlerts)
      .catch(console.error);
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const query = search.toLowerCase();

      const matchesSearch =
        alert.rule_name.toLowerCase().includes(query) ||
        alert.description.toLowerCase().includes(query) ||
        alert.host?.toLowerCase().includes(query) ||
        alert.username?.toLowerCase().includes(query);

      const matchesSeverity =
        severity === "all" || alert.severity === severity;

      const matchesStatus =
        status === "all" || alert.status === status;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [alerts, search, severity, status]);

  const openAlerts = alerts.filter(
    (alert) => alert.status === "open"
  ).length;

  const highRiskAlerts = alerts.filter(
    (alert) =>
      alert.severity === "high" ||
      alert.severity === "critical"
  ).length;

  return (
    <div>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Detection Queue</p>
          <h1>Security Alerts</h1>
        </div>

        <span className="event-total">
          {filteredAlerts.length} alerts
        </span>
      </div>

      <section className="cards alert-summary-cards">
        <SummaryCard
          title="Total Alerts"
          value={alerts.length}
          icon={<AlertTriangle size={20} />}
        />

        <SummaryCard
          title="Open Alerts"
          value={openAlerts}
          icon={<Clock3 size={20} />}
        />

        <SummaryCard
          title="High Risk"
          value={highRiskAlerts}
          icon={<AlertTriangle size={20} />}
        />

        <SummaryCard
          title="Closed Alerts"
          value={
            alerts.filter((alert) => alert.status === "closed")
              .length
          }
          icon={<CheckCircle2 size={20} />}
        />
      </section>

      <div className="filters">
        <input
          type="text"
          placeholder="Search rule, host, user, description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <option value="all">All severities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="alerts-grid">
        {filteredAlerts.length === 0 ? (
          <div className="panel empty-alerts">
            <AlertTriangle size={28} />

            <div>
              <h2>No alerts found</h2>
              <p>
                No alerts match the current filters.
              </p>
            </div>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <article className="alert-card" key={alert.id}>
              <div className="alert-card-top">
                <div>
                  <div className="alert-badges">
                    <span
                      className={`severity ${alert.severity}`}
                    >
                      {alert.severity}
                    </span>

                    <span
                      className={`alert-status ${alert.status}`}
                    >
                      {alert.status}
                    </span>
                  </div>

                  <h2>{alert.rule_name}</h2>
                </div>

                <span className="alert-id">
                  #{alert.id}
                </span>
              </div>

              <p className="alert-description">
                {alert.description}
              </p>

              <div className="alert-details">
                <div>
                  <Server size={16} />
                  <span>
                    {alert.host ?? "Unknown host"}
                  </span>
                </div>

                <div>
                  <User size={16} />
                  <span>
                    {alert.username ?? "Unknown user"}
                  </span>
                </div>

                <div>
                  <AlertTriangle size={16} />
                  <span>
                    {alert.event_count} related events
                  </span>
                </div>

                <div>
                  <Clock3 size={16} />
                  <span>
                    {new Date(
                      alert.created_at
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>

      <div>
        <p>{title}</p>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
