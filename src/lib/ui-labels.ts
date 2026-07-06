// 画面表示用の日本語ラベル定義
// 注意: ユーザー向け表記は「タイプコンパス」。「MBTI」はUI文言に一切出さない。

import type { Axis, Pole } from "./type-compass";
import type { PersonaAxis } from "./persona-engine";

export const AXIS_POLE_LABELS: Record<Axis, { left: Pole; right: Pole; leftLabel: string; rightLabel: string }> = {
  EI: { left: "E", right: "I", leftLabel: "社交型", rightLabel: "内省型" },
  SN: { left: "S", right: "N", leftLabel: "現実型", rightLabel: "発想型" },
  TF: { left: "T", right: "F", leftLabel: "論理型", rightLabel: "共感型" },
  JP: { left: "J", right: "P", leftLabel: "計画型", rightLabel: "柔軟型" },
};

/** Big Fiveレーダーの表示ラベル（traitVector準拠。安定性=神経症傾向の逆転） */
export const BIG_FIVE_RADAR_LABELS = [
  { key: "creativity", label: "創造性" },
  { key: "responsibility", label: "責任感" },
  { key: "sociability", label: "社交性" },
  { key: "empathy", label: "共感性" },
  { key: "stability", label: "安定性" },
] as const;

export const PERSONA_AXIS_LABELS: Record<PersonaAxis, string> = {
  creativity: "創造性",
  leadership: "統率力",
  empathy: "共感性",
  stability: "安定性",
  challenge: "挑戦心",
  logic: "論理性",
  communication: "発信力",
  discipline: "規律性",
};
