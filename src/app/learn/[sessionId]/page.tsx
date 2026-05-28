import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = {
  title: "Learning session — Lexa",
};

export default async function LearnSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/");
  if (!user.isOnboarded) redirect("/onboarding");

  const { sessionId } = await params;

  return (
    <main className="relative z-2 mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 py-12">
      <div className="w-full animate-fade-up rounded-2xl border border-line bg-card p-8 text-center shadow-[0_10px_24px_-12px_rgba(255,107,107,0.35)]">
        <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Sparkles className="size-6" aria-hidden />
        </div>
        <h1 className="font-display text-2xl text-ink">Session ready</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The learn flow lands here next. For now this page just confirms the
          session was created.
        </p>
        <p className="mt-4 break-all font-mono text-[11px] uppercase tracking-[0.12em] text-muted-2">
          session id · {sessionId}
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex items-center gap-2 rounded-xl border border-line-2 bg-transparent px-4 py-2.5 text-sm font-medium text-ink hover:bg-[color:var(--hover)]"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to home
        </Link>
      </div>
    </main>
  );
}
