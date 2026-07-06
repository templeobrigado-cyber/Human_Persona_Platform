"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { extractShareId } from "@/lib/diagnosis-flow";

const INPUT_CLASSES =
  "min-h-11 w-full rounded-xl border border-line bg-card px-3 font-mono text-sm focus:border-ink focus:outline-none";

export function CompatibilityForm({ defaultA = "" }: { defaultA?: string }) {
  const router = useRouter();
  const [inputA, setInputA] = useState(defaultA);
  const [inputB, setInputB] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const a = extractShareId(inputA);
    const b = extractShareId(inputB);
    if (a == null || b == null) {
      setError("結果URLまたは診断IDを2つとも入力してください");
      return;
    }
    if (a === b) {
      setError("同じ診断結果同士は比較できません。別の結果を入力してください");
      return;
    }
    setError(null);
    router.push(`/compatibility/${a}/${b}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="block">
        <span className="text-xs font-bold text-ink-muted">1人目の結果URL（または診断ID）</span>
        <input
          className={`mt-1.5 ${INPUT_CLASSES}`}
          value={inputA}
          onChange={(e) => setInputA(e.target.value)}
          placeholder="https://…/r/xxxxxxxx"
        />
      </label>
      <label className="mt-4 block">
        <span className="text-xs font-bold text-ink-muted">2人目の結果URL（または診断ID）</span>
        <input
          className={`mt-1.5 ${INPUT_CLASSES}`}
          value={inputB}
          onChange={(e) => setInputB(e.target.value)}
          placeholder="https://…/r/yyyyyyyy"
        />
      </label>
      {error && <p className="mt-3 text-sm font-bold text-red-600">{error}</p>}
      <Button type="submit" tone="neutral" className="mt-6 w-full">
        相性を診断する
      </Button>
    </form>
  );
}
