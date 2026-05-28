"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { createVocabAction } from "@/lib/actions/admin-vocab";
import { CreateVocabSchema, type CreateVocabInput } from "@/lib/validators/admin-vocab";
import { Card } from "../../../_shell/card";
import type { Topic } from "@/lib/api/topics";

type Props = { topics: Topic[] };

const CEFR_OPTIONS = ["", "A1", "A2", "B1", "B2", "C1", "C2"] as const;

const inputCls =
  "h-9 w-full min-w-0 rounded-xl border border-line-2 bg-card px-3 text-sm text-ink placeholder:text-muted-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30";

const labelCls = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground";

export function VocabCreateForm({ topics }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const form = useForm<CreateVocabInput>({
    resolver: zodResolver(CreateVocabSchema),
    defaultValues: {
      language: "en",
      lemma: "",
      partOfSpeech: "",
      ipa: "",
      cefrLevel: null,
      frequencyRank: null,
      audioUrl: "",
      topics: [],
      senses: [
        {
          gloss: "",
          definition: "",
          imageUrl: "",
          translations: [{ language: "vi", translation: "" }],
          examples: [{ sentence: "" }],
        },
      ],
    },
  });

  const { register, handleSubmit, control, formState, setValue, watch } = form;
  const { errors } = formState;

  const sensesField = useFieldArray({ control, name: "senses" });

  function toggleTopic(slug: string) {
    setSelectedTopics((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      setValue("topics", next);
      return next;
    });
  }

  const onSubmit = handleSubmit((raw) => {
    const data: CreateVocabInput = {
      ...raw,
      partOfSpeech: raw.partOfSpeech || null,
      ipa: raw.ipa || null,
      cefrLevel: raw.cefrLevel || null,
      frequencyRank: raw.frequencyRank || null,
      audioUrl: raw.audioUrl || null,
      topics: selectedTopics,
    };

    startTransition(async () => {
      const res = await createVocabAction(data);
      if (res.success) {
        toast.success(`Created "${data.lemma}"`);
        if (res.redirect) router.push(res.redirect);
      } else if (res.fieldErrors) {
        toast.error("Please fix the highlighted fields.");
      } else {
        toast.error(res.error ?? "Could not create vocabulary.");
      }
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Card>
        <h2 className="font-display text-xl font-semibold italic text-ink">Basics</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className={labelCls}>
            Language *
            <Input className={inputCls} {...register("language")} placeholder="en" />
            {errors.language && <p className="mt-1 text-xs text-danger">{errors.language.message}</p>}
          </label>
          <label className={labelCls}>
            Lemma *
            <Input className={inputCls} {...register("lemma")} placeholder="study" />
            {errors.lemma && <p className="mt-1 text-xs text-danger">{errors.lemma.message}</p>}
          </label>
          <label className={labelCls}>
            Part of speech
            <Input className={inputCls} {...register("partOfSpeech")} placeholder="verb" />
          </label>
          <label className={labelCls}>
            IPA
            <Input className={inputCls} {...register("ipa")} placeholder="ˈstʌd.i" />
          </label>
          <label className={labelCls}>
            CEFR
            <select className={inputCls} {...register("cefrLevel")}>
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
              {...register("frequencyRank", { setValueAs: (v) => (v === "" || v == null ? null : Number(v)) })}
              placeholder="e.g. 1024"
            />
          </label>
          <label className={`${labelCls} sm:col-span-2`}>
            Audio URL
            <Input className={inputCls} {...register("audioUrl")} placeholder="https://…/study.mp3" />
          </label>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-xl font-semibold italic text-ink">Topics</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Pick any tags this word belongs to. Topics must already exist —{" "}
          <a href="/admin/topics" className="text-accent hover:underline">add new ones here</a>.
        </p>
        {topics.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-line-2 p-4 text-sm text-muted-foreground">
            No topics in the catalog yet.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {topics.map((t) => {
              const on = selectedTopics.includes(t.slug);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTopic(t.slug)}
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

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold italic text-ink">Senses</h2>
          <button
            type="button"
            disabled={sensesField.fields.length >= 16}
            onClick={() =>
              sensesField.append({
                gloss: "",
                definition: "",
                imageUrl: "",
                translations: [],
                examples: [],
              })
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-line-2 bg-card px-3 text-sm font-semibold text-ink transition-colors hover:bg-[color:var(--hover)] disabled:opacity-60"
          >
            <Plus className="size-4" aria-hidden /> Add sense
          </button>
        </div>

        {errors.senses?.message && (
          <p className="mt-2 text-xs text-danger">{String(errors.senses.message)}</p>
        )}

        <div className="mt-4 space-y-4">
          {sensesField.fields.map((field, idx) => (
            <SenseEditor
              key={field.id}
              index={idx}
              control={control}
              register={register}
              watch={watch}
              canDelete={sensesField.fields.length > 1}
              onRemove={() => sensesField.remove(idx)}
            />
          ))}
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push("/admin/vocabularies")}
          className="inline-flex h-10 items-center rounded-xl border border-line-2 bg-card px-4 text-sm font-semibold text-ink transition-colors hover:bg-[color:var(--hover)]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center rounded-xl bg-accent px-4 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create vocabulary"}
        </button>
      </div>
    </form>
  );
}

type SenseEditorProps = {
  index: number;
  control: ReturnType<typeof useForm<CreateVocabInput>>["control"];
  register: ReturnType<typeof useForm<CreateVocabInput>>["register"];
  watch: ReturnType<typeof useForm<CreateVocabInput>>["watch"];
  canDelete: boolean;
  onRemove: () => void;
};

function SenseEditor({ index, control, register, canDelete, onRemove }: SenseEditorProps) {
  const translationsField = useFieldArray({
    control,
    name: `senses.${index}.translations` as const,
  });
  const examplesField = useFieldArray({
    control,
    name: `senses.${index}.examples` as const,
  });

  return (
    <div className="rounded-2xl border border-line bg-bg-soft p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-ink">Sense {index + 1}</h3>
        {canDelete && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
            aria-label={`Remove sense ${index + 1}`}
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelCls}>
          Gloss
          <Input className={inputCls} {...register(`senses.${index}.gloss`)} placeholder="short label" />
        </label>
        <label className={labelCls}>
          Image URL
          <Input className={inputCls} {...register(`senses.${index}.imageUrl`)} placeholder="https://…" />
        </label>
        <label className={`${labelCls} sm:col-span-2`}>
          Definition
          <textarea
            {...register(`senses.${index}.definition`)}
            rows={2}
            className={`${inputCls} h-auto py-2`}
            placeholder="full definition"
          />
        </label>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className={labelCls}>Translations</span>
          <button
            type="button"
            onClick={() => translationsField.append({ language: "", translation: "" })}
            className="inline-flex h-7 items-center gap-1 rounded-lg border border-line-2 bg-card px-2 text-xs font-semibold text-ink-2 transition-colors hover:bg-[color:var(--hover)]"
          >
            <Plus className="size-3" aria-hidden /> Add
          </button>
        </div>
        {translationsField.fields.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line-2 bg-card px-3 py-2 text-xs text-muted-foreground">
            None yet.
          </p>
        ) : (
          <div className="space-y-2">
            {translationsField.fields.map((t, ti) => (
              <div key={t.id} className="flex items-center gap-2">
                <Input
                  className={`${inputCls} max-w-24`}
                  placeholder="vi"
                  {...register(`senses.${index}.translations.${ti}.language` as const)}
                />
                <Input
                  className={inputCls}
                  placeholder="translation"
                  {...register(`senses.${index}.translations.${ti}.translation` as const)}
                />
                <button
                  type="button"
                  onClick={() => translationsField.remove(ti)}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
                  aria-label="Remove translation"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className={labelCls}>Examples</span>
          <button
            type="button"
            onClick={() => examplesField.append({ sentence: "" })}
            className="inline-flex h-7 items-center gap-1 rounded-lg border border-line-2 bg-card px-2 text-xs font-semibold text-ink-2 transition-colors hover:bg-[color:var(--hover)]"
          >
            <Plus className="size-3" aria-hidden /> Add
          </button>
        </div>
        {examplesField.fields.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line-2 bg-card px-3 py-2 text-xs text-muted-foreground">
            None yet.
          </p>
        ) : (
          <div className="space-y-2">
            {examplesField.fields.map((ex, ei) => (
              <div key={ex.id} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input
                  className={inputCls}
                  placeholder="sentence"
                  {...register(`senses.${index}.examples.${ei}.sentence` as const)}
                />
                <Input
                  className={inputCls}
                  placeholder="translation (optional)"
                  {...register(`senses.${index}.examples.${ei}.translation` as const)}
                />
                <button
                  type="button"
                  onClick={() => examplesField.remove(ei)}
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
                  aria-label="Remove example"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
