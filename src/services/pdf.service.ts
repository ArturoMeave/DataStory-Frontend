import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { formatCurrency } from "../utils/dataAggregator";

interface PDFOptions {
  title?: string;
  summary: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

async function captureChart(
  elementId: string,
): Promise<HTMLCanvasElement | null> {
  const element = document.getElementById(elementId);
  if (!element) return null;

  // Damos un tiempo (medio segundo) para que terminen de animarse los gráficos
  await new Promise((resolve) => setTimeout(resolve, 500));

  return html2canvas(element, {
    scale: 2,
    backgroundColor: "#16161f",
    logging: false,
    useCORS: true,
  });
}

export async function exportPDF({
  title = "Reporte Financiero",
  summary,
  totalRevenue,
  totalExpenses,
  netProfit,
}: PDFOptions): Promise<void> {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 20;
  let y = 0;

  // ── Fondo negro en toda la página ───────────────────────────────────────────
  pdf.setFillColor(10, 10, 15);
  pdf.rect(0, 0, pageWidth, pdf.internal.pageSize.getHeight(), "F");

  // ── Cabecera ────────────────────────────────────────────────────────────────
  pdf.setFillColor(22, 22, 31);
  pdf.rect(0, 0, pageWidth, 22, "F");
  pdf.setFillColor(124, 106, 255);
  pdf.rect(0, 0, 3, 22, "F");

  pdf.setTextColor(160, 160, 200);
  pdf.setFontSize(8);
  pdf.text("DATASTORY", 8, 14);

  pdf.setTextColor(240, 240, 248);
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text(title, pageWidth / 2, 14, { align: "center" });

  const dateStr = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  pdf.setTextColor(100, 100, 130);
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.text(dateStr, pageWidth - 8, 14, { align: "right" });

  y = 30;

  // ── KPIs ────────────────────────────────────────────────────────────────────
  const kpiWidth = (contentWidth - 8) / 3;

  const kpis = [
    {
      label: "INGRESOS",
      value: formatCurrency(totalRevenue),
      color: [34, 211, 160],
    },
    {
      label: "GASTOS",
      value: formatCurrency(totalExpenses),
      color: [244, 63, 94],
    },
    {
      label: "BENEFICIO",
      value: formatCurrency(netProfit),
      color: netProfit >= 0 ? [34, 211, 160] : [244, 63, 94],
    },
  ];

  kpis.forEach((kpi, i) => {
    const x = 10 + i * (kpiWidth + 4);
    pdf.setFillColor(22, 22, 31);
    pdf.roundedRect(x, y, kpiWidth, 20, 2, 2, "F");
    pdf.setTextColor(74, 74, 106);
    pdf.setFontSize(7);
    pdf.text(kpi.label, x + 6, y + 7);
    pdf.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text(kpi.value, x + 6, y + 15);
  });

  y += 28;

  // ── Resumen de IA ────────────────────────────────────────────────────────────
  pdf.setFillColor(22, 22, 31);
  pdf.roundedRect(10, y, contentWidth, 8, 2, 2, "F");
  pdf.setTextColor(124, 106, 255);
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "bold");
  pdf.text("ANÁLISIS INTELIGENTE", 14, y + 5.5);
  y += 12;

  pdf.setTextColor(180, 180, 210);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");

  // jsPDF no hace wrap automático, dividimos el texto manualmente
  const summaryLines = pdf.splitTextToSize(summary, contentWidth - 4);
  summaryLines.forEach((line: string) => {
    if (y > 260) return;
    pdf.text(line, 10, y);
    y += 5.5;
  });

  y += 8;

  // ── Gráficos ─────────────────────────────────────────────────────────────────
  for (const chartId of ["chart-revenue", "chart-expenses"]) {
    const canvas = await captureChart(chartId);
    if (!canvas) continue;

    const imgData = canvas.toDataURL("image/png");
    const aspectRatio = canvas.height / canvas.width;
    const imgHeight = contentWidth * aspectRatio;

    if (y + imgHeight > 270) {
      pdf.addPage();
      pdf.setFillColor(10, 10, 15);
      pdf.rect(0, 0, pageWidth, pdf.internal.pageSize.getHeight(), "F");
      y = 16;
    }

    pdf.addImage(imgData, "PNG", 10, y, contentWidth, imgHeight);
    y += imgHeight + 10;
  }

  // ── Pie de página ────────────────────────────────────────────────────────────
  const pageHeight = pdf.internal.pageSize.getHeight();
  pdf.setDrawColor(40, 40, 60);
  pdf.setLineWidth(0.3);
  pdf.line(10, pageHeight - 10, pageWidth - 10, pageHeight - 10);
  pdf.setTextColor(60, 60, 90);
  pdf.setFontSize(7);
  pdf.text("Generado por DataStory", pageWidth / 2, pageHeight - 5, {
    align: "center",
  });

  // ── Descarga ─────────────────────────────────────────────────────────────────
  const fileName = `datastory-${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(fileName);
}
