import { notFound } from "next/navigation";
import { ResultView } from "@/components/ResultView";
import { VARIANTS, isVariant } from "@/lib/diagnosis-flow";

export function generateStaticParams() {
  return VARIANTS.map((variant) => ({ variant }));
}

export const dynamicParams = false;

export default async function ResultPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  const { variant } = await params;
  if (!isVariant(variant)) notFound();

  const isFortune = variant === "fortune";

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <header className="mb-8 text-center">
        <p className={`text-xs font-bold tracking-wide ${isFortune ? "text-fortune" : "text-business"}`}>
          {isFortune ? "占い版" : "企業・採用版"}
        </p>
        <h1 className="mt-2 text-3xl/tight font-bold">診断結果</h1>
      </header>
      <ResultView variant={variant} />
    </main>
  );
}
