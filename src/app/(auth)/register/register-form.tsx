"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, AlertCircle } from "lucide-react";
import { AuthCard, CardFoot, CardHead } from "@/components/auth/auth-card";
import { Banner } from "@/components/auth/banner";
import { FieldText } from "@/components/auth/field-text";
import { LabeledDivider } from "@/components/auth/labeled-divider";
import { OAuthRow } from "@/components/auth/oauth-row";
import { PasswordField } from "@/components/auth/password-field";
import { Spinner } from "@/components/auth/spinner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { registerAction } from "@/lib/actions/register";
import { RegisterSchema, type RegisterInput } from "@/lib/validators/auth";

export function RegisterForm() {
  const router = useRouter();
  const [banner, setBanner] = React.useState<{ kind: "error" | "info"; msg: string } | null>(null);
  const [pending, startTransition] = React.useTransition();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { username: "", email: "", password: "", accept: false as unknown as true },
  });

  const accept = useWatch({ control: form.control, name: "accept" });
  const password = useWatch({ control: form.control, name: "password" });

  const onSubmit: SubmitHandler<RegisterInput> = (data) => {
    setBanner(null);
    startTransition(async () => {
      const res = await registerAction(data);
      if (!res.success) {
        if (res.fieldErrors) {
          for (const [k, v] of Object.entries(res.fieldErrors)) {
            form.setError(k as keyof RegisterInput, { message: v });
          }
        } else {
          setBanner({ kind: "error", msg: res.error ?? "Sign-up failed." });
        }
        return;
      }
      router.push(res.redirect ?? "/");
    });
  };

  return (
    <AuthCard>
      <CardHead
        eyebrow="Create account"
        title={
          <>
            Start your <em>vocabulary</em>.
          </>
        }
        sub="Free forever. No card required. One word a day if you want."
      />

      {banner && <Banner kind={banner.kind}>{banner.msg}</Banner>}

      <OAuthRow />
      <LabeledDivider>or with email</LabeledDivider>

      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <FieldText
          id="username"
          label="Username"
          autoComplete="username"
          autoFocus
          placeholder="alice_99"
          error={form.formState.errors.username?.message}
          {...form.register("username")}
        />
        <FieldText
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@studyhall.co"
          error={form.formState.errors.email?.message}
          {...form.register("email")}
        />
        <PasswordField
          name="password"
          label="Password"
          value={password}
          onChange={(v) => form.setValue("password", v, { shouldValidate: false })}
          autoComplete="new-password"
          showStrength
          showRequirements
          error={form.formState.errors.password?.message}
        />

        <label className="flex items-start gap-2.5 text-[13.5px] leading-snug text-ink-2 cursor-pointer select-none">
          <Checkbox
            checked={accept}
            onCheckedChange={(v) => form.setValue("accept", v === true ? (true as const) : (false as unknown as true), { shouldValidate: false })}
            className="mt-0.5"
          />
          <span>
            I agree to Lexa&apos;s{" "}
            <a href="#" className="border-b border-line-2 pb-px hover:border-ink">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="border-b border-line-2 pb-px hover:border-ink">
              Privacy Policy
            </a>.
          </span>
        </label>
        {form.formState.errors.accept && (
          <p className="-mt-2 flex items-center gap-1.5 text-[12.5px] text-danger">
            <AlertCircle className="size-4" aria-hidden />
            <span>{form.formState.errors.accept.message as string}</span>
          </p>
        )}

        <Button type="submit" disabled={pending} className="h-13 gap-2 rounded-md bg-ink text-bg hover:bg-ink-2">
          {pending ? <Spinner /> : (
            <>
              Create account
              <ArrowRight className="size-4" aria-hidden />
            </>
          )}
        </Button>
      </form>

      <CardFoot>
        Already have one? <Link href="/login">Sign in</Link>
      </CardFoot>
    </AuthCard>
  );
}

