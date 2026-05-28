"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  createTopicAction,
  deleteTopicAction,
  patchTopicAction,
} from "@/lib/actions/admin-topics";
import type { Topic } from "@/lib/api/topics";
import { Card } from "../../../_shell/card";

type Props = { topics: Topic[] };

const inputCls =
  "h-9 w-full min-w-0 rounded-xl border border-line-2 bg-card px-3 text-sm text-ink placeholder:text-muted-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30";
const labelCls = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground";

export function TopicsManager({ topics }: Props) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Topic | null>(null);
  const [deleting, setDeleting] = useState<Topic | null>(null);

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
        >
          <Plus className="size-4" aria-hidden />
          New topic
        </button>
      </div>

      <Card className="overflow-hidden p-0">
        {topics.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-display text-xl italic text-ink">No topics yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a topic to start tagging vocabularies.
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead className="bg-bg-soft text-left text-[0.7rem] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-3 py-3 font-semibold">Name</th>
                <th className="px-3 py-3 font-semibold">Description</th>
                <th className="px-3 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((t) => (
                <tr key={t.id} className="border-t border-line">
                  <td className="px-4 py-3 font-mono text-xs text-ink-2">{t.slug}</td>
                  <td className="px-3 py-3 font-semibold text-ink">{t.name}</td>
                  <td className="px-3 py-3 max-w-md text-muted-foreground">
                    {t.description ?? "—"}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(t)}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent-soft hover:text-accent"
                        aria-label={`Edit ${t.name}`}
                      >
                        <Pencil className="size-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(t)}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
                        aria-label={`Delete ${t.name}`}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {creating && <CreateDialog onClose={() => setCreating(false)} />}
      {editing && <EditDialog topic={editing} onClose={() => setEditing(null)} />}
      {deleting && <DeleteDialog topic={deleting} onClose={() => setDeleting(null)} />}
    </>
  );
}

function DialogShell({
  title,
  children,
  onClose,
  pending,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  pending: boolean;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={() => !pending && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-[0_24px_60px_-30px_rgba(255,107,107,0.6)] animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-display text-xl font-semibold italic text-ink">{title}</h2>
          <button
            type="button"
            disabled={pending}
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-[color:var(--hover)]"
            aria-label="Close"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CreateDialog({ onClose }: { onClose: () => void }) {
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const res = await createTopicAction({
        slug: slug.trim(),
        name: name.trim(),
        description: description.trim() || null,
        iconUrl: iconUrl.trim() || null,
      });
      if (res.success) {
        toast.success(`Created topic "${name}"`);
        onClose();
      } else if (res.fieldErrors) {
        const first = Object.values(res.fieldErrors)[0];
        toast.error(first ?? "Validation failed.");
      } else {
        toast.error(res.error ?? "Could not create topic.");
      }
    });
  }

  return (
    <DialogShell title="New topic" onClose={onClose} pending={pending}>
      <div className="mt-4 space-y-3">
        <label className={labelCls}>
          Slug *
          <Input
            className={inputCls}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="food"
          />
        </label>
        <label className={labelCls}>
          Name *
          <Input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Food & Drink"
          />
        </label>
        <label className={labelCls}>
          Description
          <Input
            className={inputCls}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional"
          />
        </label>
        <label className={labelCls}>
          Icon URL
          <Input
            className={inputCls}
            value={iconUrl}
            onChange={(e) => setIconUrl(e.target.value)}
            placeholder="https://…"
          />
        </label>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={onClose}
          className="inline-flex h-9 items-center rounded-xl border border-line-2 bg-card px-3 text-sm font-semibold text-ink transition-colors hover:bg-[color:var(--hover)] disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={pending || !slug.trim() || !name.trim()}
          onClick={submit}
          className="inline-flex h-9 items-center rounded-xl bg-accent px-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create topic"}
        </button>
      </div>
    </DialogShell>
  );
}

function EditDialog({ topic, onClose }: { topic: Topic; onClose: () => void }) {
  const [name, setName] = useState(topic.name);
  const [description, setDescription] = useState(topic.description ?? "");
  const [iconUrl, setIconUrl] = useState(topic.iconUrl ?? "");
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const res = await patchTopicAction(topic.slug, {
        name: name.trim() || undefined,
        description: description.trim() || null,
        iconUrl: iconUrl.trim() || null,
      });
      if (res.success) {
        toast.success("Topic saved");
        onClose();
      } else {
        toast.error(res.error ?? "Could not save topic.");
      }
    });
  }

  return (
    <DialogShell title={`Edit ${topic.slug}`} onClose={onClose} pending={pending}>
      <p className="mt-1 text-xs text-muted-foreground">
        Slug is the identifier and can&apos;t be changed. Delete and re-create to rename.
      </p>
      <div className="mt-4 space-y-3">
        <label className={labelCls}>
          Slug
          <Input className={`${inputCls} cursor-not-allowed opacity-60`} value={topic.slug} disabled />
        </label>
        <label className={labelCls}>
          Name
          <Input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className={labelCls}>
          Description
          <Input
            className={inputCls}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label className={labelCls}>
          Icon URL
          <Input
            className={inputCls}
            value={iconUrl}
            onChange={(e) => setIconUrl(e.target.value)}
          />
        </label>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={onClose}
          className="inline-flex h-9 items-center rounded-xl border border-line-2 bg-card px-3 text-sm font-semibold text-ink transition-colors hover:bg-[color:var(--hover)] disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={submit}
          className="inline-flex h-9 items-center rounded-xl bg-accent px-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </DialogShell>
  );
}

function DeleteDialog({ topic, onClose }: { topic: Topic; onClose: () => void }) {
  const [pending, startTransition] = useTransition();

  function submit() {
    startTransition(async () => {
      const res = await deleteTopicAction(topic.slug);
      if (res.success) {
        toast.success(`Deleted "${topic.name}"`);
        onClose();
      } else {
        toast.error(res.error ?? "Could not delete topic.");
      }
    });
  }

  return (
    <DialogShell title={`Delete "${topic.name}"?`} onClose={onClose} pending={pending}>
      <p className="mt-2 text-sm text-muted-foreground">
        Removes the tag from all vocabularies that carry it. The vocabularies themselves stay.
      </p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={onClose}
          className="inline-flex h-9 items-center rounded-xl border border-line-2 bg-card px-3 text-sm font-semibold text-ink transition-colors hover:bg-[color:var(--hover)] disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={submit}
          className="inline-flex h-9 items-center rounded-xl bg-danger-soft px-3 text-sm font-semibold text-danger transition-colors hover:bg-[color:color-mix(in_oklab,var(--danger)_18%,transparent)] disabled:opacity-60"
        >
          {pending ? "Deleting…" : "Delete topic"}
        </button>
      </div>
    </DialogShell>
  );
}
