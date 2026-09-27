"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  function toggle() {
    const current =
      resolvedTheme ?? document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "light" : "dark");
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={toggle}
      className={className}
      aria-label="Toggle colour theme"
    >
      <span aria-hidden className="dark:hidden">
        [light]
      </span>
      <span aria-hidden className="hidden dark:inline">
        [dark]
      </span>
    </Button>
  );
}
