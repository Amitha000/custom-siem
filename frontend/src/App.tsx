import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  Gauge,
  Shield,
} from "lucide-react";

type SecurityEvent = {
  id: number;
  timestamp: string;
  host: string;
  source: string;
  event_type: string;
  username?: string;
  process?: string;
  severity: string;
};

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

export default function App() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/events")
      .then((res) => res.json())
      .then(setEvents)
      .catch(console.error);

    fetch("http://localhost:8080/alerts")
      .then((res) => res.json())
      .then(setAlerts)
      .catch(console.error);
  }, []);

  const criticalAlerts = alerts.filter(
    (alert) => alert.severity === "critical"
  ).length;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <Shield size={28} />
          <span>Custom SIEM</span>
        </div>

        <nav>
          <a className="active">
            <Gauge size={18} />
            Overview
          </a>

          <a>
            <Activity size={18} />
            Events
          </a>

          <a>
            <Bell size={18} />
            Alerts
          </a>

          <a>
            <AlertTriangle size={18} />
            Detections
          </a>
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Security Operations</p>
            <h1>SIEM Overview</h1>
          </div>

          <div className="status">
            <span className="status-dot" />
            System Online
          </div>
        </header>

        <section className="cards">
          <MetricCard
            title="Security Events"
            value={events.length}
            icon={<Activity />}
          />

          <MetricCard
            title="Open Alerts"
            value={alerts.filter((alert) => alert.status === "open").length}
            icon={<Bell />}
          />

          <MetricCard
            title="Critical Alerts"
            value={criticalAlerts}
            icon={<AlertTriangle />}
          />

          <MetricCard
            title="Monitored Hosts"
            value={new Set(events.map((event) => event.host)).size}
            icon={<Shield />}
          />
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Detection Queue</p>
              <h2>Recent Alerts</h2>
            </div>
          </div>

          <div className="alert-list">
            {alerts.length === 0 ? (
              <p className="empty">No alerts detected.</p>
            ) : (
              alerts.slice(0, 5).map((alert) => (
                <div className="alert-row" key={alert.id}>
                  <span className={`severity ${alert.severity}`}>
                    {alert.severity}
                  </span>

                  <div>
                    <strong>{alert.rule_name}</strong>
                    <p>
                      {alert.host ?? "Unknown host"} ·{" "}
                      {alert.username ?? "Unknown user"}
                    </p>
                  </div>

                  <span className="event-count">
                    {alert.event_count} events
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Telemetry</p>
              <h2>Latest Security Events</h2>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Host</th>
                  <th>User</th>
                  <th>Event</th>
                  <th>Process</th>
                  <th>Severity</th>
                </tr>
              </thead>

              <tbody>
                {events.slice(0, 10).map((event) => (
                  <tr key={event.id}>
                    <td>{new Date(event.timestamp).toLocaleTimeString()}</td>
                    <td>{event.host}</td>
                    <td>{event.username ?? "-"}</td>
                    <td>{event.event_type}</td>
                    <td>{event.process ?? "-"}</td>
                    <td>
                      <span className={`severity ${event.severity}`}>
                        {event.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({
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
