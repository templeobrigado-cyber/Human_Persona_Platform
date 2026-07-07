"use client";

import type { Rating, Variant } from "@/lib/diagnosis-flow";

const RATINGS: Rating[] = [1, 2, 3, 4, 5];

/** 外側は現状サイズ、中央に向かって段階的に小さくする（両隣→やや小さく、中央→最小） */
const CIRCLE_SIZE_CLASSES = ["size-11", "size-9", "size-7", "size-9", "size-11"];

const CHECKED_CLASSES: Record<Variant, string> = {
  fortune: "peer-checked:border-fortune peer-checked:bg-fortune",
  business: "peer-checked:border-business peer-checked:bg-business",
};

export function LikertScale({
  question,
  name,
  value,
  variant,
  onChange,
}: {
  question: string;
  name: string;
  value?: Rating;
  variant: Variant;
  onChange: (rating: Rating) => void;
}) {
  return (
    <fieldset className="border-b border-line py-5 last:border-b-0">
      <legend className="float-left mb-4 w-full text-base font-medium">{question}</legend>
      <div className="clear-both mx-auto w-fit">
        <div className="flex items-center gap-3 sm:gap-5" role="radiogroup" aria-label={question}>
          {RATINGS.map((rating, index) => (
            <label key={rating} className="flex size-11 cursor-pointer items-center justify-center">
              <input
                type="radio"
                name={name}
                value={rating}
                checked={value === rating}
                onChange={() => onChange(rating)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={`block rounded-full border-2 border-line bg-card transition-colors hover:border-ink-muted peer-focus-visible:ring-2 peer-focus-visible:ring-ink peer-focus-visible:ring-offset-2 ${CIRCLE_SIZE_CLASSES[index]} ${CHECKED_CLASSES[variant]}`}
              />
              <span className="sr-only">{rating}</span>
            </label>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-ink-muted" aria-hidden="true">
          <span>そう思わない</span>
          <span>そう思う</span>
        </div>
      </div>
    </fieldset>
  );
}
