import Link from "next/link";
import { redirect } from "next/navigation";
import * as React from "react";
import { Wordmark } from "@/components/auth/wordmark";
import { getCurrentUser } from "@/lib/auth/session";

// Auth + onboarding gate.
// - Anonymous → /login (with ?next= so they bounce back).
// - Signed-in but email not verified → /verify-email (matches postAuthRedirect chain).
// - Admin → /admin (admins skip the learner onboarding flow).
// - Signed-in and already onboarded → home (no point being here).
// - Signed-in, verified, not onboarded → render the flow.
export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/onboarding");
  if (!user.isEmailVerified) redirect(`/verify-email?email=${encodeURIComponent(user.email)}`);
  if (user.role === "admin") redirect("/admin");
  if (user.isOnboarded) redirect("/");

  return (
    <div className="relative z-2 flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b-2 border-dashed border-line px-10 py-5 max-md:px-6">
        <Link href="/" aria-label="Lexa home">
          <Wordmark />
        </Link>
        <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          Set up your account
        </div>
      </header>
      {children}
    </div>
  );
}
