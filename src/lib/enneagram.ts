// エニアグラム診断ロジック
// 理論（9タイプ）はパブリックドメイン。設問は独自設計（公式テストRHETI等は使わない）。
// 各タイプ3問の5件法Likert。最高得点タイプが基本タイプ、隣接タイプの高い方がウイング。

export type EnneagramType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface EnneagramQuestion {
  id: string;
  type: EnneagramType;
  text: string;
}

export type Rating = 1 | 2 | 3 | 4 | 5;
export type EnneagramAnswers = Record<string, Rating>;

export interface EnneagramResult {
  /** 基本タイプ（同点の場合は番号が小さい方） */
  type: EnneagramType;
  /** ウイング（基本タイプの隣接タイプのうち得点が高い方。同点は番号が小さい方） */
  wing: EnneagramType;
  /** 各タイプの0〜100スコア */
  typeScores: Record<EnneagramType, number>;
}

export const ENNEAGRAM_TYPE_NAMES: Record<EnneagramType, string> = {
  1: "改革する人",
  2: "助ける人",
  3: "達成する人",
  4: "個性的な人",
  5: "調べる人",
  6: "忠実な人",
  7: "熱中する人",
  8: "挑戦する人",
  9: "平和をもたらす人",
};

export const ENNEAGRAM_QUESTIONS: EnneagramQuestion[] = [
  // タイプ1: 改革する人
  { id: "en1a", type: 1, text: "物事は正しく、きちんと行うべきだと思う" },
  { id: "en1b", type: 1, text: "間違いや不正確さが気になって仕方がない" },
  { id: "en1c", type: 1, text: "自分にも他人にも高い基準を求めてしまう" },

  // タイプ2: 助ける人
  { id: "en2a", type: 2, text: "人の役に立つことに大きな喜びを感じる" },
  { id: "en2b", type: 2, text: "頼まれごとを断れないことが多い" },
  { id: "en2c", type: 2, text: "相手が何を必要としているかすぐに察する方だ" },

  // タイプ3: 達成する人
  { id: "en3a", type: 3, text: "目標を達成することが何よりのモチベーションになる" },
  { id: "en3b", type: 3, text: "周囲から「できる人」だと見られたい" },
  { id: "en3c", type: 3, text: "効率よく成果を出すことに強くこだわる" },

  // タイプ4: 個性的な人
  { id: "en4a", type: 4, text: "自分は他の人とはどこか違う存在だと感じる" },
  { id: "en4b", type: 4, text: "感情の深さや美しさを大切にしている" },
  { id: "en4c", type: 4, text: "ありきたりなものより独自性のあるものに惹かれる" },

  // タイプ5: 調べる人
  { id: "en5a", type: 5, text: "一人で調べたり考えたりする時間が欠かせない" },
  { id: "en5b", type: 5, text: "行動する前に十分な知識を集めておきたい" },
  { id: "en5c", type: 5, text: "感情に流されず、観察と分析を優先する方だ" },

  // タイプ6: 忠実な人
  { id: "en6a", type: 6, text: "最悪の事態を想定して備えることが多い" },
  { id: "en6b", type: 6, text: "信頼できる人やルールがあると安心する" },
  { id: "en6c", type: 6, text: "大きな決断の前に周囲の意見を確かめたくなる" },

  // タイプ7: 熱中する人
  { id: "en7a", type: 7, text: "新しくて楽しいことを常に探している" },
  { id: "en7b", type: 7, text: "予定が空いているとつい何かを詰め込みたくなる" },
  { id: "en7c", type: 7, text: "つらいことより楽しいことに目を向けていたい" },

  // タイプ8: 挑戦する人
  { id: "en8a", type: 8, text: "自分の意見をはっきり主張する方だ" },
  { id: "en8b", type: 8, text: "人に弱みを見せることに抵抗がある" },
  { id: "en8c", type: 8, text: "自分が主導権を握っている方が安心できる" },

  // タイプ9: 平和をもたらす人
  { id: "en9a", type: 9, text: "争いごとはできるだけ避けたい" },
  { id: "en9b", type: 9, text: "自分を主張するより周りに合わせている方が楽だ" },
  { id: "en9c", type: 9, text: "物事を穏やかに保つことを何より優先する" },
];

const ALL_TYPES: EnneagramType[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** 隣接タイプ（円環なので1と9はつながっている） */
function wingsOf(type: EnneagramType): [EnneagramType, EnneagramType] {
  const prev = (type === 1 ? 9 : type - 1) as EnneagramType;
  const next = (type === 9 ? 1 : type + 1) as EnneagramType;
  return [prev, next];
}

export function diagnoseEnneagram(answers: EnneagramAnswers): EnneagramResult {
  const rawScores = {} as Record<EnneagramType, { sum: number; count: number }>;
  for (const t of ALL_TYPES) rawScores[t] = { sum: 0, count: 0 };

  for (const q of ENNEAGRAM_QUESTIONS) {
    const rating = answers[q.id];
    if (rating == null) {
      throw new Error(`未回答の設問があります: ${q.id}`);
    }
    rawScores[q.type].sum += rating;
    rawScores[q.type].count += 1;
  }

  const typeScores = {} as Record<EnneagramType, number>;
  for (const t of ALL_TYPES) {
    const { sum, count } = rawScores[t];
    typeScores[t] = Math.round(((sum - count) / (count * 4)) * 100);
  }

  let primary: EnneagramType = 1;
  for (const t of ALL_TYPES) {
    if (typeScores[t] > typeScores[primary]) primary = t;
  }

  const [wingA, wingB] = wingsOf(primary);
  let wing: EnneagramType;
  if (typeScores[wingA] === typeScores[wingB]) {
    wing = Math.min(wingA, wingB) as EnneagramType;
  } else {
    wing = typeScores[wingA] > typeScores[wingB] ? wingA : wingB;
  }

  return { type: primary, wing, typeScores };
}
