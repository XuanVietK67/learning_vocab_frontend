import type { Metadata } from "next";
import { PageHeader } from "../../../_shell/page-header";
import { BulkImportForm } from "./bulk-import-form";

export const metadata = { title: "Bulk import — Lexa admin" } satisfies Metadata;

export default function BulkImportPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        title="Bulk import"
        description="Upsert up to 500 vocabularies in one transaction. Matches by (language, lemma, partOfSpeech)."
        crumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Vocabularies", href: "/admin/vocabularies" },
          { label: "Import" },
        ]}
      />
      <BulkImportForm />
    </div>
  );
}
