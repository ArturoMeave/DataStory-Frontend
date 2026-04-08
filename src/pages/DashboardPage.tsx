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
import { RevenueLineChart } from "../components/charts/RevenueLinearChart";
import { ExpenseBarChart } from "../components/charts/ExpenseBarChart";
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
import { detectAnomalies } from "../utils/anomalyDetector";
import { generateSummary, generateTasks } from "../services/api.service";
import { exportPDF } from "../services/pdf.service";
import type { Task } from "../types";

// ── COMPONENTE KPI COMPACTO (Estilo Outrunix) ──
function CompactKPICard({
  label,
  value,
  change,
  accentColor,
  progress = 100,
  delay = 0,
}: {
  label: string;
  value: string;
  change: string;
  accentColor: string;
  progress?: number;
  delay?: number;
}) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <SpotlightCard
      style={{
        animation: `fadeSlideUp 0.4s ${delay}s cubic-bezier(0.16,1,0.3,1) both`,
        height: "100%",
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          height: "100%",
        }}
      >
        {/* Anillo de progreso */}
        <div
          style={{
            position: "relative",
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="48" height="48" style={{ transform: "rotate(-90deg)" }}>
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="transparent"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="4"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="transparent"
              stroke={accentColor}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
            />
          </svg>
          <span
            style={{
              position: "absolute",
              fontSize: 11,
              fontWeight: 600,
              color: "var(--color-text-primary)",
            }}
          >
            {Math.round(progress)}%
          </span>
        </div>

        {/* Textos */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            flex: 1,
            minWidth: 0,
          }}
        >
          <p
            style={{
              fontSize: 11,
              color: "var(--color-text-muted)",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {label}
          </p>
          <p
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            {value}
          </p>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: accentColor,
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 6px",
              background: `${accentColor}15`,
              borderRadius: 12,
              alignSelf: "flex-start",
              marginTop: 2,
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

  const hasData = rows.length > 0;
  const rev = totalRevenue(rows);
  const exp = totalExpenses(rows);
  const profit = netProfit(rows);

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

      {/* 🔴 CORRECCIÓN DEL SOLAPAMIENTO: marginLeft 260px */}
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
            {/* HEADER COMPACTO TIPO OUTRUNIX */}
            <header
              style={{
                padding: "14px 28px",
                borderBottom: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(10,10,15,0.4)",
                backdropFilter: "blur(12px)",
                zIndex: 20,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <h1
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Hi, {user?.name?.split(" ")[0] || "Reen"} !
                </h1>
                <p style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                  Here's what's happening with your business today.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 14px",
                    background: "var(--color-bg-elevated)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 20,
                    width: 220,
                  }}
                >
                  <Search size={14} color="var(--color-text-muted)" />
                  <input
                    type="text"
                    placeholder="Search anything..."
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--color-text-primary)",
                      fontSize: 13,
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
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: 20,
                    background: "transparent",
                    border: "1px solid var(--color-border-hover)",
                    color: "var(--color-text-secondary)",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <Share2 size={13} /> Share
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: 20,
                    background: "var(--color-accent)",
                    border: "none",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: isExporting ? "not-allowed" : "pointer",
                    opacity: isExporting ? 0.6 : 1,
                  }}
                >
                  <Download size={13} /> Export PDF
                </button>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "var(--color-bg-elevated)",
                    border: "1px solid var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Bell size={15} color="var(--color-text-muted)" />
                </div>
              </div>
            </header>

            {/* MAIN CONTENT: SCROLLEABLE, GRID AJUSTADO */}
            <main
              style={{
                padding: "24px 28px",
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {/* 1. 4 KPIs (Anillos estilo Outrunix) */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 16,
                }}
              >
                <CompactKPICard
                  label="Total Revenue"
                  value={formatCurrency(rev)}
                  change="+12.5%"
                  accentColor="var(--color-accent)"
                  progress={70}
                  delay={0.05}
                />
                <CompactKPICard
                  label="Total Expenses"
                  value={formatCurrency(exp)}
                  change="+4.2%"
                  accentColor="var(--color-danger)"
                  progress={45}
                  delay={0.1}
                />
                <CompactKPICard
                  label="Net Profit"
                  value={formatCurrency(profit)}
                  change={profit >= 0 ? "+21.0%" : "-5.0%"}
                  accentColor="var(--color-success)"
                  progress={85}
                  delay={0.15}
                />
                <CompactKPICard
                  label="Goal Progress"
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

              {/* 2. Gráfico de Ingresos + Tareas (Layout 2 a 1) */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    animation: "fadeSlideUp 0.5s 0.25s both",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <RevenueLineChart />
                </div>
                <div
                  style={{
                    animation: "fadeSlideUp 0.5s 0.3s both",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <TaskPanel />
                </div>
              </div>

              {/* 3. Gráficos Extra + Chat (Layout 3 columnas) */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 16,
                  paddingBottom: 24,
                }}
              >
                <div
                  style={{
                    animation: "fadeSlideUp 0.5s 0.35s both",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <ExpenseBarChart />
                </div>
                <div
                  style={{
                    animation: "fadeSlideUp 0.5s 0.4s both",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <AISummary />
                </div>
                <div
                  style={{
                    animation: "fadeSlideUp 0.5s 0.45s both",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <ChatPanel />
                </div>
              </div>
            </main>
          </>
        )}
      </div>

      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} />
      <StripeModal isOpen={showStripe} onClose={() => setShowStripe(false)} />
    </div>
  );
}
