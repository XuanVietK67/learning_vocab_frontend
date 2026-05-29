import { cn } from "@/lib/utils";

/** Matches the run of underscores the backend uses for the blank. */
const BLANK_RE = /_{2,}/;

type Props = {
  sentence: string;
  /** When set, the blank is filled with this word (feedback phase). */
  filled?: string | null;
  /** Tone of the filled word. */
  tone?: "neutral" | "correct" | "wrong";
  className?: string;
};

/**
 * Renders a sentence that contains a `_____` blank, styling the gap as a pill.
 * In feedback we drop the graded word into the gap.
 */
export function BlankSentence({ sentence, filled, tone = "neutral", className }: Props) {
  const match = sentence.match(BLANK_RE);
  if (!match) {
    return <p className={cn("text-pretty", className)}>{sentence}</p>;
  }

  const before = sentence.slice(0, match.index);
  const after = sentence.slice((match.index ?? 0) + match[0].length);

  return (
    <p className={cn("text-pretty", className)}>
      {before}
      {filled ? (
        <span
          className={cn(
            "mx-0.5 rounded-md px-1.5 py-0.5 font-semibold",
            tone === "correct" && "bg-[color:var(--success)]/12 text-success",
            tone === "wrong" && "bg-danger-soft text-danger line-through",
            tone === "neutral" && "bg-accent-soft text-accent",
          )}
        >
          {filled}
        </span>
      ) : (
        <span
          aria-label="blank"
          className="mx-1 inline-block w-16 translate-y-0.5 border-b-2 border-dashed border-line-2 align-baseline"
        />
      )}
      {after}
    </p>
  );
}
