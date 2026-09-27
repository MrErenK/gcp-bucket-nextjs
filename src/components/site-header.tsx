import Link from "next/link";
import { BracketLink } from "@/components/link";
import { SectionLink } from "@/components/section-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-background">
      <div className="flex flex-col gap-1 px-2 py-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-3 sm:py-2">
        <div className="flex items-baseline gap-2">
          <Link
            href="/"
            className="text-xs font-bold tracking-wider transition-colors duration-75 hover:bg-invert hover:text-invert-foreground"
          >
            {SITE.name}
          </Link>
        </div>

        <nav className="flex flex-wrap items-center gap-0.5">
          <SectionLink />
          <BracketLink
            href={SITE.repo}
            target="_blank"
            rel="noopener noreferrer"
          >
            source
          </BracketLink>
          <ThemeToggle className="-mr-1" />
        </nav>
      </div>
    </header>
  );
}
