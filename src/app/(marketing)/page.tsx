import Link from "next/link";
import { FlashCardStack } from "@/components/marketing/flash-card-stack";

export default function LandingPage() {
  return (
    <section className="grid w-full max-w-[1080px] items-center gap-20 md:grid-cols-[1.1fr_1fr] max-md:gap-8">
      <div>
        <p className="m-0 mb-6 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Learn vocabulary that sticks
        </p>
        <h1 className="m-0 font-display text-[clamp(2.75rem,5.8vw,4.75rem)] font-normal leading-[1.02] tracking-tight text-ink [&_em]:italic [&_em]:text-accent">
          Build the <em>vocabulary</em>
          <br />of who you want
          <br />to become.
        </h1>
        <p className="mb-9 mt-8 max-w-[42ch] text-[17px] leading-snug text-muted-foreground">
          Lexa is a spaced-repetition vocab app for serious learners. Five
          minutes a day, retention you can measure, decks built around the
          words you actually want to know.
        </p>
        <div className="mb-7 flex flex-wrap gap-2.5">
          <Link
            href="/register"
            className="inline-flex h-13 items-center rounded-md bg-ink px-5 text-[15px] font-medium text-bg hover:bg-ink-2"
          >
            Start learning — free
          </Link>
          <Link
            href="/login"
            className="inline-flex h-13 items-center rounded-md border border-line-2 bg-transparent px-5 text-[15px] font-medium text-ink hover:bg-[color:var(--hover)]"
          >
            I have an account
          </Link>
        </div>
        <dl className="flex gap-7 text-[13px] text-muted-foreground">
          <Stat label="active learners" value="120k+" />
          <Stat label="30-day retention" value="92%" />
          <Stat label="languages" value="40" />
        </dl>
      </div>
      <FlashCardStack />
    </section>
  );
}

function Stat({ label, value }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd className="m-0 font-display text-[28px] font-normal leading-none tracking-tight text-ink">
        {value}
      </dd>
      <span>{label}</span>
    </div>
  );
}
