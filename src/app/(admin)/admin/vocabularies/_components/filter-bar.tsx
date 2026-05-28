import Link from "next/link";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "../../../_shell/card";

export type FilterValues = {
  q?: string;
  language?: string;
  cefrLevel?: string;
  topic?: string;
  source?: string;
  visibility?: string;
  isApproved?: string;
  sortBy?: string;
  sortDir?: string;
};

const inputCls =
  "h-9 w-full min-w-0 rounded-xl border border-line-2 bg-card px-3 text-sm text-ink placeholder:text-muted-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30";

export function FilterBar({ values, hasFilters }: { values: FilterValues; hasFilters: boolean }) {
  return (
    <Card className="mb-4">
      <form method="get" action="/admin/vocabularies" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="relative sm:col-span-2 lg:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-2" aria-hidden />
          <Input
            type="text"
            name="q"
            defaultValue={values.q ?? ""}
            placeholder="Search lemma…"
            className="h-9 pl-9"
          />
        </label>

        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="sr-only">Language</span>
          <input
            type="text"
            name="language"
            defaultValue={values.language ?? ""}
            placeholder="Language (en)"
            className={inputCls}
          />
        </label>

        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="sr-only">CEFR</span>
          <select name="cefrLevel" defaultValue={values.cefrLevel ?? ""} className={inputCls}>
            <option value="">Any CEFR</option>
            {(["A1", "A2", "B1", "B2", "C1", "C2"] as const).map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </label>

        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="sr-only">Topic</span>
          <input
            type="text"
            name="topic"
            defaultValue={values.topic ?? ""}
            placeholder="Topic slug"
            className={inputCls}
          />
        </label>

        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="sr-only">Source</span>
          <select name="source" defaultValue={values.source ?? ""} className={inputCls}>
            <option value="">Any source</option>
            <option value="system">System</option>
            <option value="user">User</option>
          </select>
        </label>

        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="sr-only">Visibility</span>
          <select name="visibility" defaultValue={values.visibility ?? ""} className={inputCls}>
            <option value="">Any visibility</option>
            <option value="system">System</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </label>

        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="sr-only">Approved</span>
          <select name="isApproved" defaultValue={values.isApproved ?? ""} className={inputCls}>
            <option value="">Any approval</option>
            <option value="true">Approved</option>
            <option value="false">Not approved</option>
          </select>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <select name="sortBy" defaultValue={values.sortBy ?? "createdAt"} className={inputCls}>
            <option value="createdAt">Newest</option>
            <option value="frequencyRank">Frequency</option>
          </select>
          <select name="sortDir" defaultValue={values.sortDir ?? "desc"} className={inputCls}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>

        <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Apply filters
          </button>
          {hasFilters && (
            <Link
              href="/admin/vocabularies"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-line-2 bg-card px-3 text-sm text-ink-2 transition-colors hover:bg-[color:var(--hover)]"
            >
              <X className="size-3.5" aria-hidden />
              Clear
            </Link>
          )}
        </div>
      </form>
    </Card>
  );
}
