import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "solid" | "outline" | "ghost";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 border font-mono font-bold uppercase tracking-wider " +
  "cursor-pointer whitespace-nowrap transition-colors duration-75 " +
  "disabled:pointer-events-none disabled:opacity-40 " +
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-foreground";

const variants: Record<Variant, string> = {
  solid:
    "border-line bg-invert text-invert-foreground hover:bg-background hover:text-foreground",
  outline:
    "border-line bg-background text-foreground hover:bg-invert hover:text-invert-foreground",
  ghost:
    "border-transparent bg-transparent text-foreground hover:bg-invert hover:text-invert-foreground",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-2.5 text-xs sm:h-7",
  md: "h-10 px-3.5 text-xs sm:h-8 sm:px-3",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = "outline",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

export type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant;
  size?: Size;
};

export function ButtonLink({
  variant = "outline",
  size = "md",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <a className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}
