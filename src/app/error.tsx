"use client";

import { useEffect } from "react";
import { Button } from "@/components/button";
import { BracketLink } from "@/components/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="border-b border-line px-2 py-4 sm:px-3 sm:py-5">
      <p className="text-xs text-muted">500 / ERROR</p>
      <h1 className="mt-1 text-lg font-bold uppercase tracking-wider">
        [!] this page failed
      </h1>
      <p className="mt-2 max-w-2xl text-xs text-muted-strong">
        the request could not be completed. trying again is safe.
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-muted">
          <span aria-hidden>:: </span>
          <span>digest</span>
          <span className="ml-1 tabular-nums">{error.digest}</span>
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-1">
        <Button variant="solid" size="sm" onClick={reset}>
          retry
        </Button>
        <BracketLink href="/">catalog</BracketLink>
        <BracketLink href="/upload">upload</BracketLink>
      </div>
    </div>
  );
}
