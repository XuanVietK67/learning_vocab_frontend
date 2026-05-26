import Link from "next/link";
import * as React from "react";
import { Wordmark } from "@/components/auth/wordmark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-[2] flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-6 px-9 py-6">
        <Link href="/" aria-label="Lexa home">
          <Wordmark />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-12 pt-8">
        <div className="flex w-full max-w-[460px] flex-col gap-7">
          {children}
          <nav className="flex justify-center gap-4 text-[12.5px] text-muted-foreground">
            <a href="#" className="border-b border-transparent pb-px hover:border-muted-2">Help</a>
            <a href="#" className="border-b border-transparent pb-px hover:border-muted-2">Terms</a>
            <a href="#" className="border-b border-transparent pb-px hover:border-muted-2">Privacy</a>
            <a href="#" className="border-b border-transparent pb-px hover:border-muted-2">English (US)</a>
          </nav>
        </div>
      </main>
    </div>
  );
}
