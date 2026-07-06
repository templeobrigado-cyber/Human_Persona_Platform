import type { AxisResult } from "@/lib/type-compass";
import type { Variant } from "@/lib/diagnosis-flow";
import { AXIS_POLE_LABELS } from "@/lib/ui-labels";
import { POLE_CAPTIONS } from "@/lib/result-captions";

export function AxisBar({ result, variant }: { result: AxisResult; variant: Variant }) {
  const { left, right, leftLabel, rightLabel } = AXIS_POLE_LABELS[result.axis];
  const leftShare = result.dominant === left ? result.strength : 100 - result.strength;
  const fillClass = variant === "fortune" ? "bg-fortune" : "bg-business";
  const leftDominant = result.dominant === left;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className={leftDominant ? "font-bold" : "text-ink-muted"}>
          <span className="font-mono">{left}</span> {leftLabel}
          {leftDominant && <span className="ml-1.5 font-mono text-xs">{result.strength}%</span>}
        </span>
        <span className={leftDominant ? "text-ink-muted" : "font-bold"}>
          {!leftDominant && <span className="mr-1.5 font-mono text-xs">{result.strength}%</span>}
          {rightLabel} <span className="font-mono">{right}</span>
        </span>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-line">
        <div className={`h-full rounded-full ${fillClass}`} style={{ width: `${leftShare}%` }} />
        <span
          aria-hidden="true"
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-ink shadow-sm"
          style={{ left: `${leftShare}%` }}
        />
      </div>
      <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
        {POLE_CAPTIONS[result.dominant]}
      </p>
    </div>
  );
}
