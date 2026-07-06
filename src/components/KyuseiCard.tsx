import type { KyuseiResult } from "@/lib/kyusei";
import { KYUSEI_CAPTIONS } from "@/lib/result-captions";

export function KyuseiCard({ result }: { result: KyuseiResult }) {
  return (
    <div className="rounded-2xl border border-fortune-accent/30 bg-fortune-soft p-6 text-center">
      <p className="text-sm text-ink-muted">あなたの本命星</p>
      <p className="mt-2 text-3xl font-bold tracking-wide text-fortune-deep">
        {result.honmeiseiName}
      </p>
      <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-fortune-accent/40 px-4 py-1 text-sm font-bold text-fortune-accent">
        五行 <span className="text-lg">{result.gogyou}</span>
      </p>
      <p className="mt-4 text-left text-sm leading-relaxed text-ink-muted">
        {KYUSEI_CAPTIONS[result.honmeisei]}
      </p>
    </div>
  );
}
