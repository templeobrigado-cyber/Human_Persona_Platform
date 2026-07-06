import { describe, it, expect } from "vitest";
import {
  BIG_FIVE_QUESTIONS,
  diagnoseBigFive,
  type BigFiveAnswers,
  type Rating,
} from "./big-five";

/** 順方向・逆転を意識して「因子を最大化/最小化/中間にする」回答を作る */
function buildAnswers(pick: (q: (typeof BIG_FIVE_QUESTIONS)[number]) => Rating): BigFiveAnswers {
  const answers: BigFiveAnswers = {};
  for (const q of BIG_FIVE_QUESTIONS) {
    answers[q.id] = pick(q);
  }
  return answers;
}

describe("diagnoseBigFive", () => {
  it("全因子を最大化する回答で各因子100になる", () => {
    const answers = buildAnswers((q) => (q.reversed ? 1 : 5));
    const result = diagnoseBigFive(answers);

    for (const score of Object.values(result.scores)) {
      expect(score).toBe(100);
    }
    expect(result.traitVector.creativity).toBe(100);
    // 神経症傾向100 → 安定性0
    expect(result.traitVector.stability).toBe(0);
  });

  it("全因子を最小化する回答で各因子0になる", () => {
    const answers = buildAnswers((q) => (q.reversed ? 5 : 1));
    const result = diagnoseBigFive(answers);

    for (const score of Object.values(result.scores)) {
      expect(score).toBe(0);
    }
    expect(result.traitVector.stability).toBe(100);
  });

  it("すべて中間(3)で回答すると各因子50になる", () => {
    const answers = buildAnswers(() => 3);
    const result = diagnoseBigFive(answers);

    for (const score of Object.values(result.scores)) {
      expect(score).toBe(50);
    }
  });

  it("逆転項目が正しく反転される（開放性のみ逆転項目に強く同意→開放性が下がる）", () => {
    const answers = buildAnswers((q) => {
      if (q.factor !== "openness") return 3;
      return q.reversed ? 5 : 3; // 逆転項目にだけ強く同意
    });
    const result = diagnoseBigFive(answers);

    expect(result.scores.openness).toBeLessThan(50);
    expect(result.scores.conscientiousness).toBe(50);
  });

  it("未回答の設問があるとエラーを投げる", () => {
    const answers = buildAnswers(() => 3);
    delete answers["o1"];

    expect(() => diagnoseBigFive(answers)).toThrow("未回答");
  });

  it("設問は5因子×6問（順方向3・逆転3）で構成されている", () => {
    expect(BIG_FIVE_QUESTIONS).toHaveLength(30);
    const factors = new Map<string, { normal: number; reversed: number }>();
    for (const q of BIG_FIVE_QUESTIONS) {
      const entry = factors.get(q.factor) ?? { normal: 0, reversed: 0 };
      if (q.reversed) entry.reversed += 1;
      else entry.normal += 1;
      factors.set(q.factor, entry);
    }
    expect(factors.size).toBe(5);
    for (const entry of factors.values()) {
      expect(entry).toEqual({ normal: 3, reversed: 3 });
    }
  });
});
