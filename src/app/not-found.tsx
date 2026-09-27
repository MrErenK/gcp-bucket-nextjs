import { BracketLink } from "@/components/link";

export default function NotFound() {
  return (
    <div className="border-b border-line px-2 py-4 sm:px-3 sm:py-5">
      <p className="text-xs text-muted">404 / NOT FOUND</p>
      <h1 className="mt-1 text-lg font-bold uppercase tracking-wider">
        no such page
      </h1>
      <p className="mt-2 max-w-2xl text-xs text-muted-strong">
        the address you asked for is not here. nothing was changed.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-1">
        <BracketLink href="/">catalog</BracketLink>
        <BracketLink href="/upload">upload</BracketLink>
      </div>
    </div>
  );
}
