"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, FileUp, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { bulkImportVocabAction } from "@/lib/actions/admin-vocab";
import { BulkImportSchema, type BulkImportInput } from "@/lib/validators/admin-vocab";
import { Card } from "../../../_shell/card";

type ImportResult = {
  upserted: number;
  inserted: number;
  updated: number;
  sensesAdded: number;
  translationsAdded: number;
  examplesAdded: number;
  topicLinksAdded: number;
};

const SAMPLE = JSON.stringify(
  {
    items: [
      {
        language: "en",
        lemma: "apple",
        partOfSpeech: "noun",
        cefrLevel: "A1",
        senses: [
          {
            gloss: "fruit",
            translations: [{ language: "vi", translation: "quả táo" }],
            examples: [{ sentence: "I ate an apple." }],
          },
        ],
      },
    ],
  },
  null,
  2,
);

export function BulkImportForm() {
  const [raw, setRaw] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [validated, setValidated] = useState<BulkImportInput | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [pending, startTransition] = useTransition();

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setRaw(text);
      validate(text);
    };
    reader.readAsText(file);
  }

  function validate(text: string) {
    setResult(null);
    setValidated(null);
    if (!text.trim()) {
      setParseError(null);
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      setParseError(`JSON parse error: ${(e as Error).message}`);
      return;
    }
    // Accept either { items: [...] } or a bare [...] of items.
    const candidate = Array.isArray(parsed) ? { items: parsed } : parsed;
    const r = BulkImportSchema.safeParse(candidate);
    if (!r.success) {
      const issues = r.error.issues
        .slice(0, 8)
        .map((i) => `· ${i.path.join(".") || "<root>"}: ${i.message}`)
        .join("\n");
      const more = r.error.issues.length > 8 ? `\n…and ${r.error.issues.length - 8} more issue(s)` : "";
      setParseError(`Validation failed:\n${issues}${more}`);
      return;
    }
    setParseError(null);
    setValidated(r.data);
  }

  function onSubmit() {
    if (!validated) return;
    startTransition(async () => {
      const res = await bulkImportVocabAction(validated);
      if (res.success) {
        if (res.result) {
          setResult(res.result);
          toast.success(`Imported ${res.result.upserted} vocabularies`);
        }
      } else {
        toast.error(res.error ?? "Bulk import failed.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold italic text-ink">Source</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Paste JSON below or upload a <code className="font-mono text-xs">.json</code> file. Either{" "}
              <code className="font-mono text-xs">{"{ items: [...] }"}</code> or a bare array works.
            </p>
          </div>
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 self-start rounded-xl border border-line-2 bg-card px-4 text-sm font-semibold text-ink transition-colors hover:bg-[color:var(--hover)]">
            <FileUp className="size-4" aria-hidden />
            Choose file
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
        </div>

        <textarea
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            validate(e.target.value);
          }}
          rows={14}
          spellCheck={false}
          placeholder={SAMPLE}
          className="mt-4 w-full rounded-xl border border-line-2 bg-bg-soft px-3 py-2 font-mono text-xs text-ink placeholder:text-muted-2 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
        />

        {parseError && (
          <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger">
            {parseError}
          </pre>
        )}

        {validated && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-success">
            <CheckCircle2 className="size-4" aria-hidden />
            {validated.items.length} item{validated.items.length === 1 ? "" : "s"} ready to import.
          </p>
        )}
      </Card>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={!validated || pending}
          onClick={onSubmit}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Importing…" : `Import ${validated?.items.length ?? 0} item${validated?.items.length === 1 ? "" : "s"}`}
        </button>
      </div>

      {result && (
        <Card className="border-accent/30">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold italic text-ink">
            <Sparkles className="size-4 text-accent" aria-hidden />
            Import complete
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ResultTile label="Upserted" value={result.upserted} tint={1} />
            <ResultTile label="Inserted" value={result.inserted} tint={3} />
            <ResultTile label="Updated" value={result.updated} tint={4} />
            <ResultTile label="Senses added" value={result.sensesAdded} tint={2} />
            <ResultTile label="Translations" value={result.translationsAdded} tint={5} />
            <ResultTile label="Examples" value={result.examplesAdded} tint={3} />
            <ResultTile label="Topic links" value={result.topicLinksAdded} tint={4} />
          </div>
        </Card>
      )}
    </div>
  );
}

function ResultTile({ label, value, tint }: { label: string; value: number; tint: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-card p-3">
      <div
        className="pointer-events-none absolute -right-4 -top-4 size-16 rounded-full opacity-50 blur-2xl"
        style={{ background: `var(--rainbow-${tint})` }}
        aria-hidden
      />
      <p className="relative text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="relative mt-1 font-display text-2xl font-semibold italic text-ink">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
