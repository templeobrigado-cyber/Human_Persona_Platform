import type { Variant } from "@/lib/diagnosis-flow";

export function ProgressBar({
  value,
  max,
  variant,
}: {
  value: number;
  max: number;
  variant: Variant;
}) {
  const percent = Math.round((value / max) * 100);
  const fillClass = variant === "fortune" ? "bg-fortune" : "bg-business";

  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label="診断の進捗"
        className="h-2 flex-1 overflow-hidden rounded-full bg-line"
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${fillClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="shrink-0 font-mono text-sm text-ink-muted">
        {value} / {max}
      </span>
    </div>
  );
}
