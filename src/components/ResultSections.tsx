// 診断結果の表示セクション（純粋な表示コンポーネント）
// 通常の結果画面（ResultView）と共有ページ（/r/[id]）の両方から使う。
// Server Componentからも描画できるよう、フックやブラウザAPIは使わない。

import Link from "next/link";
import { Card } from "./Card";
import { Button } from "./Button";
import { AxisBar } from "./AxisBar";
import { RadarChart } from "./RadarChart";
import { KyuseiCard } from "./KyuseiCard";
import type { StoredResult } from "@/lib/diagnosis-flow";
import { ENNEAGRAM_TYPE_NAMES } from "@/lib/enneagram";
import { PERSONA_AXES } from "@/lib/persona-engine";
import { BIG_FIVE_RADAR_LABELS, PERSONA_AXIS_LABELS } from "@/lib/ui-labels";
import {
  BIG_FIVE_CAPTIONS,
  CAPTION_BAND_LABELS,
  ENNEAGRAM_CAPTIONS,
  captionBand,
} from "@/lib/result-captions";

export function ResultSections({
  result,
  retryLabel = "もう一度診断する",
  compatibilityHref,
}: {
  result: StoredResult;
  retryLabel?: string;
  /** 相性診断への導線（共有IDをプリセットしたURL） */
  compatibilityHref?: string;
}) {
  const variant = result.variant;
  const isFortune = variant === "fortune";
  const accentText = isFortune ? "text-fortune" : "text-business";
  const chartColor = isFortune ? "var(--color-chart-fill)" : "var(--color-chart-fill-biz)";

  return (
    <div className="space-y-6">
      {/* タイプコンパス */}
      <Card>
        <h2 className="text-xl font-bold">タイプコンパス</h2>
        <p className={`mt-4 text-center font-mono text-5xl font-bold tracking-widest ${accentText}`}>
          {result.typeCompass.type}
        </p>
        <div className="mt-8 space-y-5">
          {result.typeCompass.axisResults.map((axis) => (
            <AxisBar key={axis.axis} result={axis} variant={variant} />
          ))}
        </div>
      </Card>

      {/* Big Five レーダー */}
      <Card>
        <h2 className="text-xl font-bold">Big Five</h2>
        <p className="mt-1 text-sm text-ink-muted">5つの特性のバランス</p>
        <div className="mt-4">
          <RadarChart
            title="Big Fiveの特性スコア"
            fillColor={chartColor}
            items={BIG_FIVE_RADAR_LABELS.map(({ key, label }) => ({
              label,
              value: result.bigFive.traitVector[key],
            }))}
          />
        </div>
        <div className="mt-6 space-y-5 border-t border-line pt-6">
          {BIG_FIVE_RADAR_LABELS.map(({ key, label }) => {
            const score = result.bigFive.traitVector[key];
            const band = captionBand(score);
            return (
              <div key={key}>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-base font-bold">{label}</h3>
                  <span className="font-mono text-sm text-ink-muted">{score}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      isFortune ? "bg-fortune-soft text-fortune-deep" : "bg-business-soft text-business-deep"
                    }`}
                  >
                    {CAPTION_BAND_LABELS[band]}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  {BIG_FIVE_CAPTIONS[key][band]}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* エニアグラム（企業版のみ） */}
      {!isFortune && (
        <Card>
          <h2 className="text-xl font-bold">エニアグラム</h2>
          <p className="mt-4 text-center">
            <span className="font-mono text-4xl font-bold text-business">
              タイプ{result.enneagram.type}
            </span>
          </p>
          <p className="mt-2 text-center text-lg font-bold">
            {ENNEAGRAM_TYPE_NAMES[result.enneagram.type]}
          </p>
          <p className="mt-1 text-center text-sm text-ink-muted">
            ウイング：タイプ{result.enneagram.wing}（{ENNEAGRAM_TYPE_NAMES[result.enneagram.wing]}）
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            {ENNEAGRAM_CAPTIONS[result.enneagram.type]}
          </p>
        </Card>
      )}

      {/* 九星気学（占い版のみ） */}
      {isFortune && result.kyusei && <KyuseiCard result={result.kyusei} />}

      {/* Personaベクトル */}
      <Card>
        <h2 className="text-xl font-bold">Personaベクトル</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {isFortune
            ? "4つの理論を統合した、あなたの人格のかたち"
            : "3つの理論を統合した、あなたの人格のかたち"}
        </p>
        <div className="mt-4">
          <RadarChart
            title="Personaベクトル8軸"
            fillColor={chartColor}
            items={PERSONA_AXES.map((axis) => ({
              label: PERSONA_AXIS_LABELS[axis],
              value: result.profile.vector[axis],
            }))}
          />
        </div>
      </Card>

      {/* AI鑑定 / AI分析（プレースホルダー） */}
      <Card className={isFortune ? "border-dashed bg-fortune-soft/50" : "border-dashed bg-business-soft/50"}>
        <h2 className="text-xl font-bold">{isFortune ? "AI鑑定" : "AI分析"}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {isFortune
            ? "あなたの星と性格から、AIが鑑定文を生成します（近日公開）"
            : "診断データからAIが強み・適性レポートを生成します（近日公開）"}
        </p>
      </Card>

      {/* 相性診断への導線 */}
      {compatibilityHref && (
        <Card className="text-center">
          <h2 className="text-xl font-bold">ふたりの相性を診断する</h2>
          <p className="mt-2 text-sm text-ink-muted">
            {isFortune
              ? "気になる相手の結果URLと組み合わせて、五行も含めた相性を占えます"
              : "メンバー同士の結果URLを組み合わせて、チーム適性を分析できます"}
          </p>
          <p className="mt-4">
            <Link
              href={compatibilityHref}
              className={`inline-flex min-h-11 items-center justify-center rounded-full border-2 px-6 text-base font-bold transition-colors ${
                isFortune
                  ? "border-fortune text-fortune hover:bg-fortune-soft"
                  : "border-business text-business hover:bg-business-soft"
              }`}
            >
              相性診断へ →
            </Link>
          </p>
        </Card>
      )}

      {/* 購入CTA（ダミー） */}
      <div className="text-center">
        <Button tone={variant} className="w-full sm:w-auto sm:px-12">
          詳細レポートを購入する（準備中）
        </Button>
        <p className="mt-6">
          <Link
            href={`/diagnosis/${variant}/start`}
            className="text-sm text-ink-muted underline underline-offset-4 hover:text-ink"
          >
            {retryLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
