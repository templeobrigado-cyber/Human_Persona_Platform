import { describe, it, expect } from "vitest";
import {
  calcHonmeisei,
  diagnoseKyusei,
  kigakuYear,
  gogyouRelation,
  gogyouCompatibilityBonus,
} from "./kyusei";

describe("kigakuYear（節分基準の年）", () => {
  it("立春（2/4）以降の生まれはその年扱い", () => {
    expect(kigakuYear({ year: 1990, month: 2, day: 4 })).toBe(1990);
    expect(kigakuYear({ year: 1990, month: 6, day: 15 })).toBe(1990);
  });

  it("立春より前（1月〜2/3）の生まれは前年扱い", () => {
    expect(kigakuYear({ year: 1990, month: 2, day: 3 })).toBe(1989);
    expect(kigakuYear({ year: 1990, month: 1, day: 20 })).toBe(1989);
  });

  it("存在しない日付はエラーを投げる", () => {
    expect(() => kigakuYear({ year: 1990, month: 2, day: 30 })).toThrow("存在しない日付");
    expect(() => kigakuYear({ year: 1990, month: 13, day: 1 })).toThrow();
  });
});

describe("calcHonmeisei（本命星）", () => {
  it("1990年生まれ（立春以降）は一白水星", () => {
    // 1990 → 1+9+9+0=19 → 1+9=10 → 1+0=1 → 11-1=10 → 10-9=1
    expect(calcHonmeisei({ year: 1990, month: 6, day: 15 })).toBe(1);
  });

  it("1990年1月生まれは前年1989年扱いで二黒土星", () => {
    // 1989 → 27 → 9 → 11-9=2
    expect(calcHonmeisei({ year: 1990, month: 1, day: 20 })).toBe(2);
  });

  it("本命星は9年周期で循環する", () => {
    const base = calcHonmeisei({ year: 1981, month: 5, day: 22 });
    expect(calcHonmeisei({ year: 1990, month: 5, day: 22 })).toBe(base);
    expect(calcHonmeisei({ year: 1999, month: 5, day: 22 })).toBe(base);
  });
});

describe("diagnoseKyusei（本命星＋五行）", () => {
  it("一白水星の五行は水", () => {
    const result = diagnoseKyusei({ year: 1990, month: 6, day: 15 });
    expect(result.honmeisei).toBe(1);
    expect(result.honmeiseiName).toBe("一白水星");
    expect(result.gogyou).toBe("水");
  });

  it("二黒土星の五行は土", () => {
    const result = diagnoseKyusei({ year: 1989, month: 6, day: 15 });
    expect(result.honmeiseiName).toBe("二黒土星");
    expect(result.gogyou).toBe("土");
  });
});

describe("五行相性", () => {
  it("相生の関係（木→火、水→木など）は+10点", () => {
    expect(gogyouRelation("木", "火")).toBe("souzyou");
    expect(gogyouRelation("火", "木")).toBe("souzyou"); // 方向によらず相生
    expect(gogyouCompatibilityBonus("水", "木")).toBe(10);
    expect(gogyouCompatibilityBonus("金", "水")).toBe(10);
  });

  it("相剋の関係（木⇔土、水⇔火など）は-10点", () => {
    expect(gogyouRelation("木", "土")).toBe("soukoku");
    expect(gogyouRelation("土", "木")).toBe("soukoku");
    expect(gogyouCompatibilityBonus("水", "火")).toBe(-10);
    expect(gogyouCompatibilityBonus("金", "木")).toBe(-10);
  });

  it("同じ五行同士は±0点（異なる五行は必ず相生か相剋になる）", () => {
    for (const g of ["木", "火", "土", "金", "水"] as const) {
      expect(gogyouRelation(g, g)).toBe("neutral");
      expect(gogyouCompatibilityBonus(g, g)).toBe(0);
    }
  });
});
