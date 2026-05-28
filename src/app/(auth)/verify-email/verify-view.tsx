"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Sparkles } from "lucide-react";
import { AuthCard, CardFoot, CardHead } from "@/components/auth/auth-card";
import { AuthOtpInput } from "@/components/auth/otp-input";
import { Banner } from "@/components/auth/banner";
import { Spinner } from "@/components/auth/spinner";
import { VerifyLetter } from "@/components/auth/verify-letter";
import { Button } from "@/components/ui/button";
import { resendVerificationAction } from "@/lib/actions/resend-verification";
import { verifyEmailAction } from "@/lib/actions/verify-email";

const RESEND_COOLDOWN_SECONDS = 60;

export function VerifyEmailView({ email }: { email: string }) {
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [shake, setShake] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(RESEND_COOLDOWN_SECONDS);
  const [notice, setNotice] = React.useState<
    { kind: "info" | "error"; msg: string } | null
  >(null);
  const [verifyPending, startVerify] = React.useTransition();
  const [resendPending, startResend] = React.useTransition();

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const onSubmit = (value?: string) => {
    const submitted = (value ?? code).trim();
    if (submitted.length !== 6 || verifyPending) return;
    setNotice(null);
    startVerify(async () => {
      const res = await verifyEmailAction({ code: submitted });
      if (res.success) {
        router.push(res.redirect ?? "/");
        return;
      }
      setCode("");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setNotice({
        kind: "error",
        msg: res.error ?? res.fieldErrors?.code ?? "Wrong code. Try again.",
      });
    });
  };

  const onResend = () => {
    if (cooldown > 0 || resendPending) return;
    setNotice(null);
    setCode("");
    startResend(async () => {
      const res = await resendVerificationAction();
      if (res.success) {
        setCooldown(RESEND_COOLDOWN_SECONDS);
        setNotice({ kind: "info", msg: "A new 6-digit code is on its way." });
        return;
      }
      setCooldown(res.retryAfterSeconds ?? RESEND_COOLDOWN_SECONDS);
      setNotice({ kind: "error", msg: res.error });
    });
  };

  return (
    <AuthCard className="relative overflow-hidden rounded-2xl">
      <span
        aria-hidden
        className="pointer-events-none absolute -left-6 -top-6 size-24 rounded-full opacity-60 blur-2xl"
        style={{ background: "var(--rainbow-2)" }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-8 -right-10 size-28 rounded-full opacity-50 blur-2xl"
        style={{ background: "var(--rainbow-4)" }}
      />

      <VerifyLetter />
      <CardHead
        eyebrow={
          <span className="inline-flex items-center gap-1.5 text-accent">
            <Sparkles className="size-3.5" aria-hidden /> One last step
          </span>
        }
        title={
          <>
            Verify your <em>email</em>.
          </>
        }
        sub={
          <>
            We popped a 6-digit code into <b className="text-ink">{email}</b>.
            Type it in below — it expires in 10 minutes.
          </>
        }
      />

      {notice && <Banner kind={notice.kind}>{notice.msg}</Banner>}

      <AuthOtpInput
        value={code}
        onChange={setCode}
        shake={shake}
        onComplete={(v) => onSubmit(v)}
      />

      <Button
        onClick={() => onSubmit()}
        disabled={code.length !== 6 || verifyPending}
        className="mt-2 h-13 w-full gap-2 rounded-2xl bg-accent text-accent-foreground shadow-[0_10px_24px_-12px_rgba(255,107,107,0.6)] hover:brightness-95 disabled:bg-line-2 disabled:text-muted-foreground disabled:shadow-none"
      >
        {verifyPending ? (
          <Spinner />
        ) : (
          <>
            Verify <Sparkles className="size-4" aria-hidden />
          </>
        )}
      </Button>

      <CardFoot>
        <div className="flex items-center justify-between gap-3">
          <Link href="/register">Wrong email?</Link>
          <button
            type="button"
            onClick={onResend}
            disabled={resendPending || cooldown > 0}
            className="cursor-pointer rounded-full bg-accent-soft px-3 py-1 font-medium text-accent transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-default disabled:bg-line disabled:text-muted-2 disabled:hover:bg-line"
          >
            {resendPending
              ? "Sending…"
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend code"}
          </button>
        </div>
      </CardFoot>
    </AuthCard>
  );
}
