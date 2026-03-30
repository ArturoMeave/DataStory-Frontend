import { ListTodo, RefreshCw, CheckCircle2, Circle } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useDataStore } from "../../stores/dataStore";
import { generateTasks } from "../../services/api.service";
import { buildDataSummary } from "../../utils/dataAggregator";

const priorityColors: Record<string, string> = {
  high: "var(--color-danger)",
  medium: "var(--color-warning)",
  low: "var(--color-success)",
};

const priorityLabels: Record<string, string> = {
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

export function TaskPanel() {
  const { rows, goal, tasks, setTasks, toggleTask, isLoadingAI } =
    useDataStore();
  const completedCount = tasks.filter((t) => t.completed).length;

  const handleRefresh = async () => {
    if (rows.length === 0) return;
    try {
      const summary = buildDataSummary(rows, goal?.amount);
      const raw = await generateTasks(summary);

      // La IA devuelve un JSON como string, lo parseamos aquí
      const parsed = JSON.parse(raw) as Array<{
        text: string;
        priority: "high" | "medium" | "low";
      }>;

      setTasks(
        parsed.map((t, i) => ({
          id: `task-${Date.now()}-${i}`,
          text: t.text,
          completed: false,
          priority: t.priority ?? "medium",
        })),
      );
    } catch {
      // Si la IA devuelve JSON malformado simplemente no actualizamos
    }
  };

  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Cabecera */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ListTodo size={16} color="var(--color-accent)" />
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "var(--color-text-primary)",
            }}
          >
            Acciones sugeridas
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {tasks.length > 0 && (
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
              {completedCount}/{tasks.length}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            loading={isLoadingAI}
            onClick={handleRefresh}
          >
            <RefreshCw size={12} />
          </Button>
        </div>
      </div>

      {/* Lista de tareas */}
      {tasks.length === 0 ? (
        <p
          style={{
            fontSize: 13,
            color: "var(--color-text-muted)",
            textAlign: "center",
            padding: "16px 0",
          }}
        >
          {isLoadingAI
            ? "Generando tareas..."
            : "Pulsa el botón para generar tareas."}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                background: task.completed
                  ? "var(--color-bg-elevated)"
                  : "var(--color-bg-surface)",
                border: "1px solid var(--color-border)",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                transition: "all 0.15s ease",
              }}
            >
              {task.completed ? (
                <CheckCircle2
                  size={15}
                  color="var(--color-success)"
                  style={{ marginTop: 1, flexShrink: 0 }}
                />
              ) : (
                <Circle
                  size={15}
                  color="var(--color-text-muted)"
                  style={{ marginTop: 1, flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    color: task.completed
                      ? "var(--color-text-muted)"
                      : "var(--color-text-primary)",
                    textDecoration: task.completed ? "line-through" : "none",
                    lineHeight: 1.5,
                  }}
                >
                  {task.text}
                </p>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: priorityColors[task.priority],
                    marginTop: 3,
                    display: "block",
                  }}
                >
                  {priorityLabels[task.priority]}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
