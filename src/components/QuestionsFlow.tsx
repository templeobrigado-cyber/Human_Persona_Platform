"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { ProgressBar } from "./ProgressBar";
import { LikertScale } from "./LikertScale";
import {
  BIRTH_STORAGE_KEY,
  FLOW_SECTIONS,
  PAGE_COUNT,
  RESULT_STORAGE_KEY,
  TOTAL_QUESTIONS,
  answeredCount,
  isPageComplete,
  isSectionStart,
  questionsForPage,
  sectionOfPage,
  type BirthDate,
  type FlowAnswers,
  type Rating,
  type StoredResult,
  type Variant,
} from "@/lib/diagnosis-flow";
import { useSessionItem } from "@/lib/use-session-item";
import { diagnoseTypeCompass } from "@/lib/type-compass";
import { diagnoseBigFive } from "@/lib/big-five";
import { diagnoseEnneagram } from "@/lib/enneagram";
import { diagnoseKyusei } from "@/lib/kyusei";
import { buildPersonaProfile, buildPersonaProfileFortune } from "@/lib/persona-engine";
import { saveDiagnosis } from "@/lib/actions";

type AnswerAction = { questionId: string; rating: Rating };

function answersReducer(state: FlowAnswers, action: AnswerAction): FlowAnswers {
  return { ...state, [action.questionId]: action.rating };
}

function parseBirth(raw: string | null | undefined): BirthDate | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as BirthDate;
    if (typeof parsed.year !== "number" || typeof parsed.month !== "number" || typeof parsed.day !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function QuestionsFlow({ variant }: { variant: Variant }) {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [answers, dispatch] = useReducer(answersReducer, {});
  const headingRef = useRef<HTMLDivElement>(null);

  const birthRaw = useSessionItem(BIRTH_STORAGE_KEY);
  const birth = useMemo(() => parseBirth(birthRaw), [birthRaw]);

  // 占い版は生年月日が未入力なら属性入力へ戻す（birthRaw === undefined はハイドレーション中）
  const missingBirth = variant === "fortune" && birthRaw !== undefined && birth == null;
  useEffect(() => {
    if (missingBirth) router.replace("/diagnosis/fortune/start");
  }, [missingBirth, router]);

  const ready = variant === "business" || birth != null;
  if (!ready) return null;

  const section = sectionOfPage(page);
  const questions = questionsForPage(page);
  const canProceed = isPageComplete(page, answers);
  const isLastPage = page === PAGE_COUNT - 1;

  function goTo(nextPage: number) {
    setPage(nextPage);
    headingRef.current?.scrollIntoView({ block: "start" });
  }

  async function complete() {
    const typeCompass = diagnoseTypeCompass(answers);
    const bigFive = diagnoseBigFive(answers);
    const enneagram = diagnoseEnneagram(answers);

    let result: StoredResult;
    if (variant === "fortune") {
      if (birth == null) return; // missingBirthのeffectでリダイレクト済み
      const kyusei = diagnoseKyusei(birth);
      result = {
        variant,
        typeCompass,
        bigFive,
        enneagram,
        kyusei,
        profile: buildPersonaProfileFortune({ typeCompass, bigFive, enneagram, kyusei }),
        createdAt: new Date().toISOString(),
      };
    } else {
      result = {
        variant,
        typeCompass,
        bigFive,
        enneagram,
        profile: buildPersonaProfile({ typeCompass, bigFive, enneagram }),
        createdAt: new Date().toISOString(),
      };
    }

    // DB保存（共有URL用）。失敗しても診断体験は止めない
    try {
      const saved = await saveDiagnosis(result, birth ?? undefined);
      if ("id" in saved) {
        result.shareId = saved.id;
      }
    } catch {
      // オフライン等 — sessionStorageのみで続行
    }

    sessionStorage.setItem(RESULT_STORAGE_KEY(variant), JSON.stringify(result));
    router.push(`/diagnosis/${variant}/result`);
  }

  return (
    <div ref={headingRef} className="scroll-mt-4">
      <ProgressBar value={answeredCount(answers)} max={TOTAL_QUESTIONS} variant={variant} />

      {isSectionStart(page) && (
        <div
          className={`mt-6 rounded-2xl p-5 ${
            variant === "fortune" ? "bg-fortune-soft" : "bg-business-soft"
          }`}
        >
          <p
            className={`font-mono text-xs font-bold tracking-widest ${
              variant === "fortune" ? "text-fortune" : "text-business"
            }`}
          >
            PART {section.part} / {FLOW_SECTIONS.length}
          </p>
          <h2 className="mt-1 text-lg font-bold">{section.title}</h2>
          <p className="mt-1 text-sm text-ink-muted">{section.description}</p>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-line bg-card px-6 py-1">
        {questions.map((q) => (
          <LikertScale
            key={q.id}
            question={q.text}
            name={q.id}
            value={answers[q.id]}
            variant={variant}
            onChange={(rating) => dispatch({ questionId: q.id, rating })}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={page === 0}
          className="min-h-11 rounded-full px-5 text-sm font-bold text-ink-muted transition-colors hover:text-ink disabled:invisible"
        >
          ← 戻る
        </button>
        <span className="font-mono text-xs text-ink-muted">
          {page + 1} / {PAGE_COUNT}ページ
        </span>
        {isLastPage ? (
          <Button tone={variant} disabled={!canProceed} onClick={complete}>
            結果を見る
          </Button>
        ) : (
          <Button tone={variant} disabled={!canProceed} onClick={() => goTo(page + 1)}>
            次へ →
          </Button>
        )}
      </div>
      {!canProceed && (
        <p className="mt-3 text-center text-xs text-ink-muted">
          すべての設問に回答すると次に進めます
        </p>
      )}
    </div>
  );
}
