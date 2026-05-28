import type { Metadata } from "next";
import { topicsApi } from "@/lib/api/topics";
import { ApiError } from "@/lib/api/types";
import { PageHeader } from "../../../_shell/page-header";
import { VocabCreateForm } from "../_components/vocab-create-form";

export const metadata = { title: "New vocabulary — Lexa admin" } satisfies Metadata;

export default async function NewVocabularyPage() {
  let topics: Awaited<ReturnType<typeof topicsApi.list>> = [];
  try {
    topics = await topicsApi.list();
  } catch (e) {
    if (!(e instanceof ApiError)) throw e;
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        title="New vocabulary"
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Vocabularies", href: "/admin/vocabularies" },
          { label: "New" },
        ]}
      />
      <VocabCreateForm topics={topics} />
    </div>
  );
}
