"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

export type SelectOption = string | { value: string; label: string };

type Item = { value: string; label: string };

function normalize(options: readonly SelectOption[]): Item[] {
  return options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );
}

const base =
  "flex cursor-pointer items-center justify-between gap-1 text-left text-xs " +
  "transition-colors duration-75 disabled:pointer-events-none disabled:opacity-40";

const fieldTrigger =
  "h-9 w-full border border-line bg-background px-1 text-foreground sm:h-7 " +
  "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-foreground";

export function Select({
  id,
  name,
  value,
  defaultValue,
  onChange,
  options,
  placeholder,
  className,
  menuClassName,
  menuAlign = "start",
  bare = false,
  disabled = false,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  className?: string;
  menuClassName?: string;
  menuAlign?: "start" | "end";
  bare?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}) {
  const uid = useId();
  const listId = `${uid}-list`;

  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const [internal, setInternal] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const items: Item[] = normalize(options);
  const list: Item[] =
    placeholder === undefined
      ? items
      : [{ value: "", label: placeholder }, ...items];

  const current = value ?? internal;
  const selected = list.find((item) => item.value === current);
  const muted = !selected || selected.value === "";

  function optionId(index: number): string {
    return `${uid}-${index}`;
  }

  function openMenu() {
    if (disabled) return;
    const index = list.findIndex((item) => item.value === current);
    setActiveIndex(index === -1 ? 0 : index);
    setOpen(true);
  }

  function closeMenu() {
    setOpen(false);
    setActiveIndex(-1);
    buttonRef.current?.focus();
  }

  function choose(next: string) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
    closeMenu();
  }

  function move(step: number) {
    setActiveIndex((index) => {
      const next = index + step;
      if (next < 0) return list.length - 1;
      if (next >= list.length) return 0;
      return next;
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const key = event.key;

    if (!open) {
      if (
        key === "ArrowDown" ||
        key === "ArrowUp" ||
        key === "Enter" ||
        key === " "
      ) {
        event.preventDefault();
        openMenu();
      }
      return;
    }

    if (key === "Escape") {
      event.preventDefault();
      closeMenu();
    } else if (key === "Tab") {
      setOpen(false);
    } else if (key === "Enter" || key === " ") {
      event.preventDefault();
      if (activeIndex >= 0) choose(list[activeIndex].value);
    } else if (key === "ArrowDown") {
      event.preventDefault();
      move(1);
    } else if (key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    } else if (key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
    } else if (key === "End") {
      event.preventDefault();
      setActiveIndex(list.length - 1);
    }
  }

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const node = menuRef.current?.children[activeIndex];
    if (node instanceof HTMLElement) node.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  return (
    <div ref={rootRef} className={cn("relative flex", bare && "shrink-0")}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={
          open && activeIndex >= 0 ? optionId(activeIndex) : undefined
        }
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        disabled={disabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={onKeyDown}
        className={cn(base, bare ? "bg-transparent outline-none" : fieldTrigger, className)}
      >
        <span className={cn("truncate min-w-0", muted && "text-muted")}>
          {selected ? selected.label : (placeholder ?? current)}
        </span>
        <span aria-hidden="true" className="shrink-0 text-muted">
          {open ? "^" : "v"}
        </span>
      </button>

      {name === undefined ? null : (
        <input type="hidden" name={name} value={current} />
      )}

      {open ? (
        <ul
          ref={menuRef}
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            "absolute top-full z-50 mt-px max-h-60 w-max min-w-full overflow-y-auto",
            "border border-line bg-surface py-0.5",
            menuAlign === "end" ? "right-0" : "left-0",
            menuClassName,
          )}
        >
          {list.map((item, index) => {
            const active = index === activeIndex;
            return (
              <li
                key={`${item.value}\u0000${index}`}
                id={optionId(index)}
                role="option"
                aria-selected={item.value === current}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(item.value)}
                className={cn(
                  "cursor-pointer px-1.5 py-1 text-xs",
                  active ? "bg-invert text-invert-foreground" : "text-foreground",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn("mr-1", !active && "text-muted")}
                >
                  {item.value === current ? "[x]" : "[ ]"}
                </span>
                {item.label}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
