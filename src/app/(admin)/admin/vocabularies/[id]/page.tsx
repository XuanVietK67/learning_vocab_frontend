import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Volume2 } from "lucide-react";
import { adminVocabApi, type AdminVocabulary } from "@/lib/api/admin-vocab";
import { topicsApi } from "@/lib/api/topics";
import { ApiError } from "@/lib/api/types";
import { Card } from "../../../_shell/card";
import { PageHeader } from "../../../_shell/page-header";
import { Pill } from "../../../_shell/pill";
import { OverviewForm } from "./_components/overview-form";
import { SensesEditor } from "./_components/senses-editor";
import { TopicsEditor } from "./_components/topics-editor";
import { DeleteVocabHeaderButton } from "./_components/delete-vocab-header";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const v = await adminVocabApi.get(id);
    return { title: `${v.lemma} — Lexa admin` };
  } catch {
    return { title: "Vocabulary — Lexa admin" };
  }
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "senses", label: "Senses" },
  { id: "topics", label: "Topics" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function sourceTone(source: AdminVocabulary["source"]): "rainbow-3" | "rainbow-5" {
  return source === "system" ? "rainbow-3" : "rainbow-5";
}

export default async function VocabularyDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { tab: tabRaw } = await searchParams;
  const tab: TabId = TABS.some((t) => t.id === tabRaw) ? (tabRaw as TabId) : "overview";

  let vocab: AdminVocabulary;
  try {
    vocab = await adminVocabApi.get(id);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 403)) notFound();
    throw e;
  }

  let topics: Awaited<ReturnType<typeof topicsApi.list>> = [];
  if (tab === "topics") {
    try {
      topics = await topicsApi.list();
    } catch (e) {
      if (!(e instanceof ApiError)) throw e;
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        title={vocab.lemma}
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Vocabularies", href: "/admin/vocabularies" },
          { label: vocab.lemma },
        ]}
        actions={<DeleteVocabHeaderButton id={vocab.id} lemma={vocab.lemma} />}
      />

      <Card className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl font-semibold italic text-ink">{vocab.lemma}</span>
              {vocab.ipa && (
                <span className="font-mono text-sm text-muted-foreground">/{vocab.ipa}/</span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Pill tone="neutral">{vocab.language.toUpperCase()}</Pill>
              {vocab.partOfSpeech && <Pill tone="neutral">{vocab.partOfSpeech}</Pill>}
              {vocab.cefrLevel && <Pill tone="accent">{vocab.cefrLevel}</Pill>}
              <Pill tone={sourceTone(vocab.source)}>{vocab.source}</Pill>
              <Pill tone="neutral">{vocab.visibility}</Pill>
              {vocab.isApproved ? <Pill tone="success">Approved</Pill> : <Pill tone="warn">Pending</Pill>}
              {vocab.frequencyRank && (
                <Pill tone="rainbow-4">rank #{vocab.frequencyRank}</Pill>
              )}
            </div>
          </div>
          {vocab.audioUrl && (
            <a
              href={vocab.audioUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex h-9 items-center gap-2 rounded-xl border border-line-2 bg-card px-3 text-sm font-semibold text-ink transition-colors hover:bg-[color:var(--hover)]"
            >
              <Volume2 className="size-4" aria-hidden />
              Audio
            </a>
          )}
        </div>
      </Card>

      <nav className="mb-4 inline-flex items-center gap-1 rounded-2xl border border-line bg-card p-1">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <Link
              key={t.id}
              href={`/admin/vocabularies/${vocab.id}?tab=${t.id}`}
              className={
                "inline-flex h-9 items-center rounded-xl px-4 text-sm font-semibold transition-colors " +
                (active
                  ? "bg-accent text-accent-foreground"
                  : "text-ink-2 hover:bg-[color:var(--hover)]")
              }
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      {tab === "overview" && <OverviewForm vocab={vocab} />}
      {tab === "senses" && <SensesEditor vocab={vocab} />}
      {tab === "topics" && <TopicsEditor vocabId={vocab.id} catalog={topics} initialSlugs={[]} />}
    </div>
  );
}
