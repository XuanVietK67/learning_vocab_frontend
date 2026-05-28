import type { Metadata } from "next";
import Link from "next/link";
import { BookText, Plus, Sparkles, Tag, Upload, Users } from "lucide-react";
import { adminVocabApi } from "@/lib/api/admin-vocab";
import { topicsApi } from "@/lib/api/topics";
import { ApiError } from "@/lib/api/types";
import { Card } from "../_shell/card";
import { PageHeader } from "../_shell/page-header";

export const metadata: Metadata = { title: "Admin — Lexa" };

async function safeCount(p: Promise<{ total: number }>): Promise<number | null> {
  try {
    const r = await p;
    return r.total;
  } catch (e) {
    if (e instanceof ApiError) return null;
    throw e;
  }
}

async function safeTopicsCount(): Promise<number | null> {
  try {
    return (await topicsApi.list()).length;
  } catch (e) {
    if (e instanceof ApiError) return null;
    throw e;
  }
}

type TileProps = {
  label: string;
  value: number | null;
  href: string;
  tint: 1 | 2 | 3 | 4 | 5;
};

function StatTile({ label, value, href, tint }: TileProps) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-line bg-card p-5 shadow-[0_8px_20px_-18px_rgba(255,107,107,0.4)] transition-transform hover:-translate-y-0.5"
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full opacity-50 blur-2xl"
        style={{ background: `var(--rainbow-${tint})` }}
        aria-hidden
      />
      <p className="relative text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="relative mt-2 font-display text-4xl font-semibold italic text-ink">
        {value === null ? "—" : value.toLocaleString()}
      </p>
    </Link>
  );
}

export default async function AdminDashboardPage() {
  const [total, pending, topicsCount] = await Promise.all([
    safeCount(adminVocabApi.list({ limit: 1 })),
    safeCount(adminVocabApi.list({ limit: 1, isApproved: false })),
    safeTopicsCount(),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="Admin overview"
        description="Curate the system vocabulary catalog, topics, and users."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Vocabularies" value={total} href="/admin/vocabularies" tint={1} />
        <StatTile
          label="Pending approval"
          value={pending}
          href="/admin/vocabularies?isApproved=false"
          tint={2}
        />
        <StatTile label="Topics" value={topicsCount} href="/admin/topics" tint={3} />
        <StatTile label="Users" value={null} href="/admin/users" tint={4} />
      </div>

      <Card className="mt-6">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold italic text-ink">
          <Sparkles className="size-4 text-accent" aria-hidden />
          Quick actions
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/vocabularies/new"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            <Plus className="size-4" aria-hidden />
            New vocabulary
          </Link>
          <Link
            href="/admin/vocabularies/import"
            className="inline-flex items-center gap-2 rounded-xl border border-line-2 bg-card px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-[color:var(--hover)]"
          >
            <Upload className="size-4" aria-hidden />
            Bulk import
          </Link>
          <Link
            href="/admin/topics"
            className="inline-flex items-center gap-2 rounded-xl border border-line-2 bg-card px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-[color:var(--hover)]"
          >
            <Tag className="size-4" aria-hidden />
            Manage topics
          </Link>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 rounded-xl border border-line-2 bg-card px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-[color:var(--hover)]"
          >
            <Users className="size-4" aria-hidden />
            Manage users
          </Link>
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold italic text-ink">
          <BookText className="size-4 text-accent" aria-hidden />
          Tips
        </h2>
        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <li>· Vocabularies must carry at least one sense (1–16). Translations and examples live inside each sense.</li>
          <li>· Bulk-import upserts by <span className="font-mono">(language, lemma, partOfSpeech)</span> — safe to re-run.</li>
          <li>· Deleting a user keeps their submitted vocabularies (they become orphaned, not removed).</li>
        </ul>
      </Card>
    </div>
  );
}
