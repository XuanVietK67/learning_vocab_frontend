import type { Metadata } from "next";
import { topicsApi, type Topic } from "@/lib/api/topics";
import { ApiError } from "@/lib/api/types";
import { Card } from "../../_shell/card";
import { PageHeader } from "../../_shell/page-header";
import { TopicsManager } from "./_components/topics-manager";

export const metadata: Metadata = { title: "Topics — Lexa admin" };

export default async function AdminTopicsPage() {
  let topics: Topic[] = [];
  let fetchError: string | null = null;
  try {
    topics = await topicsApi.list();
  } catch (e) {
    fetchError = e instanceof ApiError ? `${e.status} ${e.message}` : "Could not load topics.";
  }

  // Sort alphabetically by name for a stable view.
  topics = [...topics].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        title="Topics"
        description="Curate the topic catalog. Slugs are stable identifiers — vocabularies reference them."
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Topics" }]}
      />

      {fetchError ? (
        <Card>
          <p className="text-sm text-danger">{fetchError}</p>
        </Card>
      ) : (
        <TopicsManager topics={topics} />
      )}
    </div>
  );
}
