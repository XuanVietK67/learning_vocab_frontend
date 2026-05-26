import * as React from "react";
import { AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type BannerKind = "error" | "info";

export function Banner({
  kind = "info",
  children,
  className,
}: {
  kind?: BannerKind;
  children: React.ReactNode;
  className?: string;
}) {
  const styles =
    kind === "error"
      ? "bg-danger-soft text-danger"
      : "bg-accent-soft text-accent";

  const Icon = kind === "error" ? AlertCircle : Info;

  return (
    <div
      role="alert"
      className={cn(
        "mb-1 flex items-start gap-2.5 rounded-sm px-3.5 py-3 text-[13px] leading-snug animate-fade-up",
        styles,
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </div>
  );
}
