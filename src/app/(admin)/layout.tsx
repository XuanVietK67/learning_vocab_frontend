import Link from "next/link";
import { redirect } from "next/navigation";
import * as React from "react";
import { LogOut } from "lucide-react";
import { Wordmark } from "@/components/auth/wordmark";
import { logoutAction } from "@/lib/actions/logout";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminSidebar } from "./_shell/admin-sidebar";

// Admin gate. Mirrors the (onboarding) layout's redirect chain so it stays
// consistent with postAuthRedirect — anyone reaching /admin who isn't an
// authenticated admin is bounced to where they actually belong.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!user.isEmailVerified) redirect(`/verify-email?email=${encodeURIComponent(user.email)}`);
  if (user.role !== "admin") redirect("/");

  return (
    <div className="relative z-2 flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-6 px-9 py-6">
        <Link href="/admin" aria-label="Lexa admin">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
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
        </nav>
      </header>
      <div className="flex flex-1 gap-6 px-6 pb-12 pt-2">
        <AdminSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
