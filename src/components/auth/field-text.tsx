"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type FieldTextProps = React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: React.ReactNode;
  error?: string;
};

export const FieldText = React.forwardRef<HTMLInputElement, FieldTextProps>(
  function FieldText({ id, label, hint, error, className, ...props }, ref) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between text-[13px] font-medium text-ink-2">
          <label htmlFor={id}>{label}</label>
          {hint && (
            <span className="text-[12.5px] font-normal text-muted-foreground">
              {hint}
            </span>
          )}
        </div>
        <Input
          id={id}
          ref={ref}
          spellCheck={false}
          aria-invalid={!!error || undefined}
          className={cn(
            "h-13 rounded-md border-line-2 bg-card text-[15px] focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent aria-invalid:border-danger aria-invalid:bg-danger-soft",
            className,
          )}
          {...props}
        />
        {error && <p className="text-[12.5px] text-danger">{error}</p>}
      </div>
    );
  },
);
