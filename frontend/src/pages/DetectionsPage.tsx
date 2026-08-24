import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

type DetectionRule = {
  id: number;
  name: string;
  description: string;
  severity: string;
  threshold: number;
  window_minutes: number;
  event_type: string;
  enabled: string;
};

export default function DetectionsPage() {
  const [rules, setRules] = useState<DetectionRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8080/detections")
      .then((res) => res.json())
      .then((data) => {
        setRules(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const toggleRule = async (ruleId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8080/detections/${ruleId}/toggle`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update detection rule");
      }

      const updatedRule: DetectionRule = await response.json();

      setRules((currentRules) =>
        currentRules.map((rule) =>
          rule.id === updatedRule.id ? updatedRule : rule
        )
      );
    } catch (error) {
      console.error("Toggle failed:", error);
    }
  };

  if (loading) {
    return <p>Loading detection rules...</p>;
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Detection Engineering</p>
          <h1>Detection Rules</h1>
        </div>

        <span className="event-total">
          {rules.length} {rules.length === 1 ? "rule" : "rules"}
        </span>
      </div>

      <div className="detections-grid">
        {rules.map((rule) => {
          const isEnabled = rule.enabled === "true";

          return (
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
                        isEnabled
                          ? "rule-status enabled"
                          : "rule-status disabled"
                      }
                    >
                      {isEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>

                  <h2>{rule.name}</h2>
                </div>

                <button
                  className={`switch ${isEnabled ? "on" : "off"}`}
                  onClick={() => toggleRule(rule.id)}
                  title={isEnabled ? "Disable rule" : "Enable rule"}
                  type="button"
                  aria-pressed={isEnabled}
                >
                  <span className="switch-knob" />
                </button>
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
          );
        })}
      </div>
    </div>
  );
}
