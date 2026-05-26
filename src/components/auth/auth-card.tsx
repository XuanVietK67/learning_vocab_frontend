import * as React from "react";
import { cn } from "@/lib/utils";

export function AuthCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-card p-9 shadow-[0_1px_0_rgba(0,0,0,0.02),_0_24px_60px_-32px_rgba(20,19,15,0.18)] animate-fade-up",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHead({
  eyebrow,
  title,
  sub,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-1.5">
      {eyebrow && (
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {eyebrow}
        </span>
      )}
      <h1 className="m-0 font-display text-[36px] font-normal leading-[1.05] tracking-[-0.015em] text-ink [&_em]:italic [&_em]:text-accent">
        {title}
      </h1>
      {sub && (
        <p className="mt-1 text-[14.5px] leading-[1.5] text-muted-foreground">
          {sub}
        </p>
      )}
    </div>
  );
}

export function CardFoot({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-6 border-t border-line pt-5 text-center text-[13.5px] text-muted-foreground [&_a]:cursor-pointer [&_a]:font-medium [&_a]:text-ink [&_a]:border-b [&_a]:border-line-2 [&_a]:pb-[1px] hover:[&_a]:border-ink",
        className,
      )}
    >
      {children}
    </div>
  );
}
