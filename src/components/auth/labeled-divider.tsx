import * as React from "react";

export function LabeledDivider({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-1 flex items-center gap-3 text-xs tracking-wider text-muted-foreground">
      <span className="h-px flex-1 bg-line" />
      <span>{children}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
