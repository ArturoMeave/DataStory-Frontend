import { useEffect, useState } from 'react'
import { Search, Share2, Download, TrendingUp, TrendingDown, Bell } from 'lucide-react'
import { Sidebar } from '../components/layout/Sidebar'
import { FileDropzone } from '../components/dashboard/FileDropzone'
import { GoalThermometer } from '../components/dashboard/GoalThermometer'
import { AISummary } from '../components/dashboard/AISummary'
import { AnomalyAlert } from '../components/dashboard/AnomalyAlert'
import { TaskPanel } from '../components/dashboard/TaskPanel'
import { ChatPanel } from '../components/dashboard/ChatPanel'
import { ShareModal } from '../components/dashboard/ShareModal'
import { StripeModal } from '../components/dashboard/StripeModal'
import { RevenueLineChart } from '../components/charts/RevenueLinearChart'
import { ExpenseBarChart } from '../components/charts/ExpenseBarChart'
import { useDataStore } from '../stores/dataStore'
import {
  buildDataSummary,
  totalRevenue,
  totalExpenses,
  netProfit,
  formatCurrency,
} from '../utils/dataAggregator'
import { detectAnomalies } from '../utils/anomalyDetector'
import { generateSummary, generateTasks } from '../services/api.service'
import { exportPDF } from '../services/pdf.service'
import type { Task } from '../types'

function KPICard({
  label,
  value,
  change,
  trend,
  accentColor,
}: {
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  accentColor: string
}) {
  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Borde superior de color */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: accentColor,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </p>
        {trend === 'up'
          ? <TrendingUp size={16} color={accentColor} />
          : <TrendingDown size={16} color={accentColor} />
        }
      </div>

      <p style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em', marginBottom: 8 }}>
        {value}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: accentColor }}>{change}</span>
        <div style={{ height: 3, flex: 1, background: 'var(--color-bg-elevated)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '60%', background: accentColor, borderRadius: 2 }} />
        </div>
      </div>
    </div>
  )
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
  } = useDataStore()

  const [showShare, setShowShare] = useState(false)
  const [showStripe, setShowStripe] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const hasData = rows.length > 0
  const rev = totalRevenue(rows)
  const exp = totalExpenses(rows)
  const profit = netProfit(rows)

  useEffect(() => {
    if (!hasData) return

    setAnomalies(detectAnomalies(rows))

    const fetchAI = async () => {
      setIsLoadingAI(true)
      const summary = buildDataSummary(rows, goal?.amount)
      try {
        const [summaryText, tasksRaw] = await Promise.all([
          generateSummary(summary),
          generateTasks(summary),
        ])
        setAiSummary(summaryText)
        try {
          const parsed = JSON.parse(tasksRaw) as Array<{ text: string; priority: 'high' | 'medium' | 'low' }>
          const tasks: Task[] = parsed.map((t, i) => ({
            id: `task-${Date.now()}-${i}`,
            text: t.text,
            completed: false,
            priority: t.priority ?? 'medium',
          }))
          setTasks(tasks)
        } catch { /* silent */ }
      } catch {
        setAiSummary('No se pudo conectar con el servicio de IA.')
      } finally {
        setIsLoadingAI(false)
      }
    }

    fetchAI()
  }, [rows, goal])

  const handleExportPDF = async () => {
    if (isExporting) return
    setIsExporting(true)
    try {
      await exportPDF({
        summary: aiSummary || 'Sin análisis disponible.',
        totalRevenue: rev,
        totalExpenses: exp,
        netProfit: profit,
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-base)' }}>

      {/* Sidebar */}
      <Sidebar />

      {/* Contenido principal */}
      <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {!hasData ? (
          <FileDropzone />
        ) : (
          <>
            {/* Header */}
            <header
              style={{
                padding: '20px 32px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(10,10,15,0.85)',
                backdropFilter: 'blur(12px)',
                position: 'sticky',
                top: 0,
                zIndex: 20,
              }}
            >
              <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                Dashboard
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Search */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    width: 200,
                  }}
                >
                  <Search size={13} color="var(--color-text-muted)" />
                  <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Search data...</span>
                </div>

                {/* Acciones */}
                <button
                  onClick={() => setShowShare(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: 'transparent',
                    border: '1px solid var(--color-border-hover)',
                    color: 'var(--color-text-secondary)',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-hover)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
                >
                  <Share2 size={13} />
                  Share
                </button>

                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: 'var(--color-accent)',
                    border: 'none',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: isExporting ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-sans)',
                    opacity: isExporting ? 0.6 : 1,
                    transition: 'opacity 0.15s',
                  }}
                >
                  <Download size={13} />
                  Export PDF
                </button>

                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Bell size={15} color="var(--color-text-muted)" />
                </div>
              </div>
            </header>

            {/* Contenido */}
            <main style={{ padding: '28px 32px', flex: 1 }}>

              {/* KPI Cards */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <KPICard
                  label="Total Income"
                  value={formatCurrency(rev)}
                  change="+12.5%"
                  trend="up"
                  accentColor="var(--color-success)"
                />
                <KPICard
                  label="Total Expenses"
                  value={formatCurrency(exp)}
                  change="+4.2%"
                  trend="down"
                  accentColor="var(--color-danger)"
                />
                <KPICard
                  label="Net Profit"
                  value={formatCurrency(profit)}
                  change={profit >= 0 ? '+21.0%' : '-5.0%'}
                  trend={profit >= 0 ? 'up' : 'down'}
                  accentColor={profit >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}
                />
              </div>

              {/* Anomaly Alert */}
              <div style={{ marginBottom: 24 }}>
                <AnomalyAlert />
              </div>

              {/* Grid principal */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

                {/* Columna izquierda */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {/* Billing Goal + Expenses en fila */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <GoalThermometer />
                    <ExpenseBarChart />
                  </div>

                  {/* Revenue chart */}
                  <RevenueLineChart />

                  {/* AI Summary */}
                  <AISummary
                    onRefresh={async () => {
                      setIsLoadingAI(true)
                      try {
                        const text = await generateSummary(buildDataSummary(rows, goal?.amount))
                        setAiSummary(text)
                      } finally {
                        setIsLoadingAI(false)
                      }
                    }}
                  />
                </div>

                {/* Columna derecha */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <TaskPanel />
                  <ChatPanel />
                </div>

              </div>
            </main>
          </>
        )}
      </div>

      {/* Modales */}
      <ShareModal isOpen={showShare} onClose={() => setShowShare(false)} />
      <StripeModal isOpen={showStripe} onClose={() => setShowStripe(false)} />
    </div>
  )
}