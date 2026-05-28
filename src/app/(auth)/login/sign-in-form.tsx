"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { AuthCard, CardFoot, CardHead } from "@/components/auth/auth-card";
import { Banner } from "@/components/auth/banner";
import { LabeledDivider } from "@/components/auth/labeled-divider";
import { FieldText } from "@/components/auth/field-text";
import { OAuthRow } from "@/components/auth/oauth-row";
import { PasswordField } from "@/components/auth/password-field";
import { Spinner } from "@/components/auth/spinner";
import { VerifyLetter } from "@/components/auth/verify-letter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { signInAction } from "@/lib/actions/sign-in";
import { magicLinkAction } from "@/lib/actions/stubs/magic-link";
import { isAuthGate } from "@/lib/auth/post-auth-redirect";
import { SignInSchema, type SignInInput } from "@/lib/validators/auth";

type Mode = "password" | "magic-link";

export function SignInForm() {
  const router = useRouter();
  const search = useSearchParams();
  const nextParam = search.get("next") ?? undefined;

  const [mode, setMode] = React.useState<Mode>("password");
  const [magicSent, setMagicSent] = React.useState(false);
  const [banner, setBanner] = React.useState<{ kind: "error" | "info"; msg: string } | null>(null);
  const [pending, startTransition] = React.useTransition();

  const form = useForm<SignInInput>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const remember = useWatch({ control: form.control, name: "remember" });
  const emailValue = useWatch({ control: form.control, name: "email" });
  const passwordValue = useWatch({ control: form.control, name: "password" });

  const onSubmit: SubmitHandler<SignInInput> = (data) => {
    setBanner(null);
    if (mode === "magic-link") {
      startTransition(async () => {
        const res = await magicLinkAction({ email: data.email });
        if (!res.success) {
          if (res.fieldErrors) {
            for (const [k, v] of Object.entries(res.fieldErrors)) {
              form.setError(k as keyof SignInInput, { message: v });
            }
          } else {
            setBanner({ kind: "error", msg: res.error ?? "Couldn't send link." });
          }
          return;
        }
        setMagicSent(true);
      });
      return;
    }

    startTransition(async () => {
      const res = await signInAction(data);
      if (!res.success) {
        if (res.fieldErrors) {
          for (const [k, v] of Object.entries(res.fieldErrors)) {
            form.setError(k as keyof SignInInput, { message: v });
          }
        } else {
          setBanner({ kind: "error", msg: res.error ?? "Sign-in failed." });
        }
        return;
      }
      // Auth gates (verify-email, onboarding) take precedence over `?next=`
      // — the user can't reach the requested page until they clear the gate.
      const dest =
        res.redirect && isAuthGate(res.redirect)
          ? res.redirect
          : (nextParam ?? res.redirect ?? "/");
      router.push(dest);
    });
  };

  if (mode === "magic-link" && magicSent) {
    return (
      <AuthCard>
        <CardHead
          eyebrow="Magic link"
          title="Check your inbox"
          sub={`We sent a sign-in link to ${emailValue}. It expires in 15 minutes.`}
        />
        <VerifyLetter />
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setMagicSent(false);
            setMode("password");
          }}
        >
          Use password instead
        </Button>
        <CardFoot>
          Didn&apos;t get it?{" "}
          <a onClick={() => setMagicSent(false)}>Resend</a>
        </CardFoot>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <CardHead
        eyebrow="Welcome back"
        title={
          <>
            Sign <em>in</em> to Lexa
          </>
        }
        sub="Pick up your streak where you left off."
      />

      {banner && <Banner kind={banner.kind}>{banner.msg}</Banner>}

      <OAuthRow />
      <LabeledDivider>or with email</LabeledDivider>

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

        {mode === "password" && (
          <PasswordField
            name="password"
            value={passwordValue}
            onChange={(v) => form.setValue("password", v, { shouldValidate: false })}
            error={form.formState.errors.password?.message}
            autoComplete="current-password"
            hint={
              <Link href="/forgot-password" className="border-b border-line-2 pb-px hover:border-ink">
                Forgot password?
              </Link>
            }
          />
        )}

        <div className="mt-1 flex items-center justify-between gap-2">
          {mode === "password" && (
            <label className="flex items-center gap-2.5 text-[13.5px] text-ink-2 cursor-pointer select-none">
              <Checkbox
                checked={remember}
                onCheckedChange={(v) => form.setValue("remember", v === true)}
              />
              Remember me on this device
            </label>
          )}
          <button
            type="button"
            onClick={() => {
              setBanner(null);
              setMode((m) => (m === "password" ? "magic-link" : "password"));
            }}
            className="ml-auto cursor-pointer border-b border-line-2 pb-px text-[13px] text-muted-foreground hover:border-ink"
          >
            {mode === "password" ? "Email me a magic link" : "Use password"}
          </button>
        </div>

        <Button type="submit" disabled={pending} className="h-13 gap-2 rounded-md bg-ink text-bg hover:bg-ink-2">
          {pending ? <Spinner /> : (
            <>
              {mode === "magic-link" ? "Send magic link" : "Sign in"}
              <ArrowRight className="size-4" aria-hidden />
            </>
          )}
        </Button>
      </form>

      <CardFoot>
        New to Lexa?{" "}
        <Link href="/register">Create an account</Link>
      </CardFoot>
    </AuthCard>
  );
}

