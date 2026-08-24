import { useEffect, useMemo, useState } from "react";

type SecurityEvent = {
  id: number;
  timestamp: string;
  host: string;
  source: string;
  event_type: string;
  username?: string;
  process?: string;
  severity: string;
  raw_log: string;
};

export default function EventsPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");
  const [eventType, setEventType] = useState("all");

  useEffect(() => {
    fetch("http://localhost:8080/events")
      .then((res) => res.json())
      .then(setEvents)
      .catch(console.error);
  }, []);

  const eventTypes = useMemo(
    () => Array.from(new Set(events.map((event) => event.event_type))),
    [events]
  );

  const filteredEvents = events.filter((event) => {
    const query = search.toLowerCase();

    const matchesSearch =
      event.host.toLowerCase().includes(query) ||
      event.event_type.toLowerCase().includes(query) ||
      event.username?.toLowerCase().includes(query) ||
      event.process?.toLowerCase().includes(query) ||
      event.raw_log.toLowerCase().includes(query);

    const matchesSeverity =
      severity === "all" || event.severity === severity;

    const matchesEventType =
      eventType === "all" || event.event_type === eventType;

    return matchesSearch && matchesSeverity && matchesEventType;
  });

  return (
    <div>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Telemetry</p>
          <h1>Security Events</h1>
        </div>

        <span className="event-total">
          {filteredEvents.length} events
        </span>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search host, user, process, raw log..."
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
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
        >
          <option value="all">All event types</option>

          {eventTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Host</th>
                <th>User</th>
                <th>Event Type</th>
                <th>Process</th>
                <th>Severity</th>
              </tr>
            </thead>

            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id}>
                  <td>
                    {new Date(event.timestamp).toLocaleString()}
                  </td>
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
      </div>
    </div>
  );
}
