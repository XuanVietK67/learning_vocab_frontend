import * as React from "react";
import { cn } from "@/lib/utils";

type Tone =
  | "neutral"
  | "accent"
  | "success"
  | "warn"
  | "danger"
  | "rainbow-1"
  | "rainbow-2"
  | "rainbow-3"
  | "rainbow-4"
  | "rainbow-5";

const toneClass: Record<Tone, string> = {
  neutral: "bg-bg-soft text-ink-2",
  accent: "bg-accent-soft text-accent",
  success: "bg-[color:color-mix(in_oklab,var(--success)_14%,transparent)] text-success",
  warn: "bg-[color:color-mix(in_oklab,var(--warn)_18%,transparent)] text-warn",
  danger: "bg-danger-soft text-danger",
  "rainbow-1": "bg-[color:color-mix(in_oklab,var(--rainbow-1)_15%,transparent)] text-[color:var(--rainbow-1)]",
  "rainbow-2": "bg-[color:color-mix(in_oklab,var(--rainbow-2)_22%,transparent)] text-[color:color-mix(in_oklab,var(--rainbow-2)_70%,var(--ink))]",
  "rainbow-3": "bg-[color:color-mix(in_oklab,var(--rainbow-3)_18%,transparent)] text-[color:var(--rainbow-3)]",
  "rainbow-4": "bg-[color:color-mix(in_oklab,var(--rainbow-4)_18%,transparent)] text-[color:var(--rainbow-4)]",
  "rainbow-5": "bg-[color:color-mix(in_oklab,var(--rainbow-5)_18%,transparent)] text-[color:var(--rainbow-5)]",
};

type Props = React.ComponentProps<"span"> & { tone?: Tone };

export function Pill({ tone = "neutral", className, ...props }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide",
        toneClass[tone],
        className,
      )}
      {...props}
    />
  );
}
