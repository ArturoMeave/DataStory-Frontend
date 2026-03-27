interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  height?: number;
}

export function getProgressColor(pct: number): string {
  if (pct >= 80) return "var(--color-success)";
  if (pct >= 40) return "var(--color-warning)";
  return "var(--color-danger)";
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = true,
  height = 6,
}: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const color = getProgressColor(pct);

  return (
    <div style={{ width: "100%" }}>
      {showLabel && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 500, color }}>
            {pct.toFixed(1)}%
          </span>
        </div>
      )}
      <div
        style={{
          width: "100%",
          height,
          background: "var(--color-bg-elevated)",
          borderRadius: height,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: height,
            transition: "width 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
    </div>
  );
}
