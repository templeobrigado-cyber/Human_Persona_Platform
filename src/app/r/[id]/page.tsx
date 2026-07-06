import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { ResultSections } from "@/components/ResultSections";
import type { StoredResult } from "@/lib/diagnosis-flow";

export const metadata: Metadata = {
  title: "診断結果 | HPP — 人格診断プラットフォーム",
};

async function loadResult(id: string): Promise<StoredResult | null> {
  const diagnosis = await prisma.diagnosis.findUnique({
    where: { id },
    select: { payload: true },
  });
  if (diagnosis == null) return null;
  try {
    return JSON.parse(diagnosis.payload) as StoredResult;
  } catch {
    return null;
  }
}

export default async function SharedResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await loadResult(id);
  if (result == null) notFound();

  const isFortune = result.variant === "fortune";

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <header className="mb-8 text-center">
        <p className={`text-xs font-bold tracking-wide ${isFortune ? "text-fortune" : "text-business"}`}>
          {isFortune ? "占い版" : "企業・採用版"}
        </p>
        <h1 className="mt-2 text-3xl/tight font-bold">診断結果</h1>
        <p className="mt-2 text-sm text-ink-muted">共有された診断結果です</p>
      </header>
      <ResultSections
        result={result}
        retryLabel="自分も診断してみる"
        compatibilityHref={`/compatibility?a=${id}`}
      />
    </main>
  );
}
