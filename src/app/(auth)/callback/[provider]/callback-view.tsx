"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { Check } from "lucide-react";
import { AuthCard, CardFoot, CardHead } from "@/components/auth/auth-card";
import { signInWithGithubAction } from "@/lib/actions/oauth";
import { cn } from "@/lib/utils";

type Provider = "google" | "github" | "apple";
const LABELS: Record<Provider, string> = {
  google: "Google",
  github: "GitHub",
  apple: "Apple",
};

export function CallbackView({
  provider,
  code,
  state,
  providerError,
}: {
  provider: Provider;
  code?: string;
  state?: string;
  providerError?: string;
}) {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [error, setError] = React.useState<string | null>(providerError ?? null);

  const steps = React.useMemo(
    () => [
      `Authenticating with ${LABELS[provider]}`,
      "Exchanging credentials",
      "Loading your profile",
    ],
    [provider],
  );

  // Missing-code case is derived at render time — no setState needed.
  const renderError =
    error ?? (provider === "github" && !code ? "Missing authorization code." : null);

  React.useEffect(() => {
    if (renderError) return;
    let alive = true;
    const timeouts: number[] = [];

    const advance = (i: number) =>
      window.setTimeout(() => {
        if (!alive) return;
        if (i < steps.length) {
          setStep(i);
          timeouts.push(advance(i + 1));
        }
      }, 700);
    timeouts.push(advance(1));

    if (provider === "github" && code) {
      void (async () => {
        const expected = sessionStorage.getItem("lexa_oauth_state");
        if (expected && state && expected !== state) {
          if (alive) setError("OAuth state mismatch.");
          return;
        }
        sessionStorage.removeItem("lexa_oauth_state");
        const res = await signInWithGithubAction(code);
        if (!alive) return;
        if (!res.success) {
          setError(res.error ?? "GitHub sign-in failed.");
          return;
        }
        timeouts.push(
          window.setTimeout(() => alive && router.push(res.redirect ?? "/"), 800),
        );
      })();
    } else {
      // Google/Apple use popups; if we land here without their result, head back.
      timeouts.push(
        window.setTimeout(() => alive && router.push("/login"), 2400),
      );
    }

    return () => {
      alive = false;
      timeouts.forEach((id) => clearTimeout(id));
    };
  }, [provider, code, state, steps.length, router, renderError]);

  return (
    <AuthCard>
      <CardHead
        eyebrow="Signing in"
        title={
          <>
            Hold on a <em>second</em>.
          </>
        }
        sub={renderError ? renderError : `Finishing up with ${LABELS[provider]}…`}
      />

      {!renderError && (
        <div className="flex flex-col items-center gap-4 px-2 py-6 text-center">
          <div className="relative size-14 rounded-full">
            <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-line border-t-accent" />
          </div>
          <ul className="mt-1 flex w-full flex-col gap-2 text-left">
            {steps.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li
                  key={s}
                  className={cn(
                    "flex items-center gap-2.5 rounded-sm px-3.5 py-2.5 text-[13.5px] transition-colors",
                    done && "border border-line bg-card text-ink-2",
                    active && "bg-accent-soft text-ink",
                    !done && !active && "bg-bg-soft text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-4 items-center justify-center rounded-full border",
                      done && "border-success bg-success text-white",
                      active && "border-accent before:size-1.5 before:rounded-full before:bg-accent",
                      !done && !active && "border-muted-2",
                    )}
                  >
                    {done && <Check className="size-2.5" strokeWidth={3} aria-hidden />}
                  </span>
                  <span>{s}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <CardFoot>
        Stuck? <button type="button" onClick={() => router.push("/login")}>Cancel and go back</button>
      </CardFoot>
    </AuthCard>
  );
}
