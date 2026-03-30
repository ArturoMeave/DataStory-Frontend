import { useState } from "react";
import { Target, Pencil, Check } from "lucide-react";
import { Card } from "../ui/Card";
import { ProgressBar, getProgressColor } from "../ui/ProgressBar";
import { Button } from "../ui/Button";
import { useDataStore } from "../../stores/dataStore";
import {
  totalRevenue,
  goalProgress,
  formatCurrency,
} from "../../utils/dataAggregator";

export function GoalThermometer() {
  const { rows, goal, setGoal } = useDataStore();
  const [editing, setEditing] = useState(!goal);
  const [inputValue, setInputValue] = useState(goal ? String(goal.amount) : "");

  const currentRevenue = totalRevenue(rows);
  const progress = goal ? goalProgress(rows, goal.amount) : 0;

  const handleSave = () => {
    const amount = parseFloat(inputValue.replace(/[^0-9.]/g, ""));
    if (isNaN(amount) || amount <= 0) return;
    setGoal({ amount, currency: "EUR", period: "monthly" });
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
  };

  const statusText =
    progress >= 100
      ? "¡Meta superada!"
      : progress >= 80
        ? "Casi allí"
        : progress >= 40
          ? "En camino"
          : "Por debajo";

  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Cabecera */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Target size={16} color="var(--color-accent)" />
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--color-text-primary)",
            }}
          >
            Meta de facturación
          </span>
        </div>
        {!editing && goal && (
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            <Pencil size={12} />
            Editar
          </Button>
        )}
      </div>

      {/* Modo edición */}
      {editing ? (
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 13,
                color: "var(--color-text-muted)",
              }}
            >
              €
            </span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="10000"
              autoFocus
              style={{
                width: "100%",
                paddingLeft: 28,
                paddingRight: 12,
                paddingTop: 8,
                paddingBottom: 8,
                fontSize: 13,
                borderRadius: "var(--radius-md)",
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border-hover)",
                color: "var(--color-text-primary)",
                outline: "none",
                fontFamily: "var(--font-sans)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--color-accent)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--color-border-hover)";
              }}
            />
          </div>
          <Button variant="primary" size="sm" onClick={handleSave}>
            <Check size={13} />
            Guardar
          </Button>
        </div>
      ) : goal ? (
        /* Modo visualización */
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 26,
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                }}
              >
                {formatCurrency(currentRevenue)}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                  marginTop: 2,
                }}
              >
                de {formatCurrency(goal.amount)} objetivo
              </p>
            </div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: getProgressColor(progress),
              }}
            >
              {statusText}
            </p>
          </div>
          <ProgressBar value={progress} max={100} />
        </div>
      ) : null}
    </Card>
  );
}
