import { CheckCircle2, ListTodo, AlertCircle } from "lucide-react";
import { SpotlightCard } from "../ui/SpotlightCard";
import { useDataStore } from "../../stores/dataStore";

export function TaskPanel() {
  // Leemos las tareas y el estado de carga desde la memoria global
  const { tasks, isLoadingAI } = useDataStore();

  const getPriorityColor = (priority: string) => {
    if (priority === "high")
      return {
        bg: "rgba(239, 68, 68, 0.1)",
        text: "var(--color-danger)",
        label: "Urgente",
      };
    if (priority === "medium")
      return {
        bg: "rgba(245, 158, 11, 0.1)",
        text: "var(--color-warning)",
        label: "Media",
      };
    return {
      bg: "rgba(34, 211, 160, 0.1)",
      text: "var(--color-success)",
      label: "Normal",
    };
  };

  return (
    <SpotlightCard style={{ height: "100%" }}>
      <div
        style={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "rgba(59, 130, 246, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ListTodo size={18} color="#3b82f6" />
          </div>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            Plan de Acción
          </h3>
        </div>

        <div style={{ flex: 1, overflowY: "auto", paddingRight: 8 }}>
          {isLoadingAI ? (
            <div
              style={{
                animation: "pulse 2s infinite",
                color: "var(--color-text-muted)",
                fontSize: 14,
              }}
            >
              Creando plan de acción...
            </div>
          ) : tasks.length === 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "var(--color-text-muted)",
                fontSize: 14,
              }}
            >
              <AlertCircle size={16} /> No hay tareas generadas aún.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {tasks.map((task) => {
                const priority = getPriorityColor(task.priority);
                return (
                  <div
                    key={task.id}
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: "16px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "12px",
                    }}
                  >
                    <CheckCircle2
                      size={18}
                      color="var(--color-text-muted)"
                      style={{ marginTop: 2, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: 14,
                          color: "var(--color-text-primary)",
                          lineHeight: "1.4",
                          marginBottom: 8,
                        }}
                      >
                        {task.text}
                      </p>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "4px 8px",
                          borderRadius: "6px",
                          background: priority.bg,
                          color: priority.text,
                          textTransform: "uppercase",
                        }}
                      >
                        {priority.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
}
