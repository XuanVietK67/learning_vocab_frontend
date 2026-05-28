"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { replaceTopicsAction } from "@/lib/actions/admin-vocab";
import type { Topic } from "@/lib/api/topics";
import { Card } from "../../../../_shell/card";

type Props = {
  vocabId: string;
  catalog: Topic[];
  initialSlugs: string[];
};

export function TopicsEditor({ vocabId, catalog, initialSlugs }: Props) {
  const [selected, setSelected] = useState<string[]>(initialSlugs);
  const [pending, startTransition] = useTransition();

  function toggle(slug: string) {
    setSelected((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : [...p, slug]));
  }

  function save() {
    startTransition(async () => {
      const res = await replaceTopicsAction(vocabId, selected);
      if (res.success) toast.success("Topics saved");
      else toast.error(res.error ?? "Could not save topics.");
    });
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold italic text-ink">Topics</h2>
          <p className="mt-1 text-xs text-warn">
            Set-replace: saving sends ONLY the selected slugs. Any topics linked previously will be unlinked unless re-selected here.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="inline-flex h-9 items-center gap-2 rounded-xl bg-accent px-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60"
        >
          <Save className="size-4" aria-hidden /> {pending ? "Saving…" : "Save topics"}
        </button>
      </div>

      {catalog.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-line-2 p-4 text-sm text-muted-foreground">
          No topics in the catalog yet.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {catalog.map((t) => {
            const on = selected.includes(t.slug);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggle(t.slug)}
                className={
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors " +
                  (on
                    ? "bg-accent text-accent-foreground"
                    : "border border-line-2 bg-card text-ink-2 hover:bg-[color:var(--hover)]")
                }
              >
                {t.name}
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
