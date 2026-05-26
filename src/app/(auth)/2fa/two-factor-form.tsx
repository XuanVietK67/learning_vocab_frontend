"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { AlertCircle, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { AuthCard, CardFoot, CardHead } from "@/components/auth/auth-card";
import { AuthOtpInput } from "@/components/auth/otp-input";
import { Spinner } from "@/components/auth/spinner";
import { Button } from "@/components/ui/button";
import { verifyOtpAction } from "@/lib/actions/stubs/verify-otp";

export function TwoFactorForm() {
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [shake, setShake] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const submit = (value: string) => {
    setError(null);
    startTransition(async () => {
      const res = await verifyOtpAction({ code: value });
      if (!res.success) {
        setError(res.error ?? "That code didn't match.");
        setShake(true);
        setTimeout(() => setShake(false), 450);
        setCode("");
        return;
      }
      router.push(res.redirect ?? "/");
    });
  };

  const onComplete = (v: string) => submit(v);

  return (
    <AuthCard>
      <div className="mb-3 flex justify-center text-accent">
        <ShieldCheck className="size-5" aria-hidden />
      </div>
      <CardHead
        eyebrow="Two-factor auth"
        title={
          <>
            Enter your <em>6-digit</em> code.
          </>
        }
        sub="We sent a code to your authenticator app. It refreshes every 30 seconds."
      />

      <AuthOtpInput value={code} onChange={setCode} shake={shake} onComplete={onComplete} />

      {error && (
        <p className="mt-2 flex items-center justify-center gap-1.5 text-[12.5px] text-danger">
          <AlertCircle className="size-4" aria-hidden />
          <span>{error}</span>
        </p>
      )}

      <div className="h-1" />

      <Button
        onClick={() => submit(code)}
        disabled={pending || code.length !== 6}
        className="h-13 w-full gap-2 rounded-md bg-ink text-bg hover:bg-ink-2"
      >
        {pending ? <Spinner /> : (
          <>
            Verify and continue <ArrowRight className="size-4" aria-hidden />
          </>
        )}
      </Button>

      <CardFoot>
        <div className="flex items-center justify-between gap-3">
          <Link href="/login" className="inline-flex items-center gap-1">
            <ArrowLeft className="size-3.5" aria-hidden /> Use a different account
          </Link>
          <button
            type="button"
            onClick={() => {
              if (cooldown > 0) return;
              setCooldown(30);
              setError(null);
            }}
            disabled={cooldown > 0}
            className="cursor-pointer border-b border-line-2 pb-px font-medium text-ink hover:border-ink disabled:cursor-default disabled:text-muted-2 disabled:hover:border-line-2"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </div>
      </CardFoot>
    </AuthCard>
  );
}
