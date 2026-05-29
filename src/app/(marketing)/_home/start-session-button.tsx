"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { startSessionAction } from "@/lib/actions/start-session";
import type { StartSessionInput } from "@/lib/api/learn";
import { saveSession } from "@/lib/learn/session-store";
import { cn } from "@/lib/utils";

type Props = {
  input: StartSessionInput;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "soft" | "ghost";
  size?: "md" | "sm";
  disabled?: boolean;
};

const VARIANTS: Record<NonNullable<Props["variant"]>, string> = {
  primary:
    "bg-accent text-accent-foreground shadow-[0_10px_24px_-12px_rgba(255,107,107,0.6)] hover:brightness-95",
  soft: "bg-accent-soft text-accent hover:bg-accent-soft/80",
  ghost: "border border-line-2 bg-transparent text-ink hover:bg-[color:var(--hover)]",
};

const SIZES: Record<NonNullable<Props["size"]>, string> = {
  md: "h-11 px-5 text-sm",
  sm: "h-9 px-3.5 text-xs",
};

export function StartSessionButton({
  input,
  children,
  className,
  variant = "primary",
  size = "md",
  disabled,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const onClick = () => {
    startTransition(async () => {
      const res = await startSessionAction(input);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      // Stash the signed items client-side, then hand off to the player route.
      saveSession({ input, session: res.session, translationLang: res.translationLang });
      router.push(`/learn/${res.session.sessionId}`);
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || pending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}
