"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "danger" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-60",
  outline:
    "border border-line-2 bg-card text-ink hover:bg-[color:var(--hover)] disabled:opacity-60",
  danger:
    "bg-danger-soft text-danger hover:bg-[color:color-mix(in_oklab,var(--danger)_18%,transparent)] disabled:opacity-60",
  ghost:
    "text-ink-2 hover:bg-[color:var(--hover)] disabled:opacity-60",
};

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  pending?: boolean;
  pendingLabel?: string;
};

export function SubmitButton({
  variant = "primary",
  className,
  children,
  pending,
  pendingLabel,
  disabled,
  type = "submit",
  ...props
}: Props) {
  const status = useFormStatus();
  const isPending = pending ?? status.pending;
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || isPending}
      className={cn(
        "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed",
        variants[variant],
        className,
      )}
    >
      {isPending && <Loader2 className="size-4 animate-spin-slow" aria-hidden />}
      {isPending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
