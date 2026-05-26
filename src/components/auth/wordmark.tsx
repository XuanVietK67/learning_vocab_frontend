import { cn } from "@/lib/utils";

type WordmarkProps = {
  size?: number;
  className?: string;
};

export function Wordmark({ size = 28, className }: WordmarkProps) {
  return (
    <div
      className={cn(
        "inline-flex items-baseline gap-2 font-display leading-none tracking-tight text-ink",
        className,
      )}
      style={{ fontSize: size }}
    >
      <span
        className="relative inline-flex items-center justify-center rounded-full bg-ink font-display italic text-bg"
        style={{
          width: size * 1.15,
          height: size * 1.15,
          fontSize: size * 0.72,
          top: size * 0.1,
        }}
      >
        L
      </span>
      <span>
        exa
        <span
          className="ml-0.5 inline-block size-1 rounded-full bg-accent align-baseline"
          style={{ marginBottom: size * 0.2 }}
        />
      </span>
    </div>
  );
}
