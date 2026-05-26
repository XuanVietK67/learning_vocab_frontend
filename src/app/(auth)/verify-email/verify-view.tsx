"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { ArrowRight } from "lucide-react";
import { AuthCard, CardFoot, CardHead } from "@/components/auth/auth-card";
import { Banner } from "@/components/auth/banner";
import { VerifyLetter } from "@/components/auth/verify-letter";
import { Button } from "@/components/ui/button";
import { resendVerificationAction } from "@/lib/actions/stubs/resend-verification";

export function VerifyEmailView({ email }: { email: string }) {
  const router = useRouter();
  const [cooldown, setCooldown] = React.useState(0);
  const [resent, setResent] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const onResend = () => {
    if (cooldown > 0) return;
    startTransition(async () => {
      const res = await resendVerificationAction({ email });
      if (res.success) {
        setResent(true);
        setCooldown(res.cooldownSeconds);
      }
    });
  };

  return (
    <AuthCard>
      <VerifyLetter />
      <CardHead
        eyebrow="One last step"
        title={
          <>
            Verify your <em>email</em>.
          </>
        }
        sub={
          <>
            We sent a verification link to <b className="text-ink">{email}</b>.
            Click it to activate your account — it expires in 24 hours.
          </>
        }
      />

      {resent && <Banner kind="info">A new verification link is on its way.</Banner>}

      <Button onClick={() => router.push("/login")} className="h-13 w-full gap-2 rounded-md bg-ink text-bg hover:bg-ink-2">
        I&apos;ve verified — sign in <ArrowRight className="size-4" aria-hidden />
      </Button>

      <CardFoot>
        <div className="flex items-center justify-between gap-3">
          <Link href="/register">Wrong email?</Link>
          <button
            type="button"
            onClick={onResend}
            disabled={pending || cooldown > 0}
            className="cursor-pointer border-b border-line-2 pb-px font-medium text-ink hover:border-ink disabled:cursor-default disabled:text-muted-2 disabled:hover:border-line-2"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend link"}
          </button>
        </div>
      </CardFoot>
    </AuthCard>
  );
}
