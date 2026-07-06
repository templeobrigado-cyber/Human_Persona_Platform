// 九星気学ロジック（占い版のみ）
// 設計書「01_人格診断ロジック設計書.md」の算出式に基づく。
// 本命星は生年月日のみで一意に決まる（追加設問は不要）。
//
// 注意: 立春の区切りは設計書どおり2/4固定の簡易版。実際の立春は年により2/3〜2/5に
// ずれるため、Phase3で bodyclystal/lib/kyusei.ts の節入りロジックを移植する際に精密化する。

export type HonmeiseiNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Gogyou = "木" | "火" | "土" | "金" | "水";

export interface BirthDate {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
}

export interface KyuseiResult {
  honmeisei: HonmeiseiNumber;
  honmeiseiName: string;
  gogyou: Gogyou;
}

export const KYUSEI_NAMES: Record<HonmeiseiNumber, string> = {
  1: "一白水星",
  2: "二黒土星",
  3: "三碧木星",
  4: "四緑木星",
  5: "五黄土星",
  6: "六白金星",
  7: "七赤金星",
  8: "八白土星",
  9: "九紫火星",
};

export const KYUSEI_GOGYOU: Record<HonmeiseiNumber, Gogyou> = {
  1: "水",
  2: "土",
  3: "木",
  4: "木",
  5: "土",
  6: "金",
  7: "金",
  8: "土",
  9: "火",
};

function digitSumToSingle(n: number): number {
  let s = n;
  while (s >= 10) {
    s = String(s)
      .split("")
      .reduce((acc, d) => acc + Number(d), 0);
  }
  return s;
}

function validateBirthDate({ year, month, day }: BirthDate): void {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new Error(`生年月日が不正です: ${year}-${month}-${day}`);
  }
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    throw new Error(`存在しない日付です: ${year}-${month}-${day}`);
  }
}

/** 節分基準の「気学上の年」。立春（2/4・簡易版）より前の生まれは前年扱い */
export function kigakuYear(birth: BirthDate): number {
  validateBirthDate(birth);
  const { year, month, day } = birth;
  if (month < 2 || (month === 2 && day < 4)) {
    return year - 1;
  }
  return year;
}

export function calcHonmeisei(birth: BirthDate): HonmeiseiNumber {
  const year = kigakuYear(birth);
  const s = digitSumToSingle(year);
  let n = 11 - s;
  if (n >= 10) n -= 9;
  return n as HonmeiseiNumber;
}

export function diagnoseKyusei(birth: BirthDate): KyuseiResult {
  const honmeisei = calcHonmeisei(birth);
  return {
    honmeisei,
    honmeiseiName: KYUSEI_NAMES[honmeisei],
    gogyou: KYUSEI_GOGYOU[honmeisei],
  };
}

// --- 五行相性（相性診断の±10点補正に使用） ---

/** 相生（高め合う）：木→火→土→金→水→木 */
const SOUJOU: Record<Gogyou, Gogyou> = {
  木: "火",
  火: "土",
  土: "金",
  金: "水",
  水: "木",
};

/** 相剋（打ち消し合う）：木⇔土、土⇔水、水⇔火、火⇔金、金⇔木 */
const SOUKOKU: Record<Gogyou, Gogyou> = {
  木: "土",
  土: "水",
  水: "火",
  火: "金",
  金: "木",
};

export type GogyouRelation = "souzyou" | "soukoku" | "neutral";

export function gogyouRelation(a: Gogyou, b: Gogyou): GogyouRelation {
  if (SOUJOU[a] === b || SOUJOU[b] === a) return "souzyou";
  if (SOUKOKU[a] === b || SOUKOKU[b] === a) return "soukoku";
  return "neutral";
}

/** 相生+10 / 相剋-10 / それ以外（同じ五行含む）±0 */
export function gogyouCompatibilityBonus(a: Gogyou, b: Gogyou): number {
  switch (gogyouRelation(a, b)) {
    case "souzyou":
      return 10;
    case "soukoku":
      return -10;
    default:
      return 0;
  }
}
