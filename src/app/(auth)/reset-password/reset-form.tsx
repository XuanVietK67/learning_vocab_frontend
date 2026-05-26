"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { AuthCard, CardHead } from "@/components/auth/auth-card";
import { PasswordField } from "@/components/auth/password-field";
import { Spinner } from "@/components/auth/spinner";
import { Button } from "@/components/ui/button";
import { resetPasswordAction } from "@/lib/actions/stubs/reset-password";
import { ResetSchema, type ResetInput } from "@/lib/validators/auth";

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [done, setDone] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const form = useForm<ResetInput>({
    resolver: zodResolver(ResetSchema),
    defaultValues: { token, password: "", confirm: "" },
  });

  const password = useWatch({ control: form.control, name: "password" });
  const confirm = useWatch({ control: form.control, name: "confirm" });

  const onSubmit: SubmitHandler<ResetInput> = (data) => {
    startTransition(async () => {
      const res = await resetPasswordAction(data);
      if (!res.success) {
        if (res.fieldErrors) {
          for (const [k, v] of Object.entries(res.fieldErrors)) {
            form.setError(k as keyof ResetInput, { message: v });
          }
        }
        return;
      }
      setDone(true);
    });
  };

  if (done) {
    return (
      <AuthCard>
        <CardHead
          eyebrow="All set"
          title={
            <>
              Password <em>updated</em>.
            </>
          }
          sub="You can sign in with your new password now."
        />
        <div className="mb-4 flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-accent text-3xl font-bold text-accent-ink">
            ✓
          </div>
        </div>
        <Button onClick={() => router.push("/login")} className="h-13 w-full gap-2 rounded-md bg-ink text-bg hover:bg-ink-2">
          Go to sign in <ArrowRight className="size-4" aria-hidden />
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <CardHead
        eyebrow="Reset password"
        title={
          <>
            Choose a <em>new password</em>.
          </>
        }
        sub="Make it strong, but something you'll remember. Or use a password manager."
      />
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <PasswordField
          name="password"
          label="New password"
          value={password}
          onChange={(v) => form.setValue("password", v, { shouldValidate: false })}
          autoComplete="new-password"
          showStrength
          showRequirements
          error={form.formState.errors.password?.message}
          autoFocus
        />
        <PasswordField
          name="confirm"
          label="Confirm password"
          value={confirm}
          onChange={(v) => form.setValue("confirm", v, { shouldValidate: false })}
          autoComplete="new-password"
          error={form.formState.errors.confirm?.message}
        />
        <Button type="submit" disabled={pending} className="h-13 gap-2 rounded-md bg-ink text-bg hover:bg-ink-2">
          {pending ? <Spinner /> : "Update password"}
        </Button>
      </form>
    </AuthCard>
  );
}
