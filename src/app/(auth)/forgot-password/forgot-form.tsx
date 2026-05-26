"use client";

import Link from "next/link";
import * as React from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { AuthCard, CardFoot, CardHead } from "@/components/auth/auth-card";
import { FieldText } from "@/components/auth/field-text";
import { Spinner } from "@/components/auth/spinner";
import { VerifyLetter } from "@/components/auth/verify-letter";
import { Button } from "@/components/ui/button";
import { forgotPasswordAction } from "@/lib/actions/stubs/forgot-password";
import { ForgotSchema, type ForgotInput } from "@/lib/validators/auth";

export function ForgotForm() {
  const [sent, setSent] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const form = useForm<ForgotInput>({
    resolver: zodResolver(ForgotSchema),
    defaultValues: { email: "" },
  });

  const email = useWatch({ control: form.control, name: "email" });

  const onSubmit: SubmitHandler<ForgotInput> = (data) => {
    startTransition(async () => {
      const res = await forgotPasswordAction(data);
      if (!res.success && res.fieldErrors) {
        for (const [k, v] of Object.entries(res.fieldErrors)) {
          form.setError(k as keyof ForgotInput, { message: v });
        }
        return;
      }
      setSent(true);
    });
  };

  if (sent) {
    return (
      <AuthCard>
        <CardHead
          eyebrow="Reset password"
          title="Check your inbox"
          sub={
            <>
              If an account exists for{" "}
              <b className="text-ink">{email}</b>, we sent a link to reset your
              password.
            </>
          }
        />
        <VerifyLetter />
        <p className="mb-4 text-center text-[13px] text-muted-foreground">
          The link expires in 1 hour.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">
            <ArrowLeft className="size-4" aria-hidden />
            Back to sign in
          </Link>
        </Button>
        <CardFoot>
          Didn&apos;t get it?{" "}
          <a onClick={() => setSent(false)}>Try a different email</a>
          {" · "}
          <Link href="/reset-password?token=demo">Open reset link (demo)</Link>
        </CardFoot>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <CardHead
        eyebrow="Reset password"
        title={
          <>
            Forgot your <em>password</em>?
          </>
        }
        sub="Enter the email tied to your account and we'll send you a reset link."
      />
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldText
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="you@studyhall.co"
          error={form.formState.errors.email?.message}
          {...form.register("email")}
        />
        <Button type="submit" disabled={pending} className="h-13 gap-2 rounded-md bg-ink text-bg hover:bg-ink-2">
          {pending ? <Spinner /> : "Send reset link"}
        </Button>
        <Button asChild variant="outline" className="h-13 w-full">
          <Link href="/login">
            <ArrowLeft className="size-4" aria-hidden />
            Back to sign in
          </Link>
        </Button>
      </form>
    </AuthCard>
  );
}
