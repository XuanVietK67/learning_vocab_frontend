import * as React from "react";

export function ScreenHeader({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <header className="max-w-[640px]">
      <div className="mb-3.5 font-mono text-[11px] font-bold tracking-[0.08em] text-accent before:content-['✧_']">
        {eyebrow}
      </div>
      <h1 className="m-0 mb-3.5 font-display text-[clamp(2.25rem,4.6vw,3.75rem)] font-semibold italic leading-[1.05] tracking-[-0.015em] text-ink text-pretty [&_em]:relative [&_em]:italic [&_em]:text-accent [&_em]:after:absolute [&_em]:after:inset-x-[-2%] [&_em]:after:bottom-[6%] [&_em]:after:-z-10 [&_em]:after:h-[14%] [&_em]:after:-rotate-1 [&_em]:after:rounded-full [&_em]:after:bg-rainbow-2/70">
        {title}
      </h1>
      {sub && (
        <p className="m-0 max-w-[56ch] text-[16px] leading-[1.55] text-muted-foreground">
          {sub}
        </p>
      )}
    </header>
  );
}
