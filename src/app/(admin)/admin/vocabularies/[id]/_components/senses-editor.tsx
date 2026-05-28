"use client";

import { useState, useTransition } from "react";
import { Check, ChevronDown, ChevronUp, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  addExampleAction,
  addSenseAction,
  addTranslationAction,
  deleteExampleAction,
  deleteSenseAction,
  deleteTranslationAction,
  patchExampleAction,
  patchSenseAction,
  patchTranslationAction,
  reorderSensesAction,
} from "@/lib/actions/admin-vocab";
import type {
  AdminExample,
  AdminSense,
  AdminTranslation,
  AdminVocabulary,
} from "@/lib/api/admin-vocab";
import { Card } from "../../../../_shell/card";

type Props = { vocab: AdminVocabulary };

const inputCls =
  "h-9 w-full min-w-0 rounded-xl border border-line-2 bg-card px-3 text-sm text-ink placeholder:text-muted-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30";
const labelCls = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground";

export function SensesEditor({ vocab }: Props) {
  const senses = vocab.senses ?? [];
  const [pending, startTransition] = useTransition();

  function move(idx: number, dir: -1 | 1) {
    const next = senses.map((s) => s.id);
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    startTransition(async () => {
      const res = await reorderSensesAction(vocab.id, next);
      if (!res.success) toast.error(res.error ?? "Could not reorder.");
    });
  }

  function addSense() {
    startTransition(async () => {
      const res = await addSenseAction(vocab.id, { gloss: "New sense" });
      if (res.success) toast.success("Sense added");
      else toast.error(res.error ?? "Could not add sense.");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold italic text-ink">Senses</h2>
        <button
          type="button"
          onClick={addSense}
          disabled={pending || senses.length >= 16}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-accent px-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60"
        >
          <Plus className="size-4" aria-hidden /> Add sense
        </button>
      </div>

      {senses.length === 0 && (
        <Card>
          <p className="text-sm text-muted-foreground">This vocabulary has no senses yet.</p>
        </Card>
      )}

      {senses.map((sense, idx) => (
        <SenseCard
          key={sense.id}
          vocabId={vocab.id}
          sense={sense}
          canMoveUp={idx > 0}
          canMoveDown={idx < senses.length - 1}
          canDelete={senses.length > 1}
          onMove={(dir) => move(idx, dir)}
        />
      ))}
    </div>
  );
}

type SenseCardProps = {
  vocabId: string;
  sense: AdminSense;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canDelete: boolean;
  onMove: (dir: -1 | 1) => void;
};

function SenseCard({ vocabId, sense, canMoveUp, canMoveDown, canDelete, onMove }: SenseCardProps) {
  const [pending, startTransition] = useTransition();
  const [gloss, setGloss] = useState(sense.gloss ?? "");
  const [definition, setDefinition] = useState(sense.definition ?? "");
  const [imageUrl, setImageUrl] = useState(sense.imageUrl ?? "");

  function saveSense() {
    startTransition(async () => {
      const res = await patchSenseAction(vocabId, sense.id, {
        gloss: gloss || null,
        definition: definition || null,
        imageUrl: imageUrl || null,
      });
      if (res.success) toast.success("Sense saved");
      else toast.error(res.error ?? "Could not save sense.");
    });
  }

  function deleteSense() {
    if (!confirm(`Delete sense ${sense.senseOrder}? Its translations and examples will be removed too.`)) {
      return;
    }
    startTransition(async () => {
      const res = await deleteSenseAction(vocabId, sense.id);
      if (res.success) toast.success("Sense deleted");
      else toast.error(res.error ?? "Could not delete sense.");
    });
  }

  return (
    <Card className="bg-card">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-full bg-accent-soft font-display text-sm font-semibold italic text-accent">
            {sense.senseOrder}
          </span>
          <h3 className="font-semibold text-ink">Sense {sense.senseOrder}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!canMoveUp || pending}
            onClick={() => onMove(-1)}
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[color:var(--hover)] disabled:opacity-30"
            aria-label="Move up"
          >
            <ChevronUp className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            disabled={!canMoveDown || pending}
            onClick={() => onMove(1)}
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[color:var(--hover)] disabled:opacity-30"
            aria-label="Move down"
          >
            <ChevronDown className="size-4" aria-hidden />
          </button>
          {canDelete && (
            <button
              type="button"
              disabled={pending}
              onClick={deleteSense}
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-60"
              aria-label="Delete sense"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className={labelCls}>
          Gloss
          <Input className={inputCls} value={gloss} onChange={(e) => setGloss(e.target.value)} />
        </label>
        <label className={labelCls}>
          Image URL
          <Input className={inputCls} value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </label>
        <label className={`${labelCls} sm:col-span-2`}>
          Definition
          <textarea
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            rows={2}
            className={`${inputCls} h-auto py-2`}
          />
        </label>
        <div className="sm:col-span-2 flex justify-end">
          <button
            type="button"
            onClick={saveSense}
            disabled={pending}
            className="inline-flex h-9 items-center rounded-xl border border-line-2 bg-card px-3 text-sm font-semibold text-ink transition-colors hover:bg-[color:var(--hover)] disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save sense"}
          </button>
        </div>
      </div>

      <TranslationsList vocabId={vocabId} sense={sense} />
      <ExamplesList vocabId={vocabId} sense={sense} />
    </Card>
  );
}

function TranslationsList({ vocabId, sense }: { vocabId: string; sense: AdminSense }) {
  const [lang, setLang] = useState("");
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  function add() {
    if (!lang.trim() || !text.trim()) return;
    startTransition(async () => {
      const res = await addTranslationAction(vocabId, sense.id, {
        language: lang.trim(),
        translation: text.trim(),
      });
      if (res.success) {
        toast.success("Translation added");
        setLang("");
        setText("");
      } else {
        toast.error(res.error ?? "Could not add translation.");
      }
    });
  }

  function del(translationId: string) {
    startTransition(async () => {
      const res = await deleteTranslationAction(vocabId, sense.id, translationId);
      if (!res.success) toast.error(res.error ?? "Could not delete.");
    });
  }

  return (
    <div className="mt-4">
      <span className={labelCls}>Translations</span>
      <div className="mt-2 space-y-1.5">
        {(sense.translations ?? []).length === 0 ? (
          <p className="rounded-lg border border-dashed border-line-2 bg-bg-soft px-3 py-2 text-xs text-muted-foreground">
            None yet.
          </p>
        ) : (
          sense.translations.map((t) => (
            <TranslationRow
              key={t.id}
              vocabId={vocabId}
              senseId={sense.id}
              translation={t}
              onDelete={() => del(t.id)}
              listPending={pending}
            />
          ))
        )}
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-[100px_1fr_auto]">
        <Input className={inputCls} placeholder="vi" value={lang} onChange={(e) => setLang(e.target.value)} />
        <Input className={inputCls} placeholder="translation" value={text} onChange={(e) => setText(e.target.value)} />
        <button
          type="button"
          onClick={add}
          disabled={pending || !lang.trim() || !text.trim()}
          className="inline-flex h-9 items-center gap-1 rounded-xl border border-line-2 bg-card px-3 text-sm font-semibold text-ink transition-colors hover:bg-[color:var(--hover)] disabled:opacity-60"
        >
          <Plus className="size-3.5" aria-hidden /> Add
        </button>
      </div>
    </div>
  );
}

function ExamplesList({ vocabId, sense }: { vocabId: string; sense: AdminSense }) {
  const [sentence, setSentence] = useState("");
  const [translation, setTranslation] = useState("");
  const [pending, startTransition] = useTransition();

  function add() {
    if (!sentence.trim()) return;
    startTransition(async () => {
      const res = await addExampleAction(vocabId, sense.id, {
        sentence: sentence.trim(),
        translation: translation.trim() || null,
      });
      if (res.success) {
        toast.success("Example added");
        setSentence("");
        setTranslation("");
      } else {
        toast.error(res.error ?? "Could not add example.");
      }
    });
  }

  function del(exampleId: string) {
    startTransition(async () => {
      const res = await deleteExampleAction(vocabId, sense.id, exampleId);
      if (!res.success) toast.error(res.error ?? "Could not delete.");
    });
  }

  return (
    <div className="mt-4">
      <span className={labelCls}>Examples</span>
      <div className="mt-2 space-y-1.5">
        {(sense.examples ?? []).length === 0 ? (
          <p className="rounded-lg border border-dashed border-line-2 bg-bg-soft px-3 py-2 text-xs text-muted-foreground">
            None yet.
          </p>
        ) : (
          sense.examples.map((ex) => (
            <ExampleRow
              key={ex.id}
              vocabId={vocabId}
              senseId={sense.id}
              example={ex}
              onDelete={() => del(ex.id)}
              listPending={pending}
            />
          ))
        )}
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <Input
          className={inputCls}
          placeholder="sentence"
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
        />
        <Input
          className={inputCls}
          placeholder="translation (optional)"
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
        />
        <button
          type="button"
          onClick={add}
          disabled={pending || !sentence.trim()}
          className="inline-flex h-9 items-center gap-1 rounded-xl border border-line-2 bg-card px-3 text-sm font-semibold text-ink transition-colors hover:bg-[color:var(--hover)] disabled:opacity-60"
        >
          <Plus className="size-3.5" aria-hidden /> Add
        </button>
      </div>
    </div>
  );
}

type TranslationRowProps = {
  vocabId: string;
  senseId: string;
  translation: AdminTranslation;
  onDelete: () => void;
  listPending: boolean;
};

function TranslationRow({ vocabId, senseId, translation, onDelete, listPending }: TranslationRowProps) {
  const [editing, setEditing] = useState(false);
  const [lang, setLang] = useState(translation.language);
  const [text, setText] = useState(translation.translation);
  const [pending, startTransition] = useTransition();

  function cancel() {
    setLang(translation.language);
    setText(translation.translation);
    setEditing(false);
  }

  function save() {
    if (!lang.trim() || !text.trim()) return;
    startTransition(async () => {
      const res = await patchTranslationAction(vocabId, senseId, translation.id, {
        language: lang.trim(),
        translation: text.trim(),
      });
      if (res.success) {
        toast.success("Translation saved");
        setEditing(false);
      } else {
        toast.error(res.error ?? "Could not save translation.");
      }
    });
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-bg-soft px-3 py-2 text-sm">
        <Input
          className={`${inputCls} max-w-24`}
          value={lang}
          onChange={(e) => setLang(e.target.value)}
        />
        <Input
          className={inputCls}
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
        <button
          type="button"
          onClick={save}
          disabled={pending || !lang.trim() || !text.trim()}
          className="inline-flex size-7 items-center justify-center rounded-lg text-success transition-colors hover:bg-[color:color-mix(in_oklab,var(--success)_14%,transparent)] disabled:opacity-60"
          aria-label="Save translation"
        >
          <Check className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={pending}
          className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[color:var(--hover)] disabled:opacity-60"
          aria-label="Cancel edit"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-bg-soft px-3 py-2 text-sm">
      <span className="rounded-md bg-accent-soft px-2 py-0.5 font-mono text-[0.7rem] font-semibold uppercase text-accent">
        {translation.language}
      </span>
      <span className="flex-1 text-ink">{translation.translation}</span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        disabled={listPending}
        className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent-soft hover:text-accent disabled:opacity-60"
        aria-label="Edit translation"
      >
        <Pencil className="size-3.5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={listPending}
        className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-60"
        aria-label="Delete translation"
      >
        <Trash2 className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}

type ExampleRowProps = {
  vocabId: string;
  senseId: string;
  example: AdminExample;
  onDelete: () => void;
  listPending: boolean;
};

function ExampleRow({ vocabId, senseId, example, onDelete, listPending }: ExampleRowProps) {
  const [editing, setEditing] = useState(false);
  const [sentence, setSentence] = useState(example.sentence);
  const [translation, setTranslation] = useState(example.translation ?? "");
  const [pending, startTransition] = useTransition();

  function cancel() {
    setSentence(example.sentence);
    setTranslation(example.translation ?? "");
    setEditing(false);
  }

  function save() {
    if (!sentence.trim()) return;
    startTransition(async () => {
      const res = await patchExampleAction(vocabId, senseId, example.id, {
        sentence: sentence.trim(),
        translation: translation.trim() || null,
      });
      if (res.success) {
        toast.success("Example saved");
        setEditing(false);
      } else {
        toast.error(res.error ?? "Could not save example.");
      }
    });
  }

  if (editing) {
    return (
      <div className="space-y-2 rounded-lg bg-bg-soft px-3 py-2 text-sm">
        <Input
          className={inputCls}
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          autoFocus
        />
        <div className="flex items-center gap-2">
          <Input
            className={inputCls}
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            placeholder="translation (optional)"
          />
          <button
            type="button"
            onClick={save}
            disabled={pending || !sentence.trim()}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-success transition-colors hover:bg-[color:color-mix(in_oklab,var(--success)_14%,transparent)] disabled:opacity-60"
            aria-label="Save example"
          >
            <Check className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={pending}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[color:var(--hover)] disabled:opacity-60"
            aria-label="Cancel edit"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 rounded-lg bg-bg-soft px-3 py-2 text-sm">
      <div className="flex-1 space-y-1">
        <p className="text-ink">{example.sentence}</p>
        {example.translation && <p className="text-xs text-muted-foreground">{example.translation}</p>}
      </div>
      <button
        type="button"
        onClick={() => setEditing(true)}
        disabled={listPending}
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent-soft hover:text-accent disabled:opacity-60"
        aria-label="Edit example"
      >
        <Pencil className="size-3.5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={listPending}
        className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-60"
        aria-label="Delete example"
      >
        <Trash2 className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
