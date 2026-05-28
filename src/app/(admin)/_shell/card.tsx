import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-card p-5 shadow-[0_8px_20px_-18px_rgba(255,107,107,0.4)]",
        className,
      )}
      {...props}
    />
  );
}
