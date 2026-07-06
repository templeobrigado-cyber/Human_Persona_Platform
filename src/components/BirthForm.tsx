"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { BIRTH_STORAGE_KEY, type BirthDate } from "@/lib/diagnosis-flow";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1930 + 1 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

const SELECT_CLASSES =
  "min-h-11 flex-1 rounded-xl border border-line bg-card px-3 text-base focus:border-fortune focus:outline-none";

export function BirthForm() {
  const router = useRouter();
  const [birth, setBirth] = useState<BirthDate>({ year: 1990, month: 1, day: 1 });

  const maxDay = daysInMonth(birth.year, birth.month);

  function update(next: Partial<BirthDate>) {
    setBirth((prev) => {
      const merged = { ...prev, ...next };
      // 月・年の変更で存在しない日になったら丸める（例: 3/31→2月に変更で2/28）
      return { ...merged, day: Math.min(merged.day, daysInMonth(merged.year, merged.month)) };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sessionStorage.setItem(BIRTH_STORAGE_KEY, JSON.stringify(birth));
    router.push("/diagnosis/fortune/questions");
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-xs font-bold text-ink-muted">年</span>
          <select
            className={SELECT_CLASSES}
            value={birth.year}
            onChange={(e) => update({ year: Number(e.target.value) })}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}年
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-xs font-bold text-ink-muted">月</span>
          <select
            className={SELECT_CLASSES}
            value={birth.month}
            onChange={(e) => update({ month: Number(e.target.value) })}
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}月
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-xs font-bold text-ink-muted">日</span>
          <select
            className={SELECT_CLASSES}
            value={birth.day}
            onChange={(e) => update({ day: Number(e.target.value) })}
          >
            {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}日
              </option>
            ))}
          </select>
        </label>
      </div>
      <Button type="submit" tone="fortune" className="mt-8 w-full">
        診断をはじめる
      </Button>
    </form>
  );
}
