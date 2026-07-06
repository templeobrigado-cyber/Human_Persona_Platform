// 診断フローの純ロジック（UIから独立させてテスト可能にする）
// 81問（タイプコンパス24＋Big Five 30＋エニアグラム27）を6問/ページに分割する。

import { TYPE_COMPASS_QUESTIONS, type TypeCompassResult } from "./type-compass";
import { BIG_FIVE_QUESTIONS, type BigFiveResult } from "./big-five";
import { ENNEAGRAM_QUESTIONS, type EnneagramResult } from "./enneagram";
import type { BirthDate, KyuseiResult } from "./kyusei";
import type { PersonaProfile, PersonaProfileFortune } from "./persona-engine";

export const VARIANTS = ["fortune", "business"] as const;
export type Variant = (typeof VARIANTS)[number];

export function isVariant(value: string): value is Variant {
  return (VARIANTS as readonly string[]).includes(value);
}

export type Rating = 1 | 2 | 3 | 4 | 5;
export type FlowAnswers = Record<string, Rating>;

export type SectionId = "typeCompass" | "bigFive" | "enneagram";

export interface FlowSection {
  id: SectionId;
  part: number;
  title: string;
  description: string;
}

export const FLOW_SECTIONS: FlowSection[] = [
  {
    id: "typeCompass",
    part: 1,
    title: "考え方のスタイル",
    description: "ものごとへの向き合い方についてお聞きします。",
  },
  {
    id: "bigFive",
    part: 2,
    title: "行動のスタイル",
    description: "ふだんの行動や感じ方についてお聞きします。",
  },
  {
    id: "enneagram",
    part: 3,
    title: "動機のスタイル",
    description: "何があなたを動かすのかについてお聞きします。",
  },
];

export interface FlowQuestion {
  id: string;
  text: string;
  section: SectionId;
}

export const FLOW_QUESTIONS: FlowQuestion[] = [
  ...TYPE_COMPASS_QUESTIONS.map((q) => ({ id: q.id, text: q.text, section: "typeCompass" as const })),
  ...BIG_FIVE_QUESTIONS.map((q) => ({ id: q.id, text: q.text, section: "bigFive" as const })),
  ...ENNEAGRAM_QUESTIONS.map((q) => ({ id: q.id, text: q.text, section: "enneagram" as const })),
];

export const TOTAL_QUESTIONS = FLOW_QUESTIONS.length;
export const QUESTIONS_PER_PAGE = 6;
export const PAGE_COUNT = Math.ceil(TOTAL_QUESTIONS / QUESTIONS_PER_PAGE);

export function questionsForPage(page: number): FlowQuestion[] {
  if (page < 0 || page >= PAGE_COUNT) {
    throw new Error(`ページ番号が不正です: ${page}`);
  }
  return FLOW_QUESTIONS.slice(page * QUESTIONS_PER_PAGE, (page + 1) * QUESTIONS_PER_PAGE);
}

export function sectionOfPage(page: number): FlowSection {
  const first = questionsForPage(page)[0];
  const section = FLOW_SECTIONS.find((s) => s.id === first.section);
  if (!section) throw new Error(`セクションが見つかりません: ${first.section}`);
  return section;
}

/** そのページがセクションの先頭ページか（Part見出しの表示判定に使う） */
export function isSectionStart(page: number): boolean {
  if (page === 0) return true;
  return sectionOfPage(page).id !== sectionOfPage(page - 1).id;
}

export function answeredCount(answers: FlowAnswers): number {
  return FLOW_QUESTIONS.reduce((acc, q) => (answers[q.id] != null ? acc + 1 : acc), 0);
}

export function isPageComplete(page: number, answers: FlowAnswers): boolean {
  return questionsForPage(page).every((q) => answers[q.id] != null);
}

// --- 結果の受け渡し（sessionStorage用の型） ---

export interface StoredResult {
  variant: Variant;
  /** DB保存に成功した場合の共有用ID（/r/[id]） */
  shareId?: string;
  typeCompass: TypeCompassResult;
  bigFive: BigFiveResult;
  enneagram: EnneagramResult;
  /** 占い版のみ */
  kyusei?: KyuseiResult;
  profile: PersonaProfile | PersonaProfileFortune;
  createdAt: string;
}

export const RESULT_STORAGE_KEY = (variant: Variant) => `hpp:result:${variant}`;
export const BIRTH_STORAGE_KEY = "hpp:birth";

/**
 * 相性診断の入力から共有IDを取り出す。
 * 共有URL（…/r/xxx）でも生のIDでも受け付ける。取り出せない場合はnull。
 */
export function extractShareId(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed === "") return null;
  const urlMatch = trimmed.match(/\/r\/([A-Za-z0-9]+)/);
  if (urlMatch) return urlMatch[1];
  if (/^[A-Za-z0-9]+$/.test(trimmed)) return trimmed;
  return null;
}

export type { BirthDate };
