"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookText, LayoutDashboard, Tag, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/vocabularies", label: "Vocabularies", icon: BookText },
  { href: "/admin/topics", label: "Topics", icon: Tag },
  { href: "/admin/users", label: "Users", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-56 shrink-0 flex-col rounded-2xl border border-line bg-card/80 p-3 shadow-[0_10px_24px_-18px_rgba(255,107,107,0.5)] md:flex">
      <nav className="flex flex-col gap-1">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-accent-soft text-accent"
                  : "text-ink-2 hover:bg-[color:var(--hover)]",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-xl bg-bg-soft px-3 py-2.5 text-[0.7rem] text-muted-foreground">
        Admin panel · Lexa
      </div>
    </aside>
  );
}
