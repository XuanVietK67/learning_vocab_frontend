"use client";

import * as React from "react";
import { Eye, EyeOff, ArrowBigUp, Check, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  evaluatePassword,
  STRENGTH_LABELS,
} from "@/lib/auth/password";

type PasswordFieldProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  label?: string;
  hint?: React.ReactNode;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  showStrength?: boolean;
  showRequirements?: boolean;
};

export function PasswordField({
  id,
  name = "password",
  value,
  onChange,
  onBlur,
  label = "Password",
  hint,
  placeholder = "••••••••",
  error,
  autoComplete = "current-password",
  autoFocus,
  showStrength = false,
  showRequirements = false,
}: PasswordFieldProps) {
  const [shown, setShown] = React.useState(false);
  const [capsOn, setCapsOn] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const autoId = React.useId();
  const inputId = id ?? autoId;

  React.useEffect(() => {
    if (!focused) return;
    const onKey = (e: KeyboardEvent) => {
      if (typeof e.getModifierState === "function") {
        setCapsOn(e.getModifierState("CapsLock"));
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, [focused]);

  const { reqs, strength } = evaluatePassword(value);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-[13px] font-medium text-ink-2">
        <label htmlFor={inputId}>{label}</label>
        {hint && (
          <span className="text-[12.5px] font-normal text-muted-foreground">
            {hint}
          </span>
        )}
      </div>

      <div className="relative flex items-center">
        <Input
          id={inputId}
          name={name}
          type={shown ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setCapsOn(false);
            onBlur?.();
          }}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          spellCheck={false}
          aria-invalid={!!error || undefined}
          className={cn(
            "h-13 rounded-md border-line-2 bg-card pr-12 text-[15px] focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent",
            error && "border-danger bg-danger-soft focus-visible:ring-danger/40",
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? "Hide password" : "Show password"}
          className="absolute right-1.5 inline-flex size-10 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-[color:var(--hover)] hover:text-ink"
        >
          {shown ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
        </button>
      </div>

      {error ? (
        <p className="flex min-h-4 items-center gap-1.5 text-[12.5px] text-danger">
          <AlertCircle className="size-4" aria-hidden />
          <span>{error}</span>
        </p>
      ) : capsOn ? (
        <p className="flex min-h-4 items-center gap-1.5 text-[12.5px] text-warn">
          <ArrowBigUp className="size-3.5" aria-hidden />
          <span>Caps Lock is on</span>
        </p>
      ) : null}

      {showStrength && value.length > 0 && (
        <>
          <div className="mt-0.5 flex gap-1" aria-hidden>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full bg-line transition-colors",
                  i <= strength && strengthSegmentColor(strength),
                )}
              />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
            <span>Strength</span>
            <strong className="font-semibold text-ink-2">
              {STRENGTH_LABELS[strength]}
            </strong>
          </div>
        </>
      )}

      {showRequirements && (
        <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[12.5px] text-muted-foreground">
          <Req met={reqs.length} label="8+ characters" />
          <Req met={reqs.upper} label="Uppercase letter" />
          <Req met={reqs.lower} label="Lowercase letter" />
          <Req met={reqs.number} label="Number" />
          <Req met={reqs.symbol} label="Symbol" />
        </ul>
      )}
    </div>
  );
}

function strengthSegmentColor(strength: number) {
  switch (strength) {
    case 1:
      return "bg-[#c2410c]";
    case 2:
      return "bg-[#d97706]";
    case 3:
      return "bg-[#65a30d]";
    case 4:
      return "bg-success";
    default:
      return "";
  }
}

function Req({ met, label }: { met: boolean; label: string }) {
  return (
    <li
      className={cn(
        "flex items-center gap-1.5 transition-colors",
        met && "text-success",
      )}
    >
      <span
        className={cn(
          "inline-flex size-3.5 items-center justify-center rounded-full border border-muted-2 transition-colors",
          met && "border-success bg-success text-white",
        )}
      >
        {met && <Check className="size-2.5" aria-hidden strokeWidth={3} />}
      </span>
      <span>{label}</span>
    </li>
  );
}
