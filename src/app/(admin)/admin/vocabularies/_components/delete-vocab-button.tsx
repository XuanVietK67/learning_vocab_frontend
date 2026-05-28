"use client";

import { useState, useTransition } from "react";
import { Trash2, X } from "lucide-react";
import { deleteVocabAction } from "@/lib/actions/admin-vocab";
import { toast } from "sonner";

type Props = { id: string; lemma: string };

export function DeleteVocabButton({ id, lemma }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const res = await deleteVocabAction(id);
      if (res.success) {
        toast.success(`Deleted "${lemma}"`);
        setOpen(false);
      } else {
        toast.error(res.error ?? "Could not delete vocabulary.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
        aria-label={`Delete ${lemma}`}
      >
        <Trash2 className="size-4" aria-hidden />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-[0_24px_60px_-30px_rgba(255,107,107,0.6)] animate-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-xl font-semibold italic text-ink">
                Delete &ldquo;{lemma}&rdquo;?
              </h2>
              <button
                type="button"
                onClick={() => !pending && setOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-[color:var(--hover)]"
                aria-label="Close"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              This permanently removes the vocabulary, all its senses, translations, examples, and topic links. It also removes any
              learner progress rows tied to it. This can&apos;t be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => setOpen(false)}
                className="inline-flex h-9 items-center rounded-xl border border-line-2 bg-card px-3 text-sm font-semibold text-ink transition-colors hover:bg-[color:var(--hover)] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={onConfirm}
                className="inline-flex h-9 items-center rounded-xl bg-danger-soft px-3 text-sm font-semibold text-danger transition-colors hover:bg-[color:color-mix(in_oklab,var(--danger)_18%,transparent)] disabled:opacity-60"
              >
                {pending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
