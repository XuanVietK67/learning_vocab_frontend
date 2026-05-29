"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Hourglass, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { startSessionAction } from "@/lib/actions/start-session";
import { submitAnswerAction } from "@/lib/actions/submit-answer";
import type {
  AnswerResult,
  EmptyReason,
  LearnItem,
  LearnMode,
  Requeue,
  StartSessionInput,
} from "@/lib/api/learn";
import { clearSession, loadSession, saveSession, type StoredSession } from "@/lib/learn/session-store";
import { cn } from "@/lib/utils";
import { SessionEmptyDialog } from "@/components/learn/session-empty-dialog";
import { QuestionRouter } from "./question-router";
import { SessionTopBar } from "./session-top-bar";
import { FeedbackBar } from "./feedback-bar";
import { SessionSummary } from "./session-summary";
import type { Phase } from "./types";

type LoadState = "loading" | "ready" | "missing";

export function SessionPlayer({ sessionId }: { sessionId: string }) {
  const router = useRouter();

  const [load, setLoad] = React.useState<{ state: LoadState; stored: StoredSession | null }>({
    state: "loading",
    stored: null,
  });

  const [index, setIndex] = React.useState(0);
  const [phase, setPhase] = React.useState<Phase>("question");
  const [draft, setDraft] = React.useState("");
  const [results, setResults] = React.useState<Record<number, AnswerResult>>({});
  const [submitting, setSubmitting] = React.useState(false);
  // Cards the SRS rescheduled within the requeue window. `served` are appended
  // to the active list as they come due; `queue` holds the rest, sorted by
  // dueAtMs. While a card is pending but not yet due, `waitingUntil` drives a
  // short interstitial instead of ending the session.
  const [served, setServed] = React.useState<LearnItem[]>([]);
  const [queue, setQueue] = React.useState<Requeue[]>([]);
  const [waitingUntil, setWaitingUntil] = React.useState<number | null>(null);
  const [, startRestart] = React.useTransition();
  const [restarting, setRestarting] = React.useState(false);
  // Picker came back empty on restart — show the reason-aware dialog.
  const [empty, setEmpty] = React.useState<{
    reason: EmptyReason | null;
    nextDueAt: string | null;
    mode: LearnMode;
  } | null>(null);

  const startedAt = React.useRef<number>(0);
  const { state: loadState, stored } = load;

  // Read the client-held session once on mount — sessionStorage is browser-only,
  // so this can't run during render/SSR; a single setState keeps it contained.
  React.useEffect(() => {
    const found = loadSession(sessionId);
    const ok = !!found && found.session.items.length > 0;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing one-shot browser storage into React on mount
    setLoad({ state: ok ? "ready" : "missing", stored: ok ? found : null });
  }, [sessionId]);

  // (Re)start the latency clock whenever a fresh question is shown. Keyed on
  // `waitingUntil` too so leaving the interstitial for a freshly served
  // requeue resets the clock even though `index` is unchanged.
  React.useEffect(() => {
    if (loadState === "ready" && phase === "question" && waitingUntil == null) {
      startedAt.current = Date.now();
    }
  }, [index, phase, loadState, waitingUntil]);

  const items = React.useMemo(
    () => [...(stored?.session.items ?? []), ...served],
    [stored, served],
  );
  const total = items.length;
  const waiting = loadState === "ready" && waitingUntil != null;
  const finished = loadState === "ready" && !waiting && index >= total;
  const item = !finished && !waiting ? items[index] : undefined;
  const current = item ? results[index] ?? null : null;

  const canSubmit = phase === "question" && draft.trim().length > 0 && !submitting;

  const submit = React.useCallback(async () => {
    if (!stored || !item || phase !== "question" || draft.trim().length === 0) return;
    setSubmitting(true);
    const res = await submitAnswerAction({
      vocabularyId: item.vocabularyId,
      type: item.type,
      exampleId: item.exampleId,
      userAnswer: draft,
      latencyMs: Date.now() - startedAt.current,
      nonce: item.nonce,
      issuedAtMs: item.issuedAtMs,
      signature: item.signature,
      translationLang: stored.translationLang ?? undefined,
      sessionId: stored.session.sessionId,
    });
    setSubmitting(false);

    if (!res.success) {
      toast.error(res.error);
      if (res.expired) {
        clearSession(sessionId);
        router.push("/");
      }
      return;
    }

    setResults((prev) => ({ ...prev, [index]: res.result }));
    // Card rescheduled within the requeue window — hold it for replay later
    // in this session, ordered by when it comes due.
    if (res.result.requeue) {
      const r = res.result.requeue;
      setQueue((q) => [...q, r].sort((a, b) => a.dueAtMs - b.dueAtMs));
    }
    setPhase("feedback");
  }, [stored, item, phase, draft, index, sessionId, router]);

  // Mirror the queue into a ref so serve logic reads the latest head without
  // nesting state updaters or going stale inside timers/handlers.
  const queueRef = React.useRef<Requeue[]>([]);
  React.useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  // Promote the earliest requeued card into the active list.
  const serveDue = React.useCallback(() => {
    const q = queueRef.current;
    if (q.length === 0) {
      setWaitingUntil(null);
      return;
    }
    const [next, ...rest] = q;
    queueRef.current = rest;
    setQueue(rest);
    setServed((s) => [...s, next.item]);
    setWaitingUntil(null);
  }, []);

  const advance = React.useCallback(() => {
    setDraft("");
    setPhase("question");
    const next = index + 1;
    setIndex(next);
    if (next < total) return;
    // Walked off the end of the served list. Bring in a requeued card if one
    // is due now, wait for the soonest one, or finish if the queue is empty.
    if (queue.length === 0) return;
    if (queue[0].dueAtMs <= Date.now()) serveDue();
    else setWaitingUntil(queue[0].dueAtMs);
  }, [index, total, queue, serveDue]);

  const finishNow = React.useCallback(() => {
    setQueue([]);
    queueRef.current = [];
    setWaitingUntil(null);
    setIndex(total);
  }, [total]);

  const runStart = React.useCallback(
    (input: StartSessionInput) => {
      setRestarting(true);
      startRestart(async () => {
        const res = await startSessionAction(input);
        setRestarting(false);
        if (res.success) {
          setEmpty(null);
          clearSession(sessionId);
          // Fresh slate before handing off to the new session's route.
          setIndex(0);
          setResults({});
          setPhase("question");
          setDraft("");
          setServed([]);
          setQueue([]);
          queueRef.current = [];
          setWaitingUntil(null);
          saveSession({
            input,
            session: res.session,
            translationLang: res.translationLang,
          });
          router.replace(`/learn/${res.session.sessionId}`);
          return;
        }
        if (res.kind === "empty") {
          setEmpty({ reason: res.reason, nextDueAt: res.nextDueAt, mode: input.mode });
          return;
        }
        toast.error(res.error);
      });
    },
    [sessionId, router, startRestart],
  );

  const restart = React.useCallback(() => {
    if (!stored) return;
    runStart(stored.input);
  }, [stored, runStart]);

  const exit = React.useCallback(() => {
    const answered = Object.keys(results).length > 0;
    if (answered && !finished) {
      const ok = window.confirm("Leave this session? Your progress so far is saved.");
      if (!ok) return;
    }
    clearSession(sessionId);
    router.push("/");
  }, [results, finished, sessionId, router]);

  // Enter advances: submit in question phase, continue in feedback.
  React.useEffect(() => {
    if (loadState !== "ready" || finished) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (phase === "question" && canSubmit) {
        e.preventDefault();
        void submit();
      } else if (phase === "feedback") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loadState, finished, phase, canSubmit, submit, advance]);

  /* ── Render states ────────────────────────────────────────────────── */

  if (loadState === "loading") {
    return (
      <Centered>
        <Loader2 className="size-6 animate-spin text-accent" aria-hidden />
        <p className="mt-3 text-sm text-muted-foreground">Loading your session…</p>
      </Centered>
    );
  }

  if (loadState === "missing") {
    return (
      <Centered>
        <div className="w-full animate-fade-up rounded-2xl border border-line bg-card p-8 text-center shadow-[0_10px_24px_-12px_rgba(255,107,107,0.35)]">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Sparkles className="size-6" aria-hidden />
          </div>
          <h1 className="font-display text-2xl text-ink">Session not found</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This learning session has expired or was opened in a new tab. Start a fresh one from
            home.
          </p>
          <Link
            href="/"
            className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-medium text-accent-foreground shadow-[0_10px_24px_-12px_rgba(255,107,107,0.6)] transition hover:brightness-95"
          >
            Back to home
          </Link>
        </div>
      </Centered>
    );
  }

  if (waiting && waitingUntil != null) {
    return (
      <Centered>
        <WaitingScreen dueAtMs={waitingUntil} onReady={serveDue} onFinish={finishNow} />
      </Centered>
    );
  }

  if (finished) {
    const correctCount = Object.values(results).filter((r) => r.correct).length;
    return (
      <Centered>
        <SessionSummary
          total={total}
          correctCount={correctCount}
          enrolledNewlyCount={stored?.session.enrolledNewlyCount ?? 0}
          onRestart={restart}
          restarting={restarting}
        />
        <SessionEmptyDialog
          open={empty !== null}
          onOpenChange={(o) => {
            if (!o) setEmpty(null);
          }}
          reason={empty?.reason ?? null}
          nextDueAt={empty?.nextDueAt ?? null}
          mode={empty?.mode ?? stored?.input.mode ?? "daily"}
          onStartDaily={() => runStart({ mode: "daily", limit: 15 })}
          pending={restarting}
        />
      </Centered>
    );
  }

  const segments = items.map((_, i): "pending" | "current" | "correct" | "wrong" => {
    const r = results[i];
    if (r) return r.correct ? "correct" : "wrong";
    return i === index ? "current" : "pending";
  });

  const correctAnswer = current?.correctAnswer ?? null;
  const almost = !!current && !current.correct && current.quality === 3;

  return (
    <main className="relative z-2 mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-6">
      <SessionTopBar total={total} current={index} segments={segments} onExit={exit} />

      <div className="flex flex-1 flex-col items-center justify-center py-8">
        {item ? (
          <div className="w-full">
            <div className="mb-6 flex justify-center">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">
                {item.lemma}
              </span>
            </div>
            <div key={item.sessionItemId} className="animate-fade-up">
              <QuestionRouter
                prompt={item.prompt}
                value={draft}
                onChange={setDraft}
                phase={phase}
                correctAnswer={correctAnswer}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="sticky bottom-0 flex flex-col gap-3 bg-linear-to-t from-bg to-transparent pt-4 pb-2">
        {phase === "feedback" && current ? (
          <FeedbackBar
            correct={current.correct}
            correctAnswer={current.correctAnswer}
            almost={almost}
            stepIndex={current.progress.learningStepIndex}
          />
        ) : null}

        {phase === "question" ? (
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className={cn(
              "inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground shadow-[0_10px_24px_-12px_rgba(255,107,107,0.6)] transition hover:brightness-95",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Check
          </button>
        ) : (
          <button
            type="button"
            onClick={advance}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground shadow-[0_10px_24px_-12px_rgba(255,107,107,0.6)] transition hover:brightness-95"
          >
            {index + 1 >= total ? "Finish" : "Continue"}
            <ArrowRight className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </main>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative z-2 mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12">
      {children}
    </main>
  );
}

/**
 * Short interstitial shown when every card has been answered but one is
 * scheduled to re-surface in this session shortly (learning-step requeue).
 * Counts down to `dueAtMs`, then calls `onReady` once; `onFinish` lets the user
 * bail out and end the session instead of waiting.
 */
function WaitingScreen({
  dueAtMs,
  onReady,
  onFinish,
}: {
  dueAtMs: number;
  onReady: () => void;
  onFinish: () => void;
}) {
  const [now, setNow] = React.useState(() => Date.now());
  const fired = React.useRef(false);

  React.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const msLeft = dueAtMs - now;

  React.useEffect(() => {
    if (msLeft <= 0 && !fired.current) {
      fired.current = true;
      onReady();
    }
  }, [msLeft, onReady]);

  const secs = Math.max(0, Math.ceil(msLeft / 1000));
  const mm = Math.floor(secs / 60);
  const ss = secs % 60;
  const label = mm > 0 ? `${mm}:${String(ss).padStart(2, "0")}` : `${ss}s`;

  return (
    <div className="w-full animate-fade-up rounded-2xl border border-line bg-card p-8 text-center shadow-[0_10px_24px_-12px_rgba(255,107,107,0.35)]">
      <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Hourglass className="size-6" aria-hidden />
      </div>
      <h1 className="font-display text-2xl text-ink">Nice work — one more soon</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        A card from this session comes back around to lock it in.
      </p>
      <p className="mt-5 font-mono text-3xl tabular-nums text-accent" aria-live="polite">
        {label}
      </p>
      <button
        type="button"
        onClick={onFinish}
        className="mt-7 inline-flex h-11 items-center justify-center rounded-xl border border-line-2 px-5 text-sm font-medium text-ink transition hover:bg-[color:var(--hover)]"
      >
        Finish session
      </button>
    </div>
  );
}
