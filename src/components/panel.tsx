import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Panel({
  title,
  meta,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("border border-line", className)}>
      <header className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 border-b border-line bg-surface px-2 py-1.5 sm:py-1">
        <h3 className="text-xs font-bold uppercase tracking-wider">{title}</h3>
        {meta ? <span className="text-xs text-muted">{meta}</span> : null}
      </header>
      <div className={cn("p-2.5 sm:p-2", bodyClassName)}>{children}</div>
    </section>
  );
}

export function Card({
  children,
  className,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "border border-line p-2.5 sm:p-2",
        interactive &&
          "transition-colors duration-75 hover:bg-invert hover:text-invert-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SpecList({
  items,
  className,
}: {
  items: Array<{ term: string; value: ReactNode }>;
  className?: string;
}) {
  return (
    <dl className={cn("border-t border-line-subtle text-xs", className)}>
      {items.map(({ term, value }) => (
        <div
          key={term}
          className="flex items-baseline justify-between gap-3 border-b border-line-subtle py-1"
        >
          <dt className="text-muted">{term}</dt>
          <dd className="text-right">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
