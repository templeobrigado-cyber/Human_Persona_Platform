import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { CompatibilityForm } from "@/components/CompatibilityForm";

export const metadata: Metadata = {
  title: "相性診断 | HPP — 人格診断プラットフォーム",
};

export default async function CompatibilityPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string }>;
}) {
  const { a } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-6 py-12">
      <h1 className="text-3xl/tight font-bold">相性診断</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        診断結果の共有URLを2つ入力すると、ふたりの相性を診断します。
        価値観・性格・動機の近さから相性スコアを算出し、占い版同士なら五行の相性も加味します。
      </p>

      <Card className="mt-8">
        <CompatibilityForm defaultA={a ?? ""} />
      </Card>

      <p className="mt-6 text-center text-sm text-ink-muted">
        まだ診断していない場合は{" "}
        <Link href="/" className="underline underline-offset-4 hover:text-ink">
          トップから無料診断
        </Link>{" "}
        へ（結果画面に共有URLが表示されます）
      </p>
    </main>
  );
}
