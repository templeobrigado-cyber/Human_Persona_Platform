import { describe, it, expect } from "vitest";
import {
  FLOW_QUESTIONS,
  TOTAL_QUESTIONS,
  PAGE_COUNT,
  QUESTIONS_PER_PAGE,
  questionsForPage,
  sectionOfPage,
  isSectionStart,
  answeredCount,
  isPageComplete,
  isVariant,
  extractShareId,
  type FlowAnswers,
} from "./diagnosis-flow";

describe("診断フローのページ分割", () => {
  it("全81問を6問/ページ×14ページに分割する", () => {
    expect(TOTAL_QUESTIONS).toBe(81);
    expect(PAGE_COUNT).toBe(14);
    expect(questionsForPage(0)).toHaveLength(6);
    expect(questionsForPage(13)).toHaveLength(3); // 最終ページは3問
  });

  it("設問IDは81問すべて一意", () => {
    const ids = new Set(FLOW_QUESTIONS.map((q) => q.id));
    expect(ids.size).toBe(TOTAL_QUESTIONS);
  });

  it("セクションはページ境界と揃っている（タイプコンパス4p→BigFive5p→エニアグラム5p）", () => {
    expect(sectionOfPage(0).id).toBe("typeCompass");
    expect(sectionOfPage(3).id).toBe("typeCompass");
    expect(sectionOfPage(4).id).toBe("bigFive");
    expect(sectionOfPage(8).id).toBe("bigFive");
    expect(sectionOfPage(9).id).toBe("enneagram");
    expect(sectionOfPage(13).id).toBe("enneagram");
    // ページ内でセクションが混ざらない
    for (let p = 0; p < PAGE_COUNT; p++) {
      const sections = new Set(questionsForPage(p).map((q) => q.section));
      expect(sections.size).toBe(1);
    }
  });

  it("セクション先頭ページを判定できる", () => {
    expect(isSectionStart(0)).toBe(true);
    expect(isSectionStart(4)).toBe(true);
    expect(isSectionStart(9)).toBe(true);
    expect(isSectionStart(1)).toBe(false);
    expect(isSectionStart(13)).toBe(false);
  });

  it("範囲外のページはエラーを投げる", () => {
    expect(() => questionsForPage(-1)).toThrow();
    expect(() => questionsForPage(PAGE_COUNT)).toThrow();
  });
});

describe("回答の進捗判定", () => {
  it("回答数を数え、ページ完了を判定できる", () => {
    const answers: FlowAnswers = {};
    expect(answeredCount(answers)).toBe(0);
    expect(isPageComplete(0, answers)).toBe(false);

    for (const q of questionsForPage(0)) answers[q.id] = 3;
    expect(answeredCount(answers)).toBe(QUESTIONS_PER_PAGE);
    expect(isPageComplete(0, answers)).toBe(true);
    expect(isPageComplete(1, answers)).toBe(false);
  });
});

describe("extractShareId", () => {
  it("共有URLからIDを取り出せる", () => {
    expect(extractShareId("http://localhost:3000/r/cmr8xyxxa0000pacfgddig6fq")).toBe(
      "cmr8xyxxa0000pacfgddig6fq"
    );
    expect(extractShareId("https://example.com/r/abc123 ")).toBe("abc123");
  });

  it("生のIDはそのまま返す", () => {
    expect(extractShareId("cmr8xyxxa0000pacfgddig6fq")).toBe("cmr8xyxxa0000pacfgddig6fq");
    expect(extractShareId("  abc123  ")).toBe("abc123");
  });

  it("不正な入力はnullを返す", () => {
    expect(extractShareId("")).toBeNull();
    expect(extractShareId("   ")).toBeNull();
    expect(extractShareId("http://example.com/other/abc")).toBeNull();
    expect(extractShareId("id with spaces")).toBeNull();
  });
});

describe("isVariant", () => {
  it("fortune/businessのみ許可する", () => {
    expect(isVariant("fortune")).toBe(true);
    expect(isVariant("business")).toBe(true);
    expect(isVariant("admin")).toBe(false);
    expect(isVariant("")).toBe(false);
  });
});
