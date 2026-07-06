"use server";

// 診断結果の保存（Server Function）
// 認証未実装のため匿名保存。共有用のdiagnosis idを返す。

import { prisma } from "./db";
import { isVariant, type StoredResult } from "./diagnosis-flow";
import { PERSONA_AXES } from "./persona-engine";

/** 外部から直接POSTされ得るため、最低限の形チェックを行う */
function isValidResult(result: StoredResult): boolean {
  if (!isVariant(result.variant)) return false;
  if (typeof result.typeCompass?.type !== "string") return false;
  if (typeof result.bigFive?.scores?.openness !== "number") return false;
  if (typeof result.enneagram?.type !== "number") return false;
  if (result.profile == null) return false;
  for (const axis of PERSONA_AXES) {
    const value = result.profile.vector[axis];
    if (typeof value !== "number" || value < 0 || value > 100) return false;
  }
  if (result.variant === "fortune" && result.kyusei == null) return false;
  return true;
}

export async function saveDiagnosis(
  result: StoredResult,
  birth?: { year: number; month: number; day: number }
): Promise<{ id: string } | { error: string }> {
  if (!isValidResult(result)) {
    return { error: "診断結果の形式が不正です" };
  }

  try {
    const t = result.typeCompass.traitVector;
    const b = result.bigFive.scores;
    const v = result.profile.vector;

    const diagnosis = await prisma.diagnosis.create({
      data: {
        variant: result.variant,
        birthDate:
          result.variant === "fortune" && birth
            ? new Date(Date.UTC(birth.year, birth.month - 1, birth.day))
            : null,
        payload: JSON.stringify(result),
        mbtiResult: {
          create: {
            type: result.typeCompass.type,
            ei: t.sociability, // E側の割合
            sn: t.realism, // S側の割合
            tf: t.logic, // T側の割合
            jp: t.planning, // J側の割合
          },
        },
        bigFiveResult: {
          create: {
            openness: b.openness,
            conscientiousness: b.conscientiousness,
            extraversion: b.extraversion,
            agreeableness: b.agreeableness,
            neuroticism: b.neuroticism,
          },
        },
        enneagramResult: {
          create: {
            type: result.enneagram.type,
            wing: result.enneagram.wing,
          },
        },
        kyuseiResult:
          result.variant === "fortune" && result.kyusei
            ? {
                create: {
                  honmeisei: result.kyusei.honmeisei,
                  gogyou: result.kyusei.gogyou,
                },
              }
            : undefined,
        personaProfile: {
          create: {
            variantType: result.profile.variant,
            creativity: v.creativity,
            leadership: v.leadership,
            empathy: v.empathy,
            stability: v.stability,
            challenge: v.challenge,
            logic: v.logic,
            communication: v.communication,
            discipline: v.discipline,
            gogyouBonus:
              result.profile.variant === "fortune"
                ? JSON.stringify(result.profile.gogyouBonus)
                : null,
          },
        },
      },
      select: { id: true },
    });

    return { id: diagnosis.id };
  } catch (e) {
    console.error("診断結果の保存に失敗:", e);
    return { error: "保存に失敗しました" };
  }
}
