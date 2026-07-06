"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ResultSections } from "./ResultSections";
import { ShareLink } from "./ShareLink";
import { RESULT_STORAGE_KEY, type StoredResult, type Variant } from "@/lib/diagnosis-flow";
import { useSessionItem } from "@/lib/use-session-item";

function parseResult(raw: string | null | undefined, variant: Variant): StoredResult | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredResult;
    if (parsed.variant !== variant || parsed.typeCompass == null) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function ResultView({ variant }: { variant: Variant }) {
  const router = useRouter();
  const raw = useSessionItem(RESULT_STORAGE_KEY(variant));
  const result = useMemo(() => parseResult(raw, variant), [raw, variant]);

  // クライアントで確認して結果がなければTOPへ（raw === undefined はハイドレーション中）
  const missing = raw !== undefined && result == null;
  useEffect(() => {
    if (missing) router.replace("/");
  }, [missing, router]);

  if (result == null) return null;

  return (
    <div className="space-y-6">
      {result.shareId && <ShareLink shareId={result.shareId} variant={variant} />}
      <ResultSections
        result={result}
        compatibilityHref={
          result.shareId ? `/compatibility?a=${result.shareId}` : "/compatibility"
        }
      />
    </div>
  );
}
