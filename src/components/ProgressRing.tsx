import { cn } from "@/lib/utils";

export function ProgressRing({
  value,
  max,
  label,
  unit,
  size = 116,
  tone = "primary",
  className,
}: {
  value: number;
  max: number;
  label: string;
  unit?: string;
  size?: number;
  tone?: "primary" | "water" | "success" | "chart-4";
  className?: string;
}) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const toneClass =
    tone === "water"
      ? "text-water"
      : tone === "success"
        ? "text-success"
        : tone === "chart-4"
          ? "text-chart-4"
          : "text-primary";

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            className="stroke-muted"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            className={cn("fill-none stroke-current transition-all duration-500", toneClass)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="stat-number text-xl">{Math.round(value)}</span>
          <span className="text-[11px] text-muted-foreground">
            / {Math.round(max)}
            {unit}
          </span>
        </div>
      </div>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function ProgressBar({
  value,
  max,
  label,
  unit = "g",
  tone = "primary",
}: {
  value: number;
  max: number;
  label: string;
  unit?: string;
  tone?: "primary" | "water" | "success" | "chart-4";
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const toneClass =
    tone === "water"
      ? "bg-water"
      : tone === "success"
        ? "bg-success"
        : tone === "chart-4"
          ? "bg-chart-4"
          : "bg-primary";
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          <span className="stat-number text-foreground">{Math.round(value)}</span> / {Math.round(max)}
          {unit}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500", toneClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
