// Persona Engine — 各診断結果を8次元のPersonaベクトルに統合する
// 設計書「01_人格診断ロジック設計書.md」の統合モデルに基づく。
//
// 企業版（共通コア）: タイプコンパス30% + BigFive50% + エニアグラム20%
// 占い版           : タイプコンパス20% + BigFive35% + エニアグラム15% + 九星気学30%
//
// 企業版のスコアは九星気学を一切参照しない。

import type { TypeCompassResult } from "./type-compass";
import type { BigFiveResult } from "./big-five";
import type { EnneagramResult, EnneagramType } from "./enneagram";
import type { KyuseiResult, Gogyou } from "./kyusei";
import { gogyouCompatibilityBonus } from "./kyusei";

export type PersonaAxis =
  | "creativity"
  | "leadership"
  | "empathy"
  | "stability"
  | "challenge"
  | "logic"
  | "communication"
  | "discipline";

/** 各軸0〜100 */
export type PersonaVector = Record<PersonaAxis, number>;

export const PERSONA_AXES: PersonaAxis[] = [
  "creativity",
  "leadership",
  "empathy",
  "stability",
  "challenge",
  "logic",
  "communication",
  "discipline",
];

export interface PersonaProfile {
  variant: "standard";
  vector: PersonaVector;
}

export interface PersonaProfileFortune {
  variant: "fortune";
  vector: PersonaVector;
  gogyou: Gogyou;
  /** 五行による加点内訳（DB: persona_profiles_fortune.gogyou_bonus） */
  gogyouBonus: Partial<Record<PersonaAxis, number>>;
}

// --- 各診断 → Personaベクトル変換 ---

/**
 * タイプコンパスの特性値（各ポールの割合%）をPersona軸へ写像する。
 * 単独ポールで表せない軸（leadership等）は2ポールの平均で近似する。
 */
export function personaFromTypeCompass(result: TypeCompassResult): PersonaVector {
  const t = result.traitVector;
  return {
    creativity: t.creativity,
    logic: t.logic,
    empathy: t.empathy,
    communication: t.sociability,
    discipline: t.planning,
    leadership: Math.round((t.sociability + t.logic) / 2),
    challenge: Math.round((t.creativity + t.flexibility) / 2),
    stability: Math.round((t.realism + t.planning) / 2),
  };
}

/**
 * Big Five → Persona軸。設計書の対応（開放性→創造性、誠実性→責任感、
 * 外向性→社交性、協調性→共感性、神経症傾向→安定性(逆転)）を基礎に、
 * 残りの軸は関連因子の平均で構成する。
 */
export function personaFromBigFive(result: BigFiveResult): PersonaVector {
  const s = result.scores;
  const stability = 100 - s.neuroticism;
  return {
    creativity: s.openness,
    discipline: s.conscientiousness,
    communication: s.extraversion,
    empathy: s.agreeableness,
    stability,
    leadership: Math.round((s.extraversion + s.conscientiousness) / 2),
    challenge: Math.round((s.openness + s.extraversion) / 2),
    logic: Math.round((s.conscientiousness + stability) / 2),
  };
}

/** 各Persona軸に寄与するエニアグラムタイプ（独自設計のマッピング） */
const ENNEAGRAM_AXIS_SOURCES: Record<PersonaAxis, EnneagramType[]> = {
  creativity: [4, 5, 7],
  leadership: [3, 8],
  empathy: [2, 4, 9],
  stability: [6, 9],
  challenge: [3, 7, 8],
  logic: [1, 5],
  communication: [2, 7],
  discipline: [1, 6],
};

export function personaFromEnneagram(result: EnneagramResult): PersonaVector {
  const vector = {} as PersonaVector;
  for (const axis of PERSONA_AXES) {
    const sources = ENNEAGRAM_AXIS_SOURCES[axis];
    const avg = sources.reduce((acc, t) => acc + result.typeScores[t], 0) / sources.length;
    vector[axis] = Math.round(avg);
  }
  return vector;
}

/** 五行 → 加点する軸（設計書の対応表） */
const GOGYOU_AXES: Record<Gogyou, PersonaAxis[]> = {
  木: ["creativity", "challenge"],
  火: ["leadership", "communication"],
  土: ["stability", "discipline"],
  金: ["logic", "discipline"],
  水: ["empathy", "logic"],
};

const KYUSEI_BASE_SCORE = 50;
const KYUSEI_BONUS = 30;

export function personaFromKyusei(result: KyuseiResult): {
  vector: PersonaVector;
  bonus: Partial<Record<PersonaAxis, number>>;
} {
  const vector = {} as PersonaVector;
  const bonus: Partial<Record<PersonaAxis, number>> = {};
  const boosted = GOGYOU_AXES[result.gogyou];

  for (const axis of PERSONA_AXES) {
    if (boosted.includes(axis)) {
      vector[axis] = KYUSEI_BASE_SCORE + KYUSEI_BONUS;
      bonus[axis] = KYUSEI_BONUS;
    } else {
      vector[axis] = KYUSEI_BASE_SCORE;
    }
  }
  return { vector, bonus };
}

// --- 統合 ---

function blend(parts: Array<{ vector: PersonaVector; weight: number }>): PersonaVector {
  const result = {} as PersonaVector;
  for (const axis of PERSONA_AXES) {
    const value = parts.reduce((acc, p) => acc + p.vector[axis] * p.weight, 0);
    result[axis] = Math.round(value);
  }
  return result;
}

export interface PersonaEngineInput {
  typeCompass: TypeCompassResult;
  bigFive: BigFiveResult;
  enneagram: EnneagramResult;
}

/** 共通コア（企業版）: タイプコンパス30% + BigFive50% + エニアグラム20% */
export function buildPersonaProfile(input: PersonaEngineInput): PersonaProfile {
  const vector = blend([
    { vector: personaFromTypeCompass(input.typeCompass), weight: 0.3 },
    { vector: personaFromBigFive(input.bigFive), weight: 0.5 },
    { vector: personaFromEnneagram(input.enneagram), weight: 0.2 },
  ]);
  return { variant: "standard", vector };
}

/** 占い版: タイプコンパス20% + BigFive35% + エニアグラム15% + 九星気学30% */
export function buildPersonaProfileFortune(
  input: PersonaEngineInput & { kyusei: KyuseiResult }
): PersonaProfileFortune {
  const kyusei = personaFromKyusei(input.kyusei);
  const vector = blend([
    { vector: personaFromTypeCompass(input.typeCompass), weight: 0.2 },
    { vector: personaFromBigFive(input.bigFive), weight: 0.35 },
    { vector: personaFromEnneagram(input.enneagram), weight: 0.15 },
    { vector: kyusei.vector, weight: 0.3 },
  ]);
  return {
    variant: "fortune",
    vector,
    gogyou: input.kyusei.gogyou,
    gogyouBonus: kyusei.bonus,
  };
}

// --- 相性ロジック ---
// 共通コア: 相性 = 価値観40% + 性格30% + 動機30%
// 占い版: 上記に五行相性の±10点補正を加える

const VALUES_AXES: PersonaAxis[] = ["empathy", "stability", "discipline"]; // 価値観
const CHARACTER_AXES: PersonaAxis[] = ["communication", "creativity", "logic"]; // 性格
const MOTIVATION_AXES: PersonaAxis[] = ["challenge", "leadership"]; // 動機

export type CompatibilityRank = "非常に良い" | "良い" | "注意" | "要注意";

export interface CompatibilityResult {
  score: number; // 0〜100
  rank: CompatibilityRank;
  breakdown: {
    values: number;
    character: number;
    motivation: number;
    gogyouBonus: number;
  };
}

/** 軸グループごとの近さ（差が小さいほど100に近い）の平均 */
function similarity(a: PersonaVector, b: PersonaVector, axes: PersonaAxis[]): number {
  const sum = axes.reduce((acc, axis) => acc + (100 - Math.abs(a[axis] - b[axis])), 0);
  return sum / axes.length;
}

function rankOf(score: number): CompatibilityRank {
  if (score >= 80) return "非常に良い";
  if (score >= 60) return "良い";
  if (score >= 40) return "注意";
  return "要注意";
}

export function calcCompatibility(
  a: PersonaProfile | PersonaProfileFortune,
  b: PersonaProfile | PersonaProfileFortune
): CompatibilityResult {
  const values = similarity(a.vector, b.vector, VALUES_AXES);
  const character = similarity(a.vector, b.vector, CHARACTER_AXES);
  const motivation = similarity(a.vector, b.vector, MOTIVATION_AXES);

  // 五行補正は両者とも占い版プロフィールの場合のみ適用する
  const gogyouBonus =
    a.variant === "fortune" && b.variant === "fortune"
      ? gogyouCompatibilityBonus(a.gogyou, b.gogyou)
      : 0;

  const raw = values * 0.4 + character * 0.3 + motivation * 0.3 + gogyouBonus;
  const score = Math.round(Math.min(100, Math.max(0, raw)));

  return {
    score,
    rank: rankOf(score),
    breakdown: {
      values: Math.round(values),
      character: Math.round(character),
      motivation: Math.round(motivation),
      gogyouBonus,
    },
  };
}
