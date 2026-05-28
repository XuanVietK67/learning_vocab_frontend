import Link from "next/link";
import * as React from "react";
import { LogOut } from "lucide-react";
import { Wordmark } from "@/components/auth/wordmark";
import { logoutAction } from "@/lib/actions/logout";
import { getCurrentUser } from "@/lib/auth/session";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="relative z-2 flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-6 px-9 py-6">
        <Link href="/" aria-label="Lexa home">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          {user ? (
            <>
              <span className="text-ink">{user.username}</span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-line-2 bg-transparent px-3.5 py-2 text-sm font-medium text-ink hover:bg-[color:var(--hover)]"
                >
                  <LogOut className="size-4" aria-hidden />
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-ink">Sign in</Link>
              <Link
                href="/register"
                className="rounded-md bg-ink px-3.5 py-2 text-sm font-medium text-bg hover:bg-ink-2"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>
      <main className="flex flex-1 flex-col px-6 pb-12 pt-4">{children}</main>
    </div>
  );
}
