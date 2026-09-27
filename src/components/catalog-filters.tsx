"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/button";
import { Field, Input, Select } from "@/components/input";
import {
  ALL,
  SEARCH_DEBOUNCE_MS,
  catalogHref,
  filtersHref,
  type CatalogQuery,
  type StatusFilter,
} from "@/lib/catalog";
import {
  ROM_RELEASES,
  ROM_VARIANTS,
  type RomRelease,
  type RomVariant,
} from "@/lib/rom-filename";
import type { DeviceOption } from "@/lib/roms";

const STATUSES: readonly StatusFilter[] = ["current", "outdated"];

export function CatalogFilters({
  query,
  devices,
}: {
  query: CatalogQuery;
  devices: DeviceOption[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const [text, setText] = useState(query.q);
  const [settled, setSettled] = useState(query.q);
  const [device, setDevice] = useState(query.device);
  const [variant, setVariant] = useState<RomVariant | typeof ALL>(query.variant);
  const [release, setRelease] = useState<RomRelease | typeof ALL>(query.release);
  const [status, setStatus] = useState<StatusFilter>(query.status);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(text), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text]);

  const current = filtersHref(query, pathname);
  const desired = filtersHref({ q: settled, device, variant, release, status }, pathname);
  const target = catalogHref(
    {
      q: settled,
      device,
      variant,
      release,
      status,
      sort: query.sort,
      dir: query.dir,
    },
    pathname,
  );
  const active = desired !== filtersHref({}, pathname);

  useEffect(() => {
    if (desired === current) return;
    startTransition(() => router.replace(target, { scroll: false }));
  }, [desired, current, target, router]);

  function reset() {
    setText("");
    setSettled("");
    setDevice(ALL);
    setVariant(ALL);
    setRelease(ALL);
    setStatus(ALL);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSettled(text);

    const href = catalogHref(
      {
        q: text,
        device,
        variant,
        release,
        status,
        sort: query.sort,
        dir: query.dir,
      },
      pathname,
    );
    if (href === target) return;

    startTransition(() => router.replace(href, { scroll: false }));
  }

  return (
    <form
      action={pathname}
      method="get"
      onSubmit={submit}
      aria-busy={pending}
      className="flex flex-wrap items-end gap-2"
    >
      <Field
        label="search"
        htmlFor="q"
        hint="-word excludes"
        className="min-w-48 flex-1"
      >
        <Input
          id="q"
          name="q"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="name, device, flags, checksum"
          autoComplete="off"
          spellCheck={false}
        />
      </Field>

      <Field label="device" htmlFor="device" className="w-full sm:w-60">
        <Select
          id="device"
          name="device"
          value={device}
          onChange={(event) => setDevice(event.target.value)}
        >
          <option value={ALL}>all devices</option>
          {devices.map((option) => (
            <option key={option.device} value={option.device}>
              {option.device} ({option.count})
            </option>
          ))}
        </Select>
      </Field>

      <Field label="variant" htmlFor="variant" className="w-full sm:w-32">
        <Select
          id="variant"
          name="variant"
          value={variant}
          onChange={(event) =>
            setVariant(event.target.value as RomVariant | typeof ALL)
          }
        >
          <option value={ALL}>all</option>
          {ROM_VARIANTS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="release" htmlFor="release" className="w-full sm:w-32">
        <Select
          id="release"
          name="release"
          value={release}
          onChange={(event) =>
            setRelease(event.target.value as RomRelease | typeof ALL)
          }
        >
          <option value={ALL}>all</option>
          {ROM_RELEASES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="status" htmlFor="status" className="w-full sm:w-32">
        <Select
          id="status"
          name="status"
          value={status}
          onChange={(event) => setStatus(event.target.value as StatusFilter)}
        >
          <option value={ALL}>any</option>
          {STATUSES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Field>

      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={reset} disabled={!active || pending}>
          reset
        </Button>
        <span
          aria-live="polite"
          className="w-20 text-xs uppercase tracking-wider text-muted"
        >
          {pending ? "[updating]" : null}
        </span>
      </div>

      <input type="hidden" name="sort" value={query.sort} />
      <input type="hidden" name="dir" value={query.dir} />
    </form>
  );
}
