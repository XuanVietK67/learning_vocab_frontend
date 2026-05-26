export function FlashCardStack() {
  return (
    <div className="relative h-[460px] [perspective:1200px] max-md:h-[360px]">
      <FlashCard
        tag="Italian · A2"
        word="sprezzatura"
        ipa="/spret.tsa'tu.ra/"
        pos="noun"
        def="studied carelessness; the art of making something difficult look effortless."
        className="left-4 top-3 z-[1] -rotate-3"
      />
      <FlashCard
        tag="English · C1"
        word="petrichor"
        ipa="/'pɛ.trɪ.kɔːr/"
        pos="noun"
        def="the earthy scent produced when rain falls on dry soil."
        example={
          <>
            After weeks of drought, the <b>petrichor</b> filled the air.
          </>
        }
        className="right-2 top-9 z-[2] rotate-2"
      />
      <FlashCard
        tag="German · B1"
        word="Fernweh"
        ipa="/'fɛrnveː/"
        pos="noun, neuter"
        def="an ache for distant places; the opposite of homesickness."
        className="bottom-6 left-15 z-[3] -rotate-1"
      />
    </div>
  );
}

function FlashCard({
  tag,
  word,
  ipa,
  pos,
  def,
  example,
  className,
}: {
  tag: string;
  word: string;
  ipa: string;
  pos: string;
  def: string;
  example?: React.ReactNode;
  className?: string;
}) {
  return (
    <article
      className={
        "absolute w-[320px] rounded-2xl border border-line bg-card p-6 shadow-[0_24px_60px_-28px_rgba(20,19,15,0.25)] " +
        (className ?? "")
      }
    >
      <div className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {tag}
      </div>
      <p className="m-0 mb-1 font-display text-[38px] leading-none tracking-tight text-ink">
        {word}
      </p>
      <div className="mb-3 font-mono text-[12.5px] text-muted-foreground">
        {ipa}
      </div>
      <div className="mb-1.5 text-[13px] italic text-muted-2">{pos}</div>
      <p className="m-0 text-[14px] leading-snug text-ink-2">{def}</p>
      {example && (
        <p className="mt-3.5 border-t border-line pt-3 text-[13px] italic leading-snug text-muted-foreground [&_b]:not-italic [&_b]:rounded [&_b]:bg-accent-soft [&_b]:px-1 [&_b]:font-semibold [&_b]:text-ink">
          {example}
        </p>
      )}
    </article>
  );
}
