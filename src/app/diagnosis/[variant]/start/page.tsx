import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/Card";
import { LinkButton } from "@/components/Button";
import { BirthForm } from "@/components/BirthForm";
import { VARIANTS, isVariant, TOTAL_QUESTIONS } from "@/lib/diagnosis-flow";

export function generateStaticParams() {
  return VARIANTS.map((variant) => ({ variant }));
}

export const dynamicParams = false;

export default async function StartPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  const { variant } = await params;
  if (!isVariant(variant)) notFound();

  const isFortune = variant === "fortune";

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-6 py-12">
      <p className={`text-xs font-bold tracking-wide ${isFortune ? "text-fortune" : "text-business"}`}>
        {isFortune ? "占い版" : "企業・採用版"}
      </p>
      <h1 className="mt-2 text-3xl/tight font-bold">
        {isFortune ? "生年月日を教えてください" : "診断をはじめる前に"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        全{TOTAL_QUESTIONS}問・約10分。直感でお答えください。正解はありません。
      </p>

      <Card className="mt-8">
        {isFortune ? (
          <>
            <p className="mb-6 rounded-xl bg-fortune-soft p-4 text-sm leading-relaxed text-fortune-deep">
              生年月日から九星気学の<strong>本命星</strong>を自動算出します。
              設問への回答とあわせて、あなたの本質と運気のかたちを読み解きます。
            </p>
            <BirthForm />
          </>
        ) : (
          <>
            <ul className="space-y-3 text-sm leading-relaxed">
              <li className="flex gap-2">
                <span className="text-business">✓</span>
                タイプコンパス・Big Five・エニアグラムの3理論で分析します
              </li>
              <li className="flex gap-2">
                <span className="text-business">✓</span>
                結果は心理統計ベースのデータとして表示されます
              </li>
              <li className="flex gap-2">
                <span className="text-business">✓</span>
                採用・配属・チームづくりの参考資料として使えます
              </li>
            </ul>
            <LinkButton tone="business" href="/diagnosis/business/questions" className="mt-8 w-full">
              診断をはじめる
            </LinkButton>
          </>
        )}
      </Card>

      <p className="mt-6 text-center">
        <Link href="/" className="text-sm text-ink-muted underline underline-offset-4 hover:text-ink">
          トップに戻る
        </Link>
      </p>
    </main>
  );
}
