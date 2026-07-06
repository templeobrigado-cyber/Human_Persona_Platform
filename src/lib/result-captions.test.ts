import { describe, it, expect } from "vitest";
import {
  POLE_CAPTIONS,
  KYUSEI_CAPTIONS,
  ENNEAGRAM_CAPTIONS,
  BIG_FIVE_CAPTIONS,
  captionBand,
} from "./result-captions";

// キャプションは「150文字程度」の仕様。極端に短い／長いものが紛れ込むのを防ぐ
const MIN_LENGTH = 100;
const MAX_LENGTH = 200;

function expectCaptionQuality(label: string, caption: string) {
  expect(caption.length, `${label} の文字数 (${caption.length})`).toBeGreaterThanOrEqual(MIN_LENGTH);
  expect(caption.length, `${label} の文字数 (${caption.length})`).toBeLessThanOrEqual(MAX_LENGTH);
  // 特徴＋長所＋短所の構成になっていること
  expect(caption, `${label} に「長所」がない`).toContain("長所");
  expect(caption, `${label} に短所・弱点の言及がない`).toMatch(/短所|一方で/);
}

describe("result-captions", () => {
  it("タイプコンパス8ポールすべてに150文字程度のキャプションがある", () => {
    const poles = Object.keys(POLE_CAPTIONS);
    expect(poles.sort()).toEqual(["E", "F", "I", "J", "N", "P", "S", "T"]);
    for (const [pole, caption] of Object.entries(POLE_CAPTIONS)) {
      expectCaptionQuality(`ポール${pole}`, caption);
    }
  });

  it("本命星9種すべてに150文字程度のキャプションがある", () => {
    expect(Object.keys(KYUSEI_CAPTIONS)).toHaveLength(9);
    for (const [star, caption] of Object.entries(KYUSEI_CAPTIONS)) {
      expectCaptionQuality(`本命星${star}`, caption);
    }
  });

  it("エニアグラム9タイプすべてに150文字程度のキャプションがある", () => {
    expect(Object.keys(ENNEAGRAM_CAPTIONS)).toHaveLength(9);
    for (const [type, caption] of Object.entries(ENNEAGRAM_CAPTIONS)) {
      expectCaptionQuality(`タイプ${type}`, caption);
    }
  });

  it("Big Five 5因子×3スコア帯すべてに150文字程度のキャプションがある", () => {
    const factors = Object.keys(BIG_FIVE_CAPTIONS);
    expect(factors.sort()).toEqual(["creativity", "empathy", "responsibility", "sociability", "stability"]);
    for (const [factor, bands] of Object.entries(BIG_FIVE_CAPTIONS)) {
      expect(Object.keys(bands).sort()).toEqual(["balanced", "high", "low"]);
      for (const [band, caption] of Object.entries(bands)) {
        expectCaptionQuality(`${factor}/${band}`, caption);
      }
    }
  });

  it("captionBandは高め≥60／中間41〜59／低め≤40で判定する", () => {
    expect(captionBand(100)).toBe("high");
    expect(captionBand(60)).toBe("high");
    expect(captionBand(59)).toBe("balanced");
    expect(captionBand(50)).toBe("balanced");
    expect(captionBand(41)).toBe("balanced");
    expect(captionBand(40)).toBe("low");
    expect(captionBand(0)).toBe("low");
  });

  it("UI文言に「MBTI」を含まない", () => {
    const all = [
      ...Object.values(POLE_CAPTIONS),
      ...Object.values(KYUSEI_CAPTIONS),
      ...Object.values(ENNEAGRAM_CAPTIONS),
      ...Object.values(BIG_FIVE_CAPTIONS).flatMap((bands) => Object.values(bands)),
    ].join("");
    expect(all).not.toMatch(/MBTI/i);
  });
});
