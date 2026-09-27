import type {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

export function Table({
  className,
  wrapperClassName,
  ...props
}: TableHTMLAttributes<HTMLTableElement> & { wrapperClassName?: string }) {
  return (
    <div className={cn("w-full overflow-x-auto", wrapperClassName)}>
      <table
        className={cn(
          "w-full min-w-[34rem] border border-line text-left text-xs",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function THead({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn("bg-surface text-xs uppercase tracking-wider", className)}
      {...props}
    />
  );
}

export function TBody({
  className,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...props} />;
}

export function TR({
  className,
  hover = false,
  ...props
}: HTMLAttributes<HTMLTableRowElement> & { hover?: boolean }) {
  return (
    <tr
      className={cn(
        hover && "hover:bg-invert hover:text-invert-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function TH({
  className,
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "border-r border-b border-line px-2 py-1.5 font-bold last:border-r-0 sm:py-1",
        className,
      )}
      {...props}
    />
  );
}

export function TD({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "border-r border-b border-line-subtle px-2 py-1.5 align-top last:border-r-0 sm:py-1",
        className,
      )}
      {...props}
    />
  );
}

export function TDNumeric({
  className,
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <TD
      className={cn("text-right tabular-nums text-muted", className)}
      {...props}
    />
  );
}
