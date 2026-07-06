// Big Five（ビッグファイブ）診断ロジック
// IPIP（国際性格特性項目プール、パブリックドメイン）の設計方針を参考にした独自設問。
// 各因子6問（順方向3問＋逆転3問）の5件法Likert。逆転項目でイエス・テンデンシー（黙従傾向）を打ち消す。

export type BigFiveFactor =
  | "openness"
  | "conscientiousness"
  | "extraversion"
  | "agreeableness"
  | "neuroticism";

export interface BigFiveQuestion {
  id: string;
  factor: BigFiveFactor;
  /** trueなら逆転項目（同意するほど因子スコアが下がる） */
  reversed: boolean;
  text: string;
}

export type Rating = 1 | 2 | 3 | 4 | 5;
export type BigFiveAnswers = Record<string, Rating>;

/** 各因子0〜100のスコア */
export type BigFiveScores = Record<BigFiveFactor, number>;

export interface BigFiveResult {
  scores: BigFiveScores;
  /** 設計書のPersonaベクトル対応名での別名（開放性→創造性 など） */
  traitVector: {
    creativity: number; // 開放性
    responsibility: number; // 誠実性
    sociability: number; // 外向性
    empathy: number; // 協調性
    stability: number; // 安定性（神経症傾向の逆転）
  };
}

export const BIG_FIVE_QUESTIONS: BigFiveQuestion[] = [
  // 開放性（Openness）
  { id: "o1", factor: "openness", reversed: false, text: "新しいアイデアや芸術に触れるとわくわくする" },
  { id: "o2", factor: "openness", reversed: false, text: "抽象的な議論や哲学的な話題を楽しめる" },
  { id: "o3", factor: "openness", reversed: false, text: "想像力を働かせて物事を考えるのが好きだ" },
  { id: "o4", factor: "openness", reversed: true, text: "慣れ親しんだやり方を変えるのは好きではない" },
  { id: "o5", factor: "openness", reversed: true, text: "芸術や美術にはあまり関心がない" },
  { id: "o6", factor: "openness", reversed: true, text: "空想にふけることはほとんどない" },

  // 誠実性（Conscientiousness）
  { id: "c1", factor: "conscientiousness", reversed: false, text: "一度始めたことは最後までやり遂げる" },
  { id: "c2", factor: "conscientiousness", reversed: false, text: "身の回りの整理整頓が得意だ" },
  { id: "c3", factor: "conscientiousness", reversed: false, text: "計画を立てて準備してから行動する" },
  { id: "c4", factor: "conscientiousness", reversed: true, text: "部屋や机が散らかりがちだ" },
  { id: "c5", factor: "conscientiousness", reversed: true, text: "面倒なことを後回しにしてしまう" },
  { id: "c6", factor: "conscientiousness", reversed: true, text: "細かい確認を怠ることがある" },

  // 外向性（Extraversion）
  { id: "e1", factor: "extraversion", reversed: false, text: "人と話すことでエネルギーが湧いてくる" },
  { id: "e2", factor: "extraversion", reversed: false, text: "集まりの場では多くの人と会話をする" },
  { id: "e3", factor: "extraversion", reversed: false, text: "自分から会話を始めることが多い" },
  { id: "e4", factor: "extraversion", reversed: true, text: "人前では口数が少ない方だ" },
  { id: "e5", factor: "extraversion", reversed: true, text: "注目を浴びるのは苦手だ" },
  { id: "e6", factor: "extraversion", reversed: true, text: "初対面の人と話すと疲れてしまう" },

  // 協調性（Agreeableness）
  { id: "a1", factor: "agreeableness", reversed: false, text: "他人の気持ちに自然と寄り添える" },
  { id: "a2", factor: "agreeableness", reversed: false, text: "困っている人を放っておけない" },
  { id: "a3", factor: "agreeableness", reversed: false, text: "人の良いところを見つけるのが得意だ" },
  { id: "a4", factor: "agreeableness", reversed: true, text: "他人の悩みにはあまり関心が持てない" },
  { id: "a5", factor: "agreeableness", reversed: true, text: "自分の利益を優先して動くことが多い" },
  { id: "a6", factor: "agreeableness", reversed: true, text: "人に厳しく当たってしまうことがある" },

  // 神経症傾向（Neuroticism）
  { id: "n1", factor: "neuroticism", reversed: false, text: "ささいなことでも不安になりやすい" },
  { id: "n2", factor: "neuroticism", reversed: false, text: "気分の浮き沈みが激しい方だ" },
  { id: "n3", factor: "neuroticism", reversed: false, text: "ストレスを受けるとなかなか立ち直れない" },
  { id: "n4", factor: "neuroticism", reversed: true, text: "たいていのことは気にせず受け流せる" },
  { id: "n5", factor: "neuroticism", reversed: true, text: "プレッシャーの中でも落ち着いていられる" },
  { id: "n6", factor: "neuroticism", reversed: true, text: "落ち込んでもすぐに気持ちを切り替えられる" },
];

const FACTORS: BigFiveFactor[] = [
  "openness",
  "conscientiousness",
  "extraversion",
  "agreeableness",
  "neuroticism",
];

export function diagnoseBigFive(answers: BigFiveAnswers): BigFiveResult {
  const sums: Record<BigFiveFactor, { sum: number; count: number }> = {
    openness: { sum: 0, count: 0 },
    conscientiousness: { sum: 0, count: 0 },
    extraversion: { sum: 0, count: 0 },
    agreeableness: { sum: 0, count: 0 },
    neuroticism: { sum: 0, count: 0 },
  };

  for (const q of BIG_FIVE_QUESTIONS) {
    const rating = answers[q.id];
    if (rating == null) {
      throw new Error(`未回答の設問があります: ${q.id}`);
    }
    const score = q.reversed ? 6 - rating : rating;
    sums[q.factor].sum += score;
    sums[q.factor].count += 1;
  }

  const scores = {} as BigFiveScores;
  for (const factor of FACTORS) {
    const { sum, count } = sums[factor];
    // 1問あたり1〜5点 → 因子合計count〜count*5点を0〜100に正規化
    scores[factor] = Math.round(((sum - count) / (count * 4)) * 100);
  }

  return {
    scores,
    traitVector: {
      creativity: scores.openness,
      responsibility: scores.conscientiousness,
      sociability: scores.extraversion,
      empathy: scores.agreeableness,
      stability: 100 - scores.neuroticism,
    },
  };
}
