"use client";

import { useState, useTransition } from "react";
import { Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { deleteUserAction } from "@/lib/actions/admin-users";

const inputCls =
  "h-10 w-full min-w-0 rounded-xl border border-line-2 bg-card px-3 text-sm text-ink placeholder:text-muted-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30";

export function DeleteUserForm() {
  const [id, setId] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      const res = await deleteUserAction(id.trim());
      if (res.success) {
        toast.success("User deleted");
        setId("");
        setConfirmOpen(false);
        setError(null);
      } else {
        setConfirmOpen(false);
        if (res.fieldErrors?.id) setError(res.fieldErrors.id);
        else {
          setError(null);
          toast.error(res.error ?? "Could not delete user.");
        }
      }
    });
  }

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          if (!id.trim()) {
            setError("Paste a user ID first.");
            return;
          }
          setConfirmOpen(true);
        }}
        className="space-y-2"
      >
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          User ID
          <Input
            className={`${inputCls} font-mono`}
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="9f1a0e9b-2c4b-4f6d-9a0e-1a3d5c7e9b11"
          />
        </label>
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="pt-1">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-danger-soft px-4 text-sm font-semibold text-danger transition-colors hover:bg-[color:color-mix(in_oklab,var(--danger)_18%,transparent)] disabled:opacity-60"
          >
            <Trash2 className="size-4" aria-hidden />
            Delete user
          </button>
        </div>
      </form>

      {confirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => !pending && setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-[0_24px_60px_-30px_rgba(255,107,107,0.6)] animate-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-xl font-semibold italic text-ink">Delete this user?</h2>
              <button
                type="button"
                disabled={pending}
                onClick={() => setConfirmOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-[color:var(--hover)]"
                aria-label="Close"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Hard-delete cascades through refresh tokens, OAuth identities, verification codes,
              learner progress, and personally-owned decks. User-created vocabularies are kept (their
              <span className="font-mono"> created_by_user_id </span>becomes <span className="font-mono">NULL</span>).
              Admin accounts can&apos;t be deleted from here.
            </p>
            <p className="mt-2 font-mono text-xs text-ink-2">{id.trim()}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => setConfirmOpen(false)}
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
                {pending ? "Deleting…" : "Confirm delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
