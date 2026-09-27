import type { AnchorHTMLAttributes, ComponentProps } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

const interactive =
  "inline-flex items-center px-1 py-1 text-xs font-bold uppercase tracking-wider " +
  "transition-colors duration-75 " +
  "hover:bg-invert hover:text-invert-foreground " +
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-foreground";

export function BracketLink({
  children,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cn(interactive, className)} {...props}>
      <span aria-hidden>[</span>
      {children}
      <span aria-hidden>]</span>
    </a>
  );
}

export function NavLink({
  children,
  className,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link className={cn(interactive, className)} {...props}>
      <span aria-hidden>[</span>
      {children}
      <span aria-hidden>]</span>
    </Link>
  );
}

export function SortLink({
  children,
  className,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link className={cn(interactive, className)} {...props}>
      {children}
    </Link>
  );
}

export function TextLink({
  children,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn(
        "underline decoration-1 underline-offset-2",
        "transition-colors duration-75",
        "hover:bg-invert hover:text-invert-foreground hover:no-underline",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export function ArrowLink({
  children,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn(
        "inline-flex items-center gap-1.5 px-1 py-1 text-xs font-bold uppercase tracking-wider",
        "transition-colors duration-75",
        "hover:bg-invert hover:text-invert-foreground",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-foreground",
        className,
      )}
      {...props}
    >
      <span aria-hidden>-&gt;</span>
      {children}
    </a>
  );
}
