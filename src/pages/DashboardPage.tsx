import { useEffect, useState } from "react";
import { Search, Share2, Download, Bell } from "lucide-react";
import { Sidebar } from "../components/layout/Sidebar";
import { FileDropzone } from "../components/dashboard/FileDropzone";
import { AISummary } from "../components/dashboard/AISummary";
import { AnomalyAlert } from "../components/dashboard/AnomalyAlert";
import { TaskPanel } from "../components/dashboard/TaskPanel";
import { ChatPanel } from "../components/dashboard/ChatPanel";
import { ShareModal } from "../components/dashboard/ShareModal";
import { StripeModal } from "../components/dashboard/StripeModal";
import { useDataStore } from "../stores/dataStore";
import { useAuthStore } from "../stores/authStore";
import { SpotlightCard } from "../components/ui/SpotlightCard";
import {
  buildDataSummary,
  totalRevenue,
  totalExpenses,
  netProfit,
  goalProgress,
  formatCurrency,
} from "../utils/dataAggregator";
import { ExpenseBarChart } from "../components/charts/ExpenseBarChart";
import { RevenueLineChart } from "../components/charts/RevenueLineChart";
import { detectAnomalies } from "../utils/anomalyDetector";
import { generateSummary, generateTasks } from "../services/api.service";
import { exportPDF } from "../services/pdf.service";
import type { Task } from "../types";

// ── COMPONENTE KPI FUTURISTA ──
function CompactKPICard({
  label,
  value,
  change,
  accentColor,
  progress = 100,
  delay = 0,
}: any) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <SpotlightCard
      style={{
        animation: `fadeSlideUp 0.5s ${delay}s cubic-bezier(0.16,1,0.3,1) both`,
        height: "100%",
        overflow: "visible",
      }}
    >
      <div
        style={{
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          height: "100%",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 56,
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="56"
            height="56"
            style={{
              transform: "rotate(-90deg)",
              filter: `drop-shadow(0 0 8px ${accentColor}50)`,
            }}
          >
            <circle
              cx="28"
              cy="28"
              r={radius}
              fill="transparent"
              stroke="rgba(255,255,255,0.03)"
              strokeWidth="5"
            />
            <circle
              cx="28"
              cy="28"
              r={radius}
              fill="transparent"
              stroke={accentColor}
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition:
                  "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </svg>
          <span
            style={{
              position: "absolute",
              fontSize: 13,
              fontWeight: 700,
              color: "var(--color-text-primary)",
            }}
          >
            {Math.round(progress)}%
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            flex: 1,
            minWidth: 0,
          }}
        >
          <p
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {label}
          </p>
          <p
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.03em",
            }}
          >
            {value}
          </p>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: accentColor,
              display: "inline-flex",
              alignItems: "center",
              padding: "3px 8px",
              background: `${accentColor}10`,
              borderRadius: 8,
              alignSelf: "flex-start",
              marginTop: 2,
              border: `1px solid ${accentColor}20`,
            }}
          >
            {change}
          </span>
        </div>
      </div>
    </SpotlightCard>
  );
}

export function DashboardPage() {
  const {
    rows,
    goal,
    aiSummary,
    setAnomalies,
    setAiSummary,
    setIsLoadingAI,
    setTasks,
  } = useDataStore();
  const { user } = useAuthStore();

  const [showShare, setShowShare] = useState(false);
  const [showStripe, setShowStripe] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [activeChart, setActiveChart] = useState<"revenue" | "expenses">(
    "revenue",
  );
  const [activeAI, setActiveAI] = useState<"summary" | "tasks">("summary");

  const hasData = rows.length > 0;
  const rev = totalRevenue(rows);
  const exp = totalExpenses(rows);
  const profit = netProfit(rows);

  // Lógica completa de IA restaurada
  useEffect(() => {
    if (!hasData) return;
    setAnomalies(detectAnomalies(rows));

    const fetchAI = async () => {
      setIsLoadingAI(true);
      const summary = buildDataSummary(rows, goal?.amount);
      try {
        const [summaryText, tasksRaw] = await Promise.all([
          generateSummary(summary),
          generateTasks(summary),
        ]);
        setAiSummary(summaryText);
        try {
          const parsed = JSON.parse(tasksRaw) as Array<{
            text: string;
            priority: "high" | "medium" | "low";
          }>;
          const tasks: Task[] = parsed.map((t, i) => ({
            id: `task-${Date.now()}-${i}`,
            text: t.text,
            completed: false,
            priority: t.priority ?? "medium",
          }));
          setTasks(tasks);
        } catch {}
      } catch {
        setAiSummary("No se pudo conectar con el servicio de IA.");
      } finally {
        setIsLoadingAI(false);
      }
    };
    fetchAI();
  }, [rows, goal]);

  // Lógica completa de PDF restaurada
  const handleExportPDF = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await exportPDF({
        summary: aiSummary || "Sin análisis",
        totalRevenue: rev,
        totalExpenses: exp,
        netProfit: profit,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getTabStyle = (isActive: boolean) => ({
    padding: "10px 28px",
    borderRadius: "10px",
    background: isActive
      ? "linear-gradient(180deg, rgba(139,92,246,0.2) 0%, rgba(139,92,246,0.05) 100%)"
      : "transparent",
    border: `1px solid ${isActive ? "rgba(139,92,246,0.6)" : "transparent"}`,
    color: isActive ? "var(--color-text-primary)" : "var(--color-text-muted)",
    fontSize: 13,
    fontWeight: isActive ? 700 : 500,
    cursor: "pointer",
    boxShadow: isActive ? "0 0 15px rgba(139,92,246,0.3)" : "none",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    outline: "none",
  });

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "transparent",
      }}
    >
      <Sidebar />
      <div
        style={{
          marginLeft: 260,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {!hasData ? (
          <FileDropzone />
        ) : (
          <>
            <header
              style={{
                padding: "16px 32px",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(3,3,7,0.5)",
                backdropFilter: "blur(25px)",
                zIndex: 20,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <h1
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  Hola, {user?.name?.split(" ")[0] || "Reen"}
                </h1>
                <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
                  Aquí tienes el pulso energético de tu empresa hoy.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 18px",
                    background: "var(--color-bg-elevated)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "24px",
                    width: 250,
                  }}
                >
                  <Search size={16} color="var(--color-text-muted)" />
                  <input
                    type="text"
                    placeholder="Buscar datos..."
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--color-text-primary)",
                      fontSize: 14,
                      outline: "none",
                      width: "100%",
                    }}
                  />
                </div>
                <button
                  onClick={() => setShowShare(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 20px",
                    borderRadius: "24px",
                    background: "transparent",
                    border: "1px solid var(--color-border-hover)",
                    color: "var(--color-text-secondary)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Share2 size={14} /> Compartir
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "10px 20px",
                    borderRadius: "24px",
                    background:
                      "linear-gradient(135deg, var(--color-accent) 0%, #9333ea 100%)",
                    border: "none",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: isExporting ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 15px rgba(124, 58, 237, 0.4)",
                  }}
                >
                  <Download size={14} />{" "}
                  {isExporting ? "Generando..." : "Reporte PDF"}
                </button>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "var(--color-bg-elevated)",
                    border: "1px solid var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Bell size={17} color="var(--color-text-muted)" />
                </div>
              </div>
            </header>

            <main
              style={{
                padding: "32px",
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 24,
                paddingBottom: "100px",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 20,
                }}
              >
                <CompactKPICard
                  label="Ingresos Totales"
                  value={formatCurrency(rev)}
                  change="+12.5%"
                  accentColor="var(--color-accent)"
                  progress={70}
                  delay={0.05}
                />
                <CompactKPICard
                  label="Gastos Totales"
                  value={formatCurrency(exp)}
                  change="+4.2%"
                  accentColor="var(--color-danger)"
                  progress={45}
                  delay={0.1}
                />
                <CompactKPICard
                  label="Beneficio Neto"
                  value={formatCurrency(profit)}
                  change={profit >= 0 ? "+21.0%" : "-5.0%"}
                  accentColor="var(--color-success)"
                  progress={85}
                  delay={0.15}
                />
                <CompactKPICard
                  label="Progreso Meta"
                  value={formatCurrency(goal?.amount || 0)}
                  change="Target"
                  accentColor="var(--color-warning)"
                  progress={
                    goal ? Math.round(goalProgress(rows, goal.amount)) : 0
                  }
                  delay={0.2}
                />
              </div>

              <AnomalyAlert />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.2fr 1fr",
                  gap: 20,
                  flex: 1,
                  minHeight: 450,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "rgba(10,10,15,0.6)",
                      padding: "6px",
                      borderRadius: 12,
                      border: "1px solid var(--color-border)",
                      backdropFilter: "blur(15px)",
                    }}
                  >
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        onClick={() => setActiveChart("revenue")}
                        style={getTabStyle(activeChart === "revenue")}
                      >
                        Ingresos
                      </button>
                      <button
                        onClick={() => setActiveChart("expenses")}
                        style={getTabStyle(activeChart === "expenses")}
                      >
                        Gastos
                      </button>
                    </div>
                  </div>
                  <div
                    style={{ flex: 1, animation: "fadeSlideUp 0.3s ease-out" }}
                  >
                    {activeChart === "revenue" ? (
                      <RevenueLineChart />
                    ) : (
                      <ExpenseBarChart />
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      background: "rgba(10,10,15,0.6)",
                      padding: "6px",
                      borderRadius: 12,
                      border: "1px solid var(--color-border)",
                      backdropFilter: "blur(15px)",
                      width: "fit-content",
                    }}
                  >
                    <button
                      onClick={() => setActiveAI("summary")}
                      style={getTabStyle(activeAI === "summary")}
                    >
                      Resumen IA
                    </button>
                    <button
                      onClick={() => setActiveAI("tasks")}
                      style={getTabStyle(activeAI === "tasks")}
                    >
                      Plan de Acción
                    </button>
                  </div>
                  <div
                    style={{ flex: 1, animation: "fadeSlideUp 0.3s ease-out" }}
                  >
                    {activeAI === "summary" ? <AISummary /> : <TaskPanel />}
                  </div>
                </div>
              </div>
            </main>
          </>
        )}
      </div>

      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} />
      <StripeModal isOpen={showStripe} onClose={() => setShowStripe(false)} />
      {hasData && <ChatPanel />}
    </div>
  );
}
