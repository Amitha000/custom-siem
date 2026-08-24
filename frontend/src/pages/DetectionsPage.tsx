import { useEffect, useState } from "react";
import { Pencil, ShieldAlert, X } from "lucide-react";

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

type EditForm = {
  severity: string;
  threshold: number;
  window_minutes: number;
};

export default function DetectionsPage() {
  const [rules, setRules] = useState<DetectionRule[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingRule, setEditingRule] =
    useState<DetectionRule | null>(null);

  const [editForm, setEditForm] = useState<EditForm>({
    severity: "medium",
    threshold: 3,
    window_minutes: 15,
  });

  const [saving, setSaving] = useState(false);

  const fetchRules = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/detections"
      );

      if (!response.ok) {
        throw new Error("Failed to load detection rules");
      }

      const data: DetectionRule[] = await response.json();

      setRules(data);
    } catch (error) {
      console.error("Failed to fetch detection rules:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
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

      const updatedRule: DetectionRule =
        await response.json();

      setRules((currentRules) =>
        currentRules.map((rule) =>
          rule.id === updatedRule.id
            ? updatedRule
            : rule
        )
      );
    } catch (error) {
      console.error("Toggle failed:", error);
    }
  };

  const openEdit = (rule: DetectionRule) => {
    setEditingRule(rule);

    setEditForm({
      severity: rule.severity,
      threshold: rule.threshold,
      window_minutes: rule.window_minutes,
    });
  };

  const closeEdit = () => {
    setEditingRule(null);
  };

  const saveRule = async () => {
    if (!editingRule) {
      return;
    }

    if (editForm.threshold < 1) {
      alert("Threshold must be at least 1.");
      return;
    }

    if (editForm.window_minutes < 1) {
      alert("Time window must be at least 1 minute.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `http://localhost:8080/detections/${editingRule.id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            severity: editForm.severity,
            threshold: editForm.threshold,
            window_minutes: editForm.window_minutes,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save detection rule");
      }

      const updatedRule: DetectionRule =
        await response.json();

      setRules((currentRules) =>
        currentRules.map((rule) =>
          rule.id === updatedRule.id
            ? updatedRule
            : rule
        )
      );

      setEditingRule(null);
    } catch (error) {
      console.error("Failed to save rule:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading detection rules...</p>;
  }

  return (
    <div>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            Detection Engineering
          </p>

          <h1>Detection Rules</h1>
        </div>

        <span className="event-total">
          {rules.length}{" "}
          {rules.length === 1 ? "rule" : "rules"}
        </span>
      </div>

      <div className="detections-grid">
        {rules.map((rule) => {
          const isEnabled =
            rule.enabled === "true";

          return (
            <article
              className="detection-card"
              key={rule.id}
            >
              <div className="detection-top">
                <div className="detection-icon">
                  <ShieldAlert size={20} />
                </div>

                <div className="detection-title">
                  <div className="alert-badges">
                    <span
                      className={`severity ${rule.severity}`}
                    >
                      {rule.severity}
                    </span>

                    <span
                      className={
                        isEnabled
                          ? "rule-status enabled"
                          : "rule-status disabled"
                      }
                    >
                      {isEnabled
                        ? "Enabled"
                        : "Disabled"}
                    </span>
                  </div>

                  <h2>{rule.name}</h2>
                </div>

                <div className="detection-actions">
                  <button
                    type="button"
                    className="edit-rule-button"
                    onClick={() => openEdit(rule)}
                    title="Edit detection rule"
                  >
                    <Pencil size={17} />
                    Edit
                  </button>

                  <button
                    className={`switch ${
                      isEnabled ? "on" : "off"
                    }`}
                    onClick={() =>
                      toggleRule(rule.id)
                    }
                    title={
                      isEnabled
                        ? "Disable rule"
                        : "Enable rule"
                    }
                    type="button"
                    aria-pressed={isEnabled}
                  >
                    <span className="switch-knob" />
                  </button>
                </div>
              </div>

              <p className="alert-description">
                {rule.description}
              </p>

              <div className="rule-details">
                <div>
                  <span>Event Type</span>
                  <strong>
                    {rule.event_type}
                  </strong>
                </div>

                <div>
                  <span>Threshold</span>
                  <strong>
                    {rule.threshold} events
                  </strong>
                </div>

                <div>
                  <span>Time Window</span>
                  <strong>
                    {rule.window_minutes} minutes
                  </strong>
                </div>

                <div>
                  <span>Severity</span>
                  <strong>
                    {rule.severity}
                  </strong>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {editingRule && (
        <div
          className="modal-backdrop"
          onClick={closeEdit}
        >
          <div
            className="edit-rule-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  Detection Rule
                </p>

                <h2>Edit Rule</h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeEdit}
              >
                <X size={20} />
              </button>
            </div>

            <div className="edit-rule-name">
              <strong>
                {editingRule.name}
              </strong>

              <span>
                {editingRule.event_type}
              </span>
            </div>

            <div className="edit-form">
              <label>
                Severity

                <select
                  value={editForm.severity}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      severity:
                        event.target.value,
                    })
                  }
                >
                  <option value="low">
                    Low
                  </option>

                  <option value="medium">
                    Medium
                  </option>

                  <option value="high">
                    High
                  </option>

                  <option value="critical">
                    Critical
                  </option>
                </select>
              </label>

              <label>
                Threshold

                <input
                  type="number"
                  min="1"
                  value={editForm.threshold}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      threshold: Number(
                        event.target.value
                      ),
                    })
                  }
                />
              </label>

              <label>
                Time Window (minutes)

                <input
                  type="number"
                  min="1"
                  value={
                    editForm.window_minutes
                  }
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      window_minutes: Number(
                        event.target.value
                      ),
                    })
                  }
                />
              </label>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={closeEdit}
              >
                Cancel
              </button>

              <button
                type="button"
                className="save-rule-button"
                onClick={saveRule}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





