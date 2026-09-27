import { BracketLink } from "@/components/link";
import { SITE } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-2 py-2 text-xs text-muted sm:px-3">
        <span className="text-foreground">
          &copy; 2026 {SITE.name}
        </span>
        <BracketLink href="#top" className="-mr-1 text-muted">
          top
        </BracketLink>
      </div>
    </footer>
  );
}
