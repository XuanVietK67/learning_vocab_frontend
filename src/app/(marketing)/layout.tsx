import Link from "next/link";
import * as React from "react";
import { Wordmark } from "@/components/auth/wordmark";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-[2] flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-6 px-9 py-6">
        <Link href="/" aria-label="Lexa home">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-ink">Sign in</Link>
          <Link
            href="/register"
            className="rounded-md bg-ink px-3.5 py-2 text-sm font-medium text-bg hover:bg-ink-2"
          >
            Get started
          </Link>
        </nav>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-12 pt-4">
        {children}
      </main>
    </div>
  );
}
