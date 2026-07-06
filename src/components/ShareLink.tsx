"use client";

import { useState } from "react";
import type { Variant } from "@/lib/diagnosis-flow";

export function ShareLink({ shareId, variant }: { shareId: string; variant: Variant }) {
  const [copied, setCopied] = useState(false);
  // クライアント専用コンポーネント（結果ロード後にのみ描画される）のためlocation参照可
  const url = `${window.location.origin}/r/${shareId}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // クリップボード非対応環境では選択用にinputへフォーカスさせるだけ
    }
  }

  return (
    <div
      className={`rounded-2xl border p-4 ${
        variant === "fortune" ? "border-fortune/20 bg-fortune-soft" : "border-business/20 bg-business-soft"
      }`}
    >
      <p className="text-sm font-bold">結果を保存しました — このURLでいつでも見られます</p>
      <div className="mt-2 flex gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-card px-3 font-mono text-xs"
          aria-label="共有URL"
        />
        <button
          type="button"
          onClick={copy}
          className={`min-h-11 shrink-0 rounded-xl px-4 text-sm font-bold text-white transition-colors ${
            variant === "fortune" ? "bg-fortune hover:bg-fortune-deep" : "bg-business hover:bg-business-deep"
          }`}
        >
          {copied ? "コピーしました ✓" : "コピー"}
        </button>
      </div>
    </div>
  );
}
