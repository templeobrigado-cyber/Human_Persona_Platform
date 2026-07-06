import { describe, it, expect } from "vitest";
import { TYPE_COMPASS_QUESTIONS, diagnoseTypeCompass, type TypeCompassAnswers } from "./type-compass";
import { BIG_FIVE_QUESTIONS, diagnoseBigFive, type BigFiveAnswers } from "./big-five";
import { ENNEAGRAM_QUESTIONS, diagnoseEnneagram, type EnneagramAnswers } from "./enneagram";
import { diagnoseKyusei } from "./kyusei";
import {
  PERSONA_AXES,
  buildPersonaProfile,
  buildPersonaProfileFortune,
  calcCompatibility,
  personaFromKyusei,
} from "./persona-engine";

function neutralInput() {
  const tcAnswers: TypeCompassAnswers = {};
  for (const q of TYPE_COMPASS_QUESTIONS) tcAnswers[q.id] = 3;
  const bfAnswers: BigFiveAnswers = {};
  for (const q of BIG_FIVE_QUESTIONS) bfAnswers[q.id] = 3;
  const enAnswers: EnneagramAnswers = {};
  for (const q of ENNEAGRAM_QUESTIONS) enAnswers[q.id] = 3;

  return {
    typeCompass: diagnoseTypeCompass(tcAnswers),
    bigFive: diagnoseBigFive(bfAnswers),
    enneagram: diagnoseEnneagram(enAnswers),
  };
}

describe("buildPersonaProfile（企業版・共通コア）", () => {
  it("すべて中間回答なら全軸50になる（重みの合計が1であることの検証）", () => {
    const profile = buildPersonaProfile(neutralInput());

    expect(profile.variant).toBe("standard");
    for (const axis of PERSONA_AXES) {
      expect(profile.vector[axis]).toBe(50);
    }
  });

  it("九星気学を一切参照しない（生年月日なしで算出できる）", () => {
    // 型レベルでkyuseiを受け取らないことが仕様。実行時にも8軸すべて算出されること。
    const profile = buildPersonaProfile(neutralInput());
    expect(Object.keys(profile.vector).sort()).toEqual([...PERSONA_AXES].sort());
  });
});

describe("buildPersonaProfileFortune（占い版）", () => {
  it("五行の加点対象軸だけが企業版より高くなる", () => {
    const input = neutralInput();
    const kyusei = diagnoseKyusei({ year: 1990, month: 6, day: 15 }); // 一白水星・水
    const fortune = buildPersonaProfileFortune({ ...input, kyusei });

    expect(fortune.variant).toBe("fortune");
    expect(fortune.gogyou).toBe("水");
    // 水 → Empathy・Logic に加点
    expect(fortune.gogyouBonus).toEqual({ empathy: 30, logic: 30 });
    // 中間回答（各診断50）＋九星ベース50なので、加点軸は50+30*0.3=59、他は50
    expect(fortune.vector.empathy).toBe(59);
    expect(fortune.vector.logic).toBe(59);
    expect(fortune.vector.creativity).toBe(50);
    expect(fortune.vector.stability).toBe(50);
  });

  it("personaFromKyuseiは五行対応表どおりに加点する", () => {
    const kyusei = diagnoseKyusei({ year: 1989, month: 6, day: 15 }); // 二黒土星・土
    const { vector, bonus } = personaFromKyusei(kyusei);

    // 土 → Stability・Discipline
    expect(bonus).toEqual({ stability: 30, discipline: 30 });
    expect(vector.stability).toBe(80);
    expect(vector.discipline).toBe(80);
    expect(vector.creativity).toBe(50);
  });
});

describe("calcCompatibility（相性ロジック）", () => {
  it("同一プロフィール同士は100点で「非常に良い」", () => {
    const profile = buildPersonaProfile(neutralInput());
    const result = calcCompatibility(profile, profile);

    expect(result.score).toBe(100);
    expect(result.rank).toBe("非常に良い");
    expect(result.breakdown.gogyouBonus).toBe(0);
  });

  it("占い版同士は五行相性の±10点補正が入る", () => {
    const input = neutralInput();
    const mizu = buildPersonaProfileFortune({
      ...input,
      kyusei: diagnoseKyusei({ year: 1990, month: 6, day: 15 }), // 水
    });
    const tsuchi = buildPersonaProfileFortune({
      ...input,
      kyusei: diagnoseKyusei({ year: 1989, month: 6, day: 15 }), // 土
    });
    const ki = buildPersonaProfileFortune({
      ...input,
      kyusei: diagnoseKyusei({ year: 1988, month: 6, day: 15 }), // 三碧木星・木
    });

    // 水⇔土は相剋 → -10
    expect(calcCompatibility(mizu, tsuchi).breakdown.gogyouBonus).toBe(-10);
    // 水→木は相生 → +10（スコアは100でクランプ）
    const souzyou = calcCompatibility(mizu, ki);
    expect(souzyou.breakdown.gogyouBonus).toBe(10);
    expect(souzyou.score).toBeLessThanOrEqual(100);
  });

  it("企業版プロフィールが混ざる場合は五行補正を適用しない", () => {
    const input = neutralInput();
    const standard = buildPersonaProfile(input);
    const fortune = buildPersonaProfileFortune({
      ...input,
      kyusei: diagnoseKyusei({ year: 1990, month: 6, day: 15 }),
    });

    expect(calcCompatibility(standard, fortune).breakdown.gogyouBonus).toBe(0);
  });
});
