"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * sessionStorageの値を読むフック。
 * - `undefined` … サーバーレンダリング／ハイドレーション中（判定不能）
 * - `null` … クライアントで確認したが値がない
 * - `string` … 保存済みの生JSON文字列
 * 文字列（プリミティブ）を返すためスナップショットが安定し、パースは呼び出し側でuseMemoする。
 */
export function useSessionItem(key: string): string | null | undefined {
  return useSyncExternalStore(
    emptySubscribe,
    () => sessionStorage.getItem(key),
    () => undefined
  );
}
