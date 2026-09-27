import type { Metadata } from "next";
import { connection } from "next/server";
import { headers } from "next/headers";
import { Button } from "@/components/button";
import { Field, Input } from "@/components/input";
import { JobBoard } from "@/components/job-board";
import { BracketLink } from "@/components/link";
import { SectionHeading } from "@/components/section-heading";
import { Table, TBody, TD, TDNumeric, TH, THead, TR } from "@/components/table";
import { ABSENT, formatBytes } from "@/lib/format";
import { isActive } from "@/lib/job-view";
import { getJob, jobFeed } from "@/lib/jobs";
import { clientAddress } from "@/lib/rate-limit";
import { pageMetadata, siteTitle } from "@/lib/seo";
import { storageState } from "@/lib/storage";
import {
  MAX_BYTES,
  MAX_PER_ADDRESS,
  MIN_BYTES,
  rateLimitLabel,
} from "@/lib/upload-config";

export const metadata: Metadata = pageMetadata({
  title: siteTitle("upload"),
  description: "the fetch queue and the stored builds.",
  canonical: "/upload",
});

const LISTED = 60;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Upload({ searchParams }: PageProps<"/upload">) {
  await connection();

  const params = await searchParams;
  const job = first(params.job);
  const gone = job !== undefined && getJob(job) === null;
  const error =
    first(params.error) ?? (gone ? "that job is no longer tracked" : undefined);

  const { now, jobs } = await jobFeed(clientAddress(await headers()));
  const active = jobs.filter(isActive).length;

  const state = await storageState();
  const listed = state.files.slice(0, LISTED);

  return (
    <>
      <div className="border-b border-line px-2 py-2 sm:px-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h1 className="text-xs font-bold uppercase tracking-wider">upload</h1>
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
            <span className="text-foreground tabular-nums">
              {state.count} stored
            </span>
            <span className="flex items-center gap-1">
              <span aria-hidden>::</span>
              <span className="tabular-nums">
                {formatBytes(state.bytes) ?? ABSENT}
              </span>
              <span>used</span>
            </span>
            <span className="flex items-center gap-1">
              <span aria-hidden>::</span>
              <span className="tabular-nums">
                {state.free === null ? ABSENT : formatBytes(state.free)}
              </span>
              <span>free</span>
            </span>
          </p>
        </div>
      </div>

      {error ? (
        <div className="border-b border-line bg-surface px-2 py-1.5 sm:px-3">
          <p className="text-xs">
            <span aria-hidden className="font-bold">
              [error]{" "}
            </span>
            <span>{error}</span>
          </p>
        </div>
      ) : null}

      <section className="border-b border-line px-2 py-3 sm:px-3">
        <SectionHeading index="01" title="fetch a build" note="links only" />
        <form
          action="/api/uploads"
          method="post"
          className="mt-2 flex flex-wrap items-end gap-2"
        >
          <Field
            label="direct download link"
            hint=".zip"
            htmlFor="url"
            className="min-w-64 flex-1"
          >
            <Input
              id="url"
              name="url"
              type="url"
              required
              maxLength={2048}
              placeholder="https://example.invalid/build.zip"
              autoComplete="off"
              spellCheck={false}
            />
          </Field>
          <Button type="submit" variant="solid">
            fetch
          </Button>
        </form>
        <p className="mt-2 text-xs text-muted">
          <span aria-hidden>:: </span>
          zip archives only, {formatBytes(MIN_BYTES)} to {formatBytes(MAX_BYTES)}{" "}
          -- {MAX_PER_ADDRESS} waiting at a time, {rateLimitLabel()}
        </p>
      </section>

      <section className="border-b border-line px-2 py-3 sm:px-3">
        <SectionHeading
          index="02"
          title="queue"
          note={active > 0 ? `${active} active` : "idle"}
        />
        <div className="mt-2">
          <JobBoard initial={jobs} now={now} highlight={job} />
        </div>
        <p className="mt-2 text-xs text-muted">
          <span aria-hidden>:: </span>
          <span>updates live while a fetch runs,</span>
          <BracketLink href="/upload" className="ml-1">
            refresh
          </BracketLink>
          <span className="ml-1">otherwise</span>
        </p>
      </section>

      <section className="px-2 py-3 sm:px-3">
        <SectionHeading
          index="03"
          title="stored builds"
          note={state.count > 0 ? "newest first" : undefined}
        />
        <div className="mt-2">
          <Table>
            <THead>
              <TR>
                <TH>FILE</TH>
                <TH className="w-24 text-right">SIZE</TH>
                <TH className="w-28">ADDED</TH>
              </TR>
            </THead>
            <TBody>
              {listed.length === 0 ? (
                <TR>
                  <TD colSpan={3} className="text-muted">
                    NOTHING STORED
                  </TD>
                </TR>
              ) : (
                listed.map((file) => (
                  <TR key={file.file} hover>
                    <TD className="font-bold">{file.file}</TD>
                    <TDNumeric>{formatBytes(file.bytes) ?? ABSENT}</TDNumeric>
                    <TD className="tabular-nums text-muted">
                      {file.modifiedAt.slice(0, 10)}
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
        </div>
        {state.files.length > listed.length ? (
          <p className="mt-2 text-xs text-muted">
            <span aria-hidden>:: </span>
            <span className="tabular-nums">
              {state.files.length - listed.length}
            </span>
            <span> older files not listed</span>
          </p>
        ) : null}
      </section>
    </>
  );
}
