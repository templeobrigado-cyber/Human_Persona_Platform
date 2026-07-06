// タイプコンパス診断ロジック
// ユング心理学の4指標（E/I・S/N・T/F・J/P）を測るが、設問・採点式は独自設計。
// 公式MBTIの設問・アルゴリズムは一切参照しない。

export type Axis = "EI" | "SN" | "TF" | "JP";
export type Pole = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";

export interface TypeCompassQuestion {
  id: string;
  axis: Axis;
  pole: Pole;
  text: string;
}

export type Rating = 1 | 2 | 3 | 4 | 5;
export type TypeCompassAnswers = Record<string, Rating>;

export interface AxisResult {
  axis: Axis;
  dominant: Pole;
  strength: number;
}

export interface TypeCompassResult {
  type: string;
  axisResults: AxisResult[];
  traitVector: {
    sociability: number;
    introspection: number;
    realism: number;
    creativity: number;
    logic: number;
    empathy: number;
    planning: number;
    flexibility: number;
  };
}

export const TYPE_COMPASS_QUESTIONS: TypeCompassQuestion[] = [
  { id: "ei1", axis: "EI", pole: "E", text: "初対面の人ともすぐに打ち解けて話せる" },
  { id: "ei2", axis: "EI", pole: "E", text: "大勢の集まりに参加すると元気が湧いてくる" },
  { id: "ei3", axis: "EI", pole: "E", text: "思ったことをすぐ口に出して話す方だ" },
  { id: "ei4", axis: "EI", pole: "I", text: "大人数の集まりより、少人数でじっくり話す方が落ち着く" },
  { id: "ei5", axis: "EI", pole: "I", text: "一人で過ごす時間がないとエネルギーが切れてしまう" },
  { id: "ei6", axis: "EI", pole: "I", text: "発言する前に、頭の中で考えをまとめてから話す方だ" },

  { id: "sn1", axis: "SN", pole: "S", text: "物事を判断するときは、具体的な事実やデータを重視する" },
  { id: "sn2", axis: "SN", pole: "S", text: "説明書やマニュアル通りに進める方が安心する" },
  { id: "sn3", axis: "SN", pole: "S", text: "過去の実績や経験に基づいて判断することが多い" },
  { id: "sn4", axis: "SN", pole: "N", text: "物事の背後にある可能性や意味を考えるのが好きだ" },
  { id: "sn5", axis: "SN", pole: "N", text: "新しいアイデアや抽象的な概念を扱うのが得意だ" },
  { id: "sn6", axis: "SN", pole: "N", text: "決まったやり方より、新しい方法を試したくなる" },

  { id: "tf1", axis: "TF", pole: "T", text: "意思決定の際は、感情よりも論理を優先する" },
  { id: "tf2", axis: "TF", pole: "T", text: "議論では、正しさや筋道を重視する" },
  { id: "tf3", axis: "TF", pole: "T", text: "指摘するときは、率直に事実を伝える方だ" },
  { id: "tf4", axis: "TF", pole: "F", text: "判断するときは、相手の気持ちを最優先に考える" },
  { id: "tf5", axis: "TF", pole: "F", text: "その場の空気や人間関係の調和を大切にする" },
  { id: "tf6", axis: "TF", pole: "F", text: "誰かに意見を伝えるときは、まず相手の感情に配慮する" },

  { id: "jp1", axis: "JP", pole: "J", text: "予定はあらかじめ決めておきたい" },
  { id: "jp2", axis: "JP", pole: "J", text: "締め切りより早めに物事を終わらせると落ち着く" },
  { id: "jp3", axis: "JP", pole: "J", text: "物事は計画通りに進めたい" },
  { id: "jp4", axis: "JP", pole: "P", text: "予定は状況に応じて柔軟に変えたい" },
  { id: "jp5", axis: "JP", pole: "P", text: "締め切り直前に集中して取り組むタイプだ" },
  { id: "jp6", axis: "JP", pole: "P", text: "決まったやり方に縛られず、その場の流れに合わせたい" },
];

const AXIS_POLES: Record<Axis, [Pole, Pole]> = {
  EI: ["E", "I"],
  SN: ["S", "N"],
  TF: ["T", "F"],
  JP: ["J", "P"],
};

function computeAxis(axis: Axis, answers: TypeCompassAnswers): AxisResult & { poleScores: Record<Pole, number> } {
  const [poleA, poleB] = AXIS_POLES[axis];
  let scoreA = 0;
  let scoreB = 0;

  for (const q of TYPE_COMPASS_QUESTIONS) {
    if (q.axis !== axis) continue;
    const rating = answers[q.id];
    if (rating == null) {
      throw new Error(`未回答の設問があります: ${q.id}`);
    }
    if (q.pole === poleA) scoreA += rating;
    else scoreB += rating;
  }

  const total = scoreA + scoreB;
  const dominant = scoreA >= scoreB ? poleA : poleB;
  const dominantScore = Math.max(scoreA, scoreB);
  const strength = Math.round((dominantScore / total) * 100);

  return {
    axis,
    dominant,
    strength,
    poleScores: {
      [poleA]: Math.round((scoreA / total) * 100),
      [poleB]: Math.round((scoreB / total) * 100),
    } as Record<Pole, number>,
  };
}

export function diagnoseTypeCompass(answers: TypeCompassAnswers): TypeCompassResult {
  const axisResults = (["EI", "SN", "TF", "JP"] as Axis[]).map((axis) => computeAxis(axis, answers));

  const poleScores = axisResults.reduce((acc, r) => ({ ...acc, ...r.poleScores }), {} as Record<Pole, number>);

  const type = axisResults.map((r) => r.dominant).join("");

  return {
    type,
    axisResults: axisResults.map(({ axis, dominant, strength }) => ({ axis, dominant, strength })),
    traitVector: {
      sociability: poleScores.E,
      introspection: poleScores.I,
      realism: poleScores.S,
      creativity: poleScores.N,
      logic: poleScores.T,
      empathy: poleScores.F,
      planning: poleScores.J,
      flexibility: poleScores.P,
    },
  };
}
