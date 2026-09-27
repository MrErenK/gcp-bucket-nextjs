import { cn } from "@/lib/cn";

export function SectionHeading({
  index,
  title,
  note,
  className,
}: {
  index: string;
  title: string;
  note?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline gap-x-3 gap-y-0.5 border-b border-line pb-1",
        className,
      )}
    >
      <h2 className="shrink-0 text-xs font-bold uppercase tracking-wider">
        <span className="text-muted">SECTION {index}</span>
        <span className="text-muted"> :: </span>
        {title}
      </h2>
      <span className="hidden h-px flex-1 bg-line-subtle sm:block" aria-hidden />
      {note ? (
        <span className="ml-auto shrink-0 text-xs text-muted sm:ml-0">
          {note}
        </span>
      ) : null}
    </div>
  );
}

export function Rule({ className }: { className?: string }) {
  return (
    <hr className={cn("border-0 border-t border-line-subtle", className)} />
  );
}
