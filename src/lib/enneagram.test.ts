import { describe, it, expect } from "vitest";
import {
  ENNEAGRAM_QUESTIONS,
  diagnoseEnneagram,
  type EnneagramAnswers,
  type EnneagramType,
  type Rating,
} from "./enneagram";

function buildAnswers(scoreByType: Partial<Record<EnneagramType, Rating>>): EnneagramAnswers {
  const answers: EnneagramAnswers = {};
  for (const q of ENNEAGRAM_QUESTIONS) {
    answers[q.id] = scoreByType[q.type] ?? 1;
  }
  return answers;
}

describe("diagnoseEnneagram", () => {
  it("タイプ8に強く同意すると基本タイプ8、隣接で高い方の7がウイングになる", () => {
    const answers = buildAnswers({ 8: 5, 7: 4, 9: 2 });
    const result = diagnoseEnneagram(answers);

    expect(result.type).toBe(8);
    expect(result.wing).toBe(7);
    expect(result.typeScores[8]).toBe(100);
    expect(result.typeScores[7]).toBe(75);
    expect(result.typeScores[1]).toBe(0);
  });

  it("タイプ1が最高のとき、ウイングは円環の隣接（9と2）から選ばれる", () => {
    const answers = buildAnswers({ 1: 5, 9: 4, 2: 3 });
    const result = diagnoseEnneagram(answers);

    expect(result.type).toBe(1);
    expect(result.wing).toBe(9);
  });

  it("全タイプ同点の場合は番号が小さいタイプ1が基本タイプ、ウイングは同点タイブレークで2になる", () => {
    const answers = buildAnswers({ 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3 });
    const result = diagnoseEnneagram(answers);

    expect(result.type).toBe(1);
    expect(result.wing).toBe(2); // 隣接9と2が同点 → 小さい番号
    for (const score of Object.values(result.typeScores)) {
      expect(score).toBe(50);
    }
  });

  it("未回答の設問があるとエラーを投げる", () => {
    const answers = buildAnswers({ 8: 5 });
    delete answers["en1a"];

    expect(() => diagnoseEnneagram(answers)).toThrow("未回答");
  });

  it("設問は9タイプ×3問で構成されている", () => {
    expect(ENNEAGRAM_QUESTIONS).toHaveLength(27);
    const counts = new Map<EnneagramType, number>();
    for (const q of ENNEAGRAM_QUESTIONS) {
      counts.set(q.type, (counts.get(q.type) ?? 0) + 1);
    }
    expect(counts.size).toBe(9);
    for (const count of counts.values()) {
      expect(count).toBe(3);
    }
  });
});
