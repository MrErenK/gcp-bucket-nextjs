"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/button";
import { Meter } from "@/components/meter";
import { Table, TBody, TD, TDNumeric, TH, THead, TR } from "@/components/table";
import { ABSENT } from "@/lib/format";
import {
  isActive,
  jobAge,
  jobMarker,
  jobPercent,
  jobProgressText,
  jobStateLabel,
  type JobView,
} from "@/lib/job-view";
import { cn } from "@/lib/cn";

const POLL_MS = 1000;
const WAITING_POLL_MS = 5000;

type StatusPayload = { now: number; jobs: JobView[] };

export function JobBoard({
  initial,
  now,
  highlight,
}: {
  initial: JobView[];
  now: number;
  highlight?: string;
}) {
  const [jobs, setJobs] = useState(initial);
  const [clock, setClock] = useState(now);
  const asking = useRef(false);

  const refresh = useCallback(async () => {
    if (asking.current) return;
    asking.current = true;

    try {
      const payload = await fetch("/api/uploads/status", { cache: "no-store" })
        .then((response) =>
          response.ok ? (response.json() as Promise<StatusPayload>) : null,
        )
        .catch(() => null);

      if (!payload) return;
      setJobs(payload.jobs);
      setClock(payload.now);
    } finally {
      asking.current = false;
    }
  }, []);

  const active = jobs.some(isActive);
  const fetching = jobs.some((job) => job.state === "fetching");

  useEffect(() => {
    if (!active) return;

    const timer = setInterval(refresh, fetching ? POLL_MS : WAITING_POLL_MS);
    return () => clearInterval(timer);
  }, [active, fetching, refresh]);
  return (
    <Table>
      <THead>
        <TR>
          <TH className="w-36 sm:w-44">JOB</TH>
          <TH className="w-40 sm:w-auto">FILE</TH>
          <TH className="w-56 sm:w-64">PROGRESS</TH>
          <TH className="w-40 sm:w-56">STATE</TH>
          <TH className="hidden w-16 text-right sm:table-cell">AGE</TH>
          <TH className="w-20 sm:w-24"> </TH>
        </TR>
      </THead>
      <TBody>
        {jobs.length === 0 ? (
          <TR>
            <TD colSpan={6} className="text-muted">
              NOTHING QUEUED
            </TD>
          </TR>
        ) : (
          jobs.map((job) => {
            const percent = jobPercent(job);

            return (
              <TR
                key={job.id}
                hover
                className={cn(job.id === highlight && "bg-surface")}
              >
                <TD className="font-bold">
                  <span
                    aria-hidden
                    className="mr-1 text-muted"
                  >
                    {job.id === highlight ? "->" : jobMarker(job)}
                  </span>
                  #{job.id}
                  <span className="block truncate font-normal text-muted">
                    {job.host}
                  </span>
                </TD>
                <TD className="break-all" title={job.file ?? undefined}>
                  {job.file ?? ABSENT}
                </TD>
                <TD>
                  {job.state === "failed" ? (
                    <span className="text-muted">{ABSENT}</span>
                  ) : (
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      {job.total === null ? (
                        <span aria-hidden className="text-muted">
                          [----------------------]
                        </span>
                      ) : (
                        <Meter
                          value={job.received}
                          max={job.total}
                          label={`${job.file ?? job.host} download`}
                        />
                      )}
                      <span className="tabular-nums">
                        {percent === null ? "--" : `${percent}%`}
                      </span>
                      <span className="w-full text-muted tabular-nums">
                        {jobProgressText(job)}
                      </span>
                    </div>
                  )}
                </TD>
                <TD>
                  <span aria-hidden className="mr-1 font-bold">
                    {jobMarker(job)}
                  </span>
                  <span className={job.state === "failed" ? "font-bold" : undefined}>
                    {jobStateLabel(job)}
                  </span>
                  {job.error ? (
                    <span className="block text-muted">-- {job.error}</span>
                  ) : null}
                </TD>
                <TDNumeric className="hidden sm:table-cell">
                  {jobAge(job, clock)}
                </TDNumeric>
                <TD>
                  {job.mine && isActive(job) ? (
                    <form action="/api/uploads/cancel" method="post">
                      <input type="hidden" name="id" value={job.id} />
                      <Button type="submit" variant="ghost" size="sm">
                        cancel
                      </Button>
                    </form>
                  ) : null}
                </TD>
              </TR>
            );
          })
        )}
      </TBody>
    </Table>
  );
}
