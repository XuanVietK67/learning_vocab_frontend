export function VerifyLetter() {
  return (
    <div className="flex justify-center pb-2" aria-hidden>
      <div className="relative h-16 w-[88px] rounded-xs border border-ink bg-card shadow-[0_8px_24px_-12px_rgba(0,0,0,0.2)]">
        <span
          className="pointer-events-none absolute inset-0 border-t border-ink"
          style={{ clipPath: "polygon(0 0, 50% 60%, 100% 0, 100% 0, 0 0)" }}
        />
        <span className="absolute -bottom-2.5 -right-2.5 inline-flex size-7 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-ink">
          ✓
        </span>
      </div>
    </div>
  );
}
