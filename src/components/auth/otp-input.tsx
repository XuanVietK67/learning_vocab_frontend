"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function AuthOtpInput({
  value,
  onChange,
  length = 6,
  shake = false,
  autoFocus = true,
  onComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  length?: number;
  shake?: boolean;
  autoFocus?: boolean;
  onComplete?: (v: string) => void;
}) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);
  const cells = Array.from({ length }, (_, i) => value[i] ?? "");
  const completedRef = React.useRef(false);

  const setAt = (i: number, ch: string) => {
    const next = cells.slice();
    next[i] = ch;
    const joined = next.join("");
    onChange(joined);
    if (joined.length === length && !joined.includes("") && !completedRef.current) {
      completedRef.current = true;
      onComplete?.(joined);
    } else if (joined.length < length || joined.includes("")) {
      completedRef.current = false;
    }
  };

  const onCellChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(-1);
    if (!v) return;
    setAt(i, v);
    if (i < length - 1) refs.current[i + 1]?.focus();
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (cells[i]) setAt(i, "");
      else if (i > 0) {
        const next = cells.slice();
        next[i - 1] = "";
        onChange(next.join(""));
        refs.current[i - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const digits = (e.clipboardData.getData("text") || "")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!digits) return;
    e.preventDefault();
    onChange(digits.padEnd(length, "").slice(0, length));
    if (digits.length === length) {
      completedRef.current = true;
      onComplete?.(digits);
    }
    const focusAt = Math.min(digits.length, length - 1);
    setTimeout(() => refs.current[focusAt]?.focus(), 0);
  };

  return (
    <div
      onPaste={onPaste}
      className={cn(
        "flex justify-center gap-2.5 py-3",
        shake && "animate-shake",
      )}
    >
      {cells.map((c, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={c}
          onChange={(e) => onCellChange(i, e)}
          onKeyDown={(e) => onKey(i, e)}
          inputMode="numeric"
          maxLength={1}
          autoFocus={autoFocus && i === 0}
          aria-label={`Digit ${i + 1}`}
          className={cn(
            "size-14 rounded-xl border-2 border-line bg-card text-center text-[26px] font-semibold tabular-nums text-ink outline-none transition-all duration-150",
            "focus:-translate-y-px focus:border-accent focus:ring-4 focus:ring-accent-soft",
            c && "animate-pop border-accent bg-accent-soft text-accent",
          )}
          style={{ width: 56, height: 64 }}
        />
      ))}
    </div>
  );
}
