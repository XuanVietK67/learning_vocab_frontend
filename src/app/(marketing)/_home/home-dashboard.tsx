import Link from "next/link";
import { Plus } from "lucide-react";
import { decksApi, type DeckSummary } from "@/lib/api/decks";
import { myVocabApi, type VocabularySummary } from "@/lib/api/my-vocab";
import { statsApi, type MeStats } from "@/lib/api/stats";
import { topicsApi, type Topic } from "@/lib/api/topics";
import { ApiError } from "@/lib/api/types";
import type { UserResponse } from "@/lib/api/types";
import { GreetingStrip } from "./greeting-strip";
import { ModeCards } from "./mode-cards";
import { TopicsRail } from "./topics-rail";
import { DecksGrid } from "./decks-grid";
import { MyVocabStrip } from "./my-vocab-strip";

// Treat any non-fatal API error as an empty section. The dashboard should
// degrade gracefully if one upstream call fails — the user can still use
// the other surfaces.
async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch (e) {
    if (e instanceof ApiError) return fallback;
    throw e;
  }
}

const EMPTY_STATS: MeStats = {
  streakDays: 0,
  dueNow: 0,
  reviewedToday: 0,
  dailyGoalMinutes: null,
  counts: { new: 0, learning: 0, review: 0, mastered: 0 },
};

type Props = { user: UserResponse };

export async function HomeDashboard({ user }: Props) {
  const [stats, topics, suggested, mine, myWords] = await Promise.all([
    safe(statsApi.me(), EMPTY_STATS),
    safe<Topic[]>(topicsApi.list(), []),
    safe<DeckSummary[]>(decksApi.suggested(), []),
    safe(decksApi.mine({ limit: 6 }), {
      data: [] as DeckSummary[],
      page: 1,
      limit: 6,
      total: 0,
    }),
    safe(
      myVocabApi.list({
        limit: 8,
        translationLang: user.nativeLanguage ?? undefined,
      }),
      { data: [] as VocabularySummary[], page: 1, limit: 8, total: 0 },
    ),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <GreetingStrip username={user.username} stats={stats} />
      <ModeCards stats={stats} />
      <TopicsRail topics={topics} />

      <DecksGrid
        title="Suggested for you"
        blurb={
          user.targetLanguage && user.proficiencyLevel
            ? `Curated for ${user.targetLanguage.toUpperCase()} · ${user.proficiencyLevel}.`
            : "Pick a target language and level in settings to see suggestions."
        }
        decks={suggested}
        emptyState={
          <p className="rounded-xl border border-dashed border-line-2 px-4 py-6 text-center text-sm text-muted-foreground">
            No suggested decks at your level yet.
          </p>
        }
      />

      <DecksGrid
        title="Your decks"
        blurb="Decks you&apos;ve built yourself."
        decks={mine.data}
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line-2 px-3 py-1.5 text-xs text-muted-foreground">
            <Plus className="size-3.5" aria-hidden />
            Builder coming soon
          </span>
        }
        emptyState={
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line-2 px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              You haven&apos;t built a personal deck yet.
            </p>
            <p className="text-xs text-muted-2">
              Once the deck builder ships, your decks will appear here.
            </p>
          </div>
        }
      />

      <MyVocabStrip words={myWords.data} />

      <footer className="pb-2 text-center text-xs text-muted-2">
        Need to tweak your goals?{" "}
        <Link href="/onboarding" className="text-accent hover:underline">
          Update setup
        </Link>
      </footer>
    </div>
  );
}
