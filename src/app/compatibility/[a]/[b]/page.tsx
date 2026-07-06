import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Card } from "@/components/Card";
import { RadarChart } from "@/components/RadarChart";
import { calcCompatibility, PERSONA_AXES, type CompatibilityRank } from "@/lib/persona-engine";
import { gogyouRelation } from "@/lib/kyusei";
import { PERSONA_AXIS_LABELS } from "@/lib/ui-labels";
import type { StoredResult } from "@/lib/diagnosis-flow";

export const metadata: Metadata = {
  title: "相性診断の結果 | HPP — 人格診断プラットフォーム",
};

const RANK_CAPTIONS: Record<CompatibilityRank, string> = {
  非常に良い:
    "価値観も行動のリズムもよく噛み合う組み合わせ。無理をしなくても自然体のまま支え合える相性です。",
  良い: "基本的な相性は良好。違いはあっても補い合える範囲で、意識的な歩み寄りでさらに深まります。",
  注意: "感じ方や進め方に違いが出やすい組み合わせ。役割分担とこまめなすり合わせが鍵になります。",
  要注意:
    "価値観のズレが大きめの組み合わせ。ただし違いは学びの源泉でもあります。相手の流儀を知ることから始めましょう。",
};

const RELATION_LABELS = {
  souzyou: { label: "相生", description: "互いを生かし、高め合う流れにある関係です", bonus: "+10点" },
  soukoku: { label: "相剋", description: "気質がぶつかりやすい配置。距離感の調整が実を結びます", bonus: "-10点" },
  neutral: { label: "同じ五行", description: "似た気質を持つ、通じ合いやすい間柄です", bonus: "±0点" },
} as const;

async function loadResult(id: string): Promise<StoredResult | null> {
  const diagnosis = await prisma.diagnosis.findUnique({
    where: { id },
    select: { payload: true },
  });
  if (diagnosis == null) return null;
  try {
    return JSON.parse(diagnosis.payload) as StoredResult;
  } catch {
    return null;
  }
}

function PersonChip({
  name,
  result,
  colorClass,
}: {
  name: string;
  result: StoredResult;
  colorClass: string;
}) {
  return (
    <div className="flex-1 rounded-2xl border border-line bg-card p-4 text-center">
      <p className={`text-xs font-bold ${colorClass}`}>{name}</p>
      <p className="mt-1 font-mono text-2xl font-bold">{result.typeCompass.type}</p>
      {result.kyusei && (
        <p className="mt-1 text-sm text-ink-muted">
          {result.kyusei.honmeiseiName}・{result.kyusei.gogyou}
        </p>
      )}
    </div>
  );
}

function BreakdownBar({ label, note, value }: { label: string; note: string; value: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-bold">
          {label} <span className="ml-1 text-xs font-normal text-ink-muted">{note}</span>
        </span>
        <span className="font-mono text-sm">{value}</span>
      </div>
      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-ink/70" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default async function CompatibilityResultPage({
  params,
}: {
  params: Promise<{ a: string; b: string }>;
}) {
  const { a, b } = await params;
  const [resultA, resultB] = await Promise.all([loadResult(a), loadResult(b)]);
  if (resultA == null || resultB == null) notFound();

  const compatibility = calcCompatibility(resultA.profile, resultB.profile);
  const bothFortune = resultA.variant === "fortune" && resultB.variant === "fortune";

  const accentText = bothFortune ? "text-fortune" : "text-business";
  const primaryColor = bothFortune ? "var(--color-chart-fill)" : "var(--color-chart-fill-biz)";
  const secondaryColor = bothFortune ? "var(--color-fortune-accent)" : "#64748b";

  const relation =
    bothFortune && resultA.kyusei && resultB.kyusei
      ? RELATION_LABELS[gogyouRelation(resultA.kyusei.gogyou, resultB.kyusei.gogyou)]
      : null;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <header className="mb-8 text-center">
        <p className={`text-xs font-bold tracking-wide ${accentText}`}>
          {bothFortune ? "占い版" : "組織適性"}
        </p>
        <h1 className="mt-2 text-3xl/tight font-bold">相性診断の結果</h1>
      </header>

      <div className="space-y-6">
        {/* ふたりの概要 */}
        <div className="flex items-center gap-3">
          <PersonChip name="1人目" result={resultA} colorClass={accentText} />
          <span className="shrink-0 text-xl text-ink-muted">×</span>
          <PersonChip name="2人目" result={resultB} colorClass="text-ink-muted" />
        </div>

        {/* スコア */}
        <Card className="text-center">
          <p className="text-sm text-ink-muted">相性スコア</p>
          <p className={`mt-2 font-mono text-6xl font-bold ${accentText}`}>
            {compatibility.score}
            <span className="text-2xl text-ink-muted"> /100</span>
          </p>
          <p
            className={`mt-3 inline-block rounded-full px-4 py-1 text-sm font-bold ${
              bothFortune ? "bg-fortune-soft text-fortune-deep" : "bg-business-soft text-business-deep"
            }`}
          >
            {compatibility.rank}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            {RANK_CAPTIONS[compatibility.rank]}
          </p>
        </Card>

        {/* 内訳 */}
        <Card>
          <h2 className="text-xl font-bold">スコアの内訳</h2>
          <div className="mt-5 space-y-5">
            <BreakdownBar
              label="価値観の近さ"
              note="共感性・安定性・規律性（40%）"
              value={compatibility.breakdown.values}
            />
            <BreakdownBar
              label="性格の近さ"
              note="発信力・創造性・論理性（30%）"
              value={compatibility.breakdown.character}
            />
            <BreakdownBar
              label="動機の近さ"
              note="挑戦心・統率力（30%）"
              value={compatibility.breakdown.motivation}
            />
            {bothFortune && (
              <p className="border-t border-line pt-4 text-sm text-ink-muted">
                五行の相性補正：
                <span className="ml-1 font-mono font-bold text-ink">
                  {compatibility.breakdown.gogyouBonus > 0 && "+"}
                  {compatibility.breakdown.gogyouBonus}点
                </span>
              </p>
            )}
          </div>
        </Card>

        {/* 五行の相性（占い版同士のみ） */}
        {relation && resultA.kyusei && resultB.kyusei && (
          <div className="rounded-2xl border border-fortune-accent/30 bg-fortune-soft p-6 text-center">
            <p className="text-sm text-ink-muted">五行の相性</p>
            <p className="mt-2 text-lg font-bold text-fortune-deep">
              {resultA.kyusei.gogyou}（{resultA.kyusei.honmeiseiName}） ×{" "}
              {resultB.kyusei.gogyou}（{resultB.kyusei.honmeiseiName}）
            </p>
            <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-fortune-accent/40 px-4 py-1 text-sm font-bold text-fortune-accent">
              {relation.label} <span className="font-mono">{relation.bonus}</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{relation.description}</p>
          </div>
        )}

        {/* Personaベクトルの重ね合わせ */}
        <Card>
          <h2 className="text-xl font-bold">ふたりのPersonaベクトル</h2>
          <div className="mt-2 flex justify-center gap-5 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-4 rounded-sm" style={{ background: primaryColor }} />
              1人目
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-0.5 w-4 border-t-2 border-dashed"
                style={{ borderColor: secondaryColor }}
              />
              2人目
            </span>
          </div>
          <div className="mt-3">
            <RadarChart
              title="ふたりのPersonaベクトル比較"
              fillColor={primaryColor}
              items={PERSONA_AXES.map((axis) => ({
                label: PERSONA_AXIS_LABELS[axis],
                value: resultA.profile.vector[axis],
              }))}
              secondary={{
                values: PERSONA_AXES.map((axis) => resultB.profile.vector[axis]),
                fillColor: secondaryColor,
              }}
            />
          </div>
        </Card>

        <p className="text-center">
          <Link
            href="/compatibility"
            className="text-sm text-ink-muted underline underline-offset-4 hover:text-ink"
          >
            別の組み合わせで診断する
          </Link>
        </p>
      </div>
    </main>
  );
}
