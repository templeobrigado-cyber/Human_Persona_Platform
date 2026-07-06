import Link from "next/link";
import type { Variant } from "@/lib/diagnosis-flow";

type Tone = Variant | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  fortune: "bg-fortune text-white hover:bg-fortune-deep",
  business: "bg-business text-white hover:bg-business-deep",
  neutral: "bg-ink text-white hover:bg-ink/80",
};

const BASE_CLASSES =
  "inline-flex min-h-11 items-center justify-center rounded-full px-6 py-2.5 text-base font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40";

export function Button({
  tone = "neutral",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) {
  return <button className={`${BASE_CLASSES} ${TONE_CLASSES[tone]} ${className}`} {...props} />;
}

export function LinkButton({
  tone = "neutral",
  className = "",
  href,
  children,
}: {
  tone?: Tone;
  className?: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={`${BASE_CLASSES} ${TONE_CLASSES[tone]} ${className}`}>
      {children}
    </Link>
  );
}
