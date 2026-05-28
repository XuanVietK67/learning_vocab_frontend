import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pencil, Plus, Upload } from "lucide-react";
import {
  adminVocabApi,
  type AdminVocabListQuery,
  type AdminVocabulary,
  type CefrLevel,
} from "@/lib/api/admin-vocab";
import { ApiError } from "@/lib/api/types";
import { Card } from "../../_shell/card";
import { PageHeader } from "../../_shell/page-header";
import { Pill } from "../../_shell/pill";
import { FilterBar, type FilterValues } from "./_components/filter-bar";
import { DeleteVocabButton } from "./_components/delete-vocab-button";

export const metadata: Metadata = { title: "Vocabularies — Lexa admin" };

type SearchParams = Record<string, string | string[] | undefined>;
type PageProps = { searchParams: Promise<SearchParams> };

function single(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function parseQuery(sp: SearchParams): { query: AdminVocabListQuery; values: FilterValues; hasFilters: boolean } {
  const q = single(sp.q);
  const language = single(sp.language);
  const cefrLevel = single(sp.cefrLevel) as CefrLevel | undefined;
  const topic = single(sp.topic);
  const source = single(sp.source) as "system" | "user" | undefined;
  const visibility = single(sp.visibility) as "system" | "private" | "public" | undefined;
  const isApprovedRaw = single(sp.isApproved);
  const isApproved = isApprovedRaw === "true" ? true : isApprovedRaw === "false" ? false : undefined;
  const sortByRaw = single(sp.sortBy) as "createdAt" | "frequencyRank" | undefined;
  const sortDirRaw = single(sp.sortDir) as "asc" | "desc" | undefined;
  const pageRaw = Number(single(sp.page) ?? "1");
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;

  const query: AdminVocabListQuery = {
    q: q || undefined,
    language: language || undefined,
    cefrLevel: cefrLevel || undefined,
    topic: topic || undefined,
    source: source || undefined,
    visibility: visibility || undefined,
    isApproved,
    sortBy: sortByRaw ?? "createdAt",
    sortDir: sortDirRaw ?? "desc",
    page,
    limit: 20,
  };

  const values: FilterValues = {
    q,
    language,
    cefrLevel,
    topic,
    source,
    visibility,
    isApproved: isApprovedRaw,
    sortBy: sortByRaw ?? "createdAt",
    sortDir: sortDirRaw ?? "desc",
  };

  const hasFilters = Boolean(
    q || language || cefrLevel || topic || source || visibility || isApprovedRaw,
  );

  return { query, values, hasFilters };
}

function buildPageHref(sp: SearchParams, page: number): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "page" || v === undefined) continue;
    if (Array.isArray(v)) v.forEach((vv) => params.append(k, vv));
    else params.set(k, v);
  }
  params.set("page", String(page));
  return `/admin/vocabularies?${params.toString()}`;
}

function sourceTone(source: AdminVocabulary["source"]): "rainbow-3" | "rainbow-5" {
  return source === "system" ? "rainbow-3" : "rainbow-5";
}

export default async function AdminVocabulariesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const { query, values, hasFilters } = parseQuery(sp);

  let data: AdminVocabulary[] = [];
  let total = 0;
  let limit = query.limit ?? 20;
  let page = query.page ?? 1;
  let fetchError: string | null = null;

  try {
    const result = await adminVocabApi.list(query);
    data = result.data;
    total = result.total;
    limit = result.limit;
    page = result.page;
  } catch (e) {
    fetchError = e instanceof ApiError ? `${e.status} ${e.message}` : "Could not load vocabularies.";
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Vocabularies"
        description="Curate the system catalog. User-submitted words appear here too."
        actions={
          <>
            <Link
              href="/admin/vocabularies/import"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-line-2 bg-card px-4 text-sm font-semibold text-ink transition-colors hover:bg-[color:var(--hover)]"
            >
              <Upload className="size-4" aria-hidden />
              Import
            </Link>
            <Link
              href="/admin/vocabularies/new"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
            >
              <Plus className="size-4" aria-hidden />
              New vocabulary
            </Link>
          </>
        }
      />

      <FilterBar values={values} hasFilters={hasFilters} />

      <Card className="overflow-hidden p-0">
        {fetchError ? (
          <div className="p-10 text-center text-sm text-danger">{fetchError}</div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-display text-xl italic text-ink">No vocabularies match.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try clearing filters or import a batch to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-bg-soft text-left text-[0.7rem] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Lemma</th>
                  <th className="px-3 py-3 font-semibold">Lang</th>
                  <th className="px-3 py-3 font-semibold">POS</th>
                  <th className="px-3 py-3 font-semibold">CEFR</th>
                  <th className="px-3 py-3 font-semibold">Source</th>
                  <th className="px-3 py-3 font-semibold">Approved</th>
                  <th className="px-3 py-3 font-semibold">Senses</th>
                  <th className="px-3 py-3 font-semibold">Updated</th>
                  <th className="px-3 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((v) => (
                  <tr
                    key={v.id}
                    className="border-t border-line transition-colors hover:bg-[color:var(--hover)]"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/admin/vocabularies/${v.id}`} className="block">
                        <div className="font-display text-base font-semibold text-ink">{v.lemma}</div>
                        {v.ipa && (
                          <div className="font-mono text-xs text-muted-foreground">/{v.ipa}/</div>
                        )}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-ink-2 uppercase">{v.language}</td>
                    <td className="px-3 py-3 text-ink-2">{v.partOfSpeech ?? "—"}</td>
                    <td className="px-3 py-3">
                      {v.cefrLevel ? <Pill tone="accent">{v.cefrLevel}</Pill> : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <Pill tone={sourceTone(v.source)}>{v.source}</Pill>
                    </td>
                    <td className="px-3 py-3">
                      {v.isApproved ? (
                        <Pill tone="success">Yes</Pill>
                      ) : (
                        <Pill tone="warn">No</Pill>
                      )}
                    </td>
                    <td className="px-3 py-3 text-ink-2">{v.senses?.length ?? 0}</td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {new Date(v.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/admin/vocabularies/${v.id}`}
                          className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent-soft hover:text-accent"
                          aria-label={`Edit ${v.lemma}`}
                        >
                          <Pencil className="size-4" aria-hidden />
                        </Link>
                        <DeleteVocabButton id={v.id} lemma={v.lemma} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {data.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages} · {total.toLocaleString()} total
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={page > 1 ? buildPageHref(sp, page - 1) : "#"}
              aria-disabled={page <= 1}
              className={
                "inline-flex h-9 items-center gap-1 rounded-xl border border-line-2 bg-card px-3 font-semibold transition-colors " +
                (page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-[color:var(--hover)]")
              }
            >
              <ChevronLeft className="size-4" aria-hidden /> Prev
            </Link>
            <Link
              href={page < totalPages ? buildPageHref(sp, page + 1) : "#"}
              aria-disabled={page >= totalPages}
              className={
                "inline-flex h-9 items-center gap-1 rounded-xl border border-line-2 bg-card px-3 font-semibold transition-colors " +
                (page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-[color:var(--hover)]")
              }
            >
              Next <ChevronRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
