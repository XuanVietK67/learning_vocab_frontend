"use client";

import * as React from "react";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  /** Play once automatically on mount (used by listening_cloze). */
  autoPlay?: boolean;
  label?: string;
  className?: string;
};

export function AudioButton({ src, autoPlay = false, label = "Play audio", className }: Props) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const play = React.useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = 0;
    void el.play().catch(() => {
      // Autoplay can be blocked before a user gesture — the manual tap recovers it.
    });
  }, []);

  React.useEffect(() => {
    if (autoPlay) play();
  }, [autoPlay, src, play]);

  return (
    <>
      <button
        type="button"
        onClick={play}
        aria-label={label}
        className={cn(
          "inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[0_10px_24px_-12px_rgba(255,107,107,0.6)] transition hover:brightness-95 focus-visible:ring-3 focus-visible:ring-ring/50",
          className,
        )}
      >
        <Volume2 className="size-5" aria-hidden />
      </button>
      <audio ref={audioRef} src={src} preload="auto" />
    </>
  );
}
