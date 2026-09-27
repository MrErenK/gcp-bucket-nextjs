import type { ReactNode } from "react";
import { NavLink } from "@/components/link";
import { cn } from "@/lib/cn";
import { catalogHref, type CatalogQuery } from "@/lib/catalog";

const slot =
  "inline-flex items-center px-1 py-1 text-xs font-bold uppercase tracking-wider";

function PageSlot({ href, children }: { href: string | null; children: ReactNode }) {
  if (!href) {
    return (
      <span className={cn(slot, "text-muted")}>
        <span aria-hidden>[</span>
        {children}
        <span aria-hidden>]</span>
      </span>
    );
  }

  return (
    <NavLink href={href} prefetch={false}>
      {children}
    </NavLink>
  );
}

export function Pagination({
  query,
  page,
  pageCount,
  basePath = "/",
}: {
  query: CatalogQuery;
  page: number;
  pageCount: number;
  basePath?: string;
}) {
  if (pageCount <= 1) return null;

  const at = (target: number) => catalogHref({ ...query, page: target }, basePath);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line px-2 py-2 sm:px-3"
    >
      <p className="text-xs text-muted">
        <span aria-hidden>:: </span>
        <span>page </span>
        <span className="tabular-nums text-foreground">{page}</span>
        <span className="tabular-nums"> / {pageCount}</span>
      </p>

      <div className="flex items-center gap-1">
        <PageSlot href={page > 1 ? at(1) : null}>first</PageSlot>
        <PageSlot href={page > 1 ? at(page - 1) : null}>prev</PageSlot>
        <PageSlot href={page < pageCount ? at(page + 1) : null}>next</PageSlot>
        <PageSlot href={page < pageCount ? at(pageCount) : null}>last</PageSlot>
      </div>
    </nav>
  );
}
