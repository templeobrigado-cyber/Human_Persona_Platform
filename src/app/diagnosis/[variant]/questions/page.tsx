import { notFound } from "next/navigation";
import { QuestionsFlow } from "@/components/QuestionsFlow";
import { VARIANTS, isVariant } from "@/lib/diagnosis-flow";

export function generateStaticParams() {
  return VARIANTS.map((variant) => ({ variant }));
}

export const dynamicParams = false;

export default async function QuestionsPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  const { variant } = await params;
  if (!isVariant(variant)) notFound();

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-6 py-8">
      <QuestionsFlow variant={variant} />
    </main>
  );
}
