import { ShieldAlert, ToggleLeft } from "lucide-react";

type DetectionRule = {
  id: number;
  name: string;
  description: string;
  severity: string;
  threshold: number;
  window_minutes: number;
  event_type: string;
  enabled: boolean;
};

const rules: DetectionRule[] = [
  {
    id: 1,
    name: "Multiple Failed Authentication Attempts",
    description:
      "Detects repeated authentication failures for the same user and host.",
    severity: "medium",
    threshold: 3,
    window_minutes: 15,
    event_type: "authentication_failure",
    enabled: true,
  },
];

export default function DetectionsPage() {
  return (
    <div>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Detection Engineering</p>
          <h1>Detection Rules</h1>
        </div>

        <span className="event-total">
          {rules.length} rule
        </span>
      </div>

      <div className="detections-grid">
        {rules.map((rule) => (
          <article className="detection-card" key={rule.id}>
            <div className="detection-top">
              <div className="detection-icon">
                <ShieldAlert size={20} />
              </div>

              <div className="detection-title">
                <div className="alert-badges">
                  <span className={`severity ${rule.severity}`}>
                    {rule.severity}
                  </span>

                  <span
                    className={
                      rule.enabled
                        ? "rule-status enabled"
                        : "rule-status disabled"
                    }
                  >
                    {rule.enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>

                <h2>{rule.name}</h2>
              </div>

              <ToggleLeft size={24} className="rule-toggle" />
            </div>

            <p className="alert-description">
              {rule.description}
            </p>

            <div className="rule-details">
              <div>
                <span>Event Type</span>
                <strong>{rule.event_type}</strong>
              </div>

              <div>
                <span>Threshold</span>
                <strong>{rule.threshold} events</strong>
              </div>

              <div>
                <span>Time Window</span>
                <strong>{rule.window_minutes} minutes</strong>
              </div>

              <div>
                <span>Severity</span>
                <strong>{rule.severity}</strong>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
