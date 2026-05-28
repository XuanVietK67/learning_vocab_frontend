"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { patchVocabAction } from "@/lib/actions/admin-vocab";
import { PatchVocabSchema, type PatchVocabInput } from "@/lib/validators/admin-vocab";
import type { AdminVocabulary } from "@/lib/api/admin-vocab";
import { Card } from "../../../../_shell/card";

type Props = { vocab: AdminVocabulary };

const inputCls =
  "h-9 w-full min-w-0 rounded-xl border border-line-2 bg-card px-3 text-sm text-ink placeholder:text-muted-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30";
const labelCls = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground";

const CEFR_OPTIONS = ["", "A1", "A2", "B1", "B2", "C1", "C2"] as const;

export function OverviewForm({ vocab }: Props) {
  const [pending, startTransition] = useTransition();

  const form = useForm<PatchVocabInput>({
    resolver: zodResolver(PatchVocabSchema),
    defaultValues: {
      language: vocab.language,
      lemma: vocab.lemma,
      partOfSpeech: vocab.partOfSpeech ?? "",
      ipa: vocab.ipa ?? "",
      cefrLevel: vocab.cefrLevel ?? null,
      frequencyRank: vocab.frequencyRank ?? null,
      audioUrl: vocab.audioUrl ?? "",
    },
  });

  const onSubmit = form.handleSubmit((raw) => {
    const data: PatchVocabInput = {
      ...raw,
      partOfSpeech: raw.partOfSpeech || null,
      ipa: raw.ipa || null,
      cefrLevel: raw.cefrLevel || null,
      frequencyRank: raw.frequencyRank || null,
      audioUrl: raw.audioUrl || null,
    };
    startTransition(async () => {
      const res = await patchVocabAction(vocab.id, data);
      if (res.success) toast.success("Saved");
      else toast.error(res.error ?? "Could not save.");
    });
  });

  return (
    <Card>
      <h2 className="font-display text-xl font-semibold italic text-ink">Overview</h2>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className={labelCls}>
          Language
          <Input className={inputCls} {...form.register("language")} />
        </label>
        <label className={labelCls}>
          Lemma
          <Input className={inputCls} {...form.register("lemma")} />
        </label>
        <label className={labelCls}>
          Part of speech
          <Input className={inputCls} {...form.register("partOfSpeech")} />
        </label>
        <label className={labelCls}>
          IPA
          <Input className={inputCls} {...form.register("ipa")} />
        </label>
        <label className={labelCls}>
          CEFR
          <select className={inputCls} {...form.register("cefrLevel")}>
            {CEFR_OPTIONS.map((l) => (
              <option key={l || "none"} value={l}>{l || "—"}</option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          Frequency rank
          <Input
            className={inputCls}
            type="number"
            min={1}
            {...form.register("frequencyRank", {
              setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
            })}
          />
        </label>
        <label className={`${labelCls} sm:col-span-2`}>
          Audio URL
          <Input className={inputCls} {...form.register("audioUrl")} />
        </label>
        <div className="sm:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-10 items-center rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </Card>
  );
}
