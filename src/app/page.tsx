import type { Metadata } from "next";
import { Badge } from "@/components/badge";
import { CatalogFilters } from "@/components/catalog-filters";
import { CopyButton } from "@/components/copy-button";
import { JsonLd } from "@/components/json-ld";
import { BracketLink, SortLink } from "@/components/link";
import { Pagination } from "@/components/pagination";
import { Table, TBody, TD, TDNumeric, TH, THead, TR } from "@/components/table";
import {
  ALL,
  catalogCanonical,
  daysSince,
  isOutdated,
  nextSortStep,
  parseCatalogQuery,
  queryRoms,
  sortHref,
  summarize,
  type CatalogQuery,
  type SortKey,
} from "@/lib/catalog";
import { ABSENT, formatAge, formatBytes, formatCount } from "@/lib/format";
import { listDevices, loadRoms, type Rom } from "@/lib/roms";
import { catalogJsonLd, pageMetadata, siteTitle } from "@/lib/seo";
import { SITE } from "@/lib/site";

function Flags({ rom }: { rom: Rom }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {rom.release !== "unknown" ? (
        <Badge variant={rom.release === "official" ? "solid" : "muted"}>
          {rom.release}
        </Badge>
      ) : null}
      {rom.variant !== "unknown" ? (
        <Badge variant="muted">{rom.variant}</Badge>
      ) : null}
      {rom.image !== "unknown" ? (
        <Badge variant="muted">{rom.image}</Badge>
      ) : null}
      {rom.flags.map((flag) => (
        <Badge key={flag} variant="muted">
          {flag}
        </Badge>
      ))}
    </div>
  );
}

function SortHeader({
  label,
  sortKey,
  query,
  className,
}: {
  label: string;
  sortKey: SortKey;
  query: CatalogQuery;
  className?: string;
}) {
  const active = query.sort === sortKey;
  const ascending = query.dir === "asc";

  return (
    <TH
      className={className}
      aria-sort={
        active ? (ascending ? "ascending" : "descending") : undefined
      }
    >
      <SortLink
        href={sortHref(query, nextSortStep(query, sortKey))}
        prefetch={false}
        className="-mx-1 whitespace-nowrap"
      >
        {label}
        {active ? (
          <span aria-hidden className="ml-1 text-muted">
            {ascending ? "/\\" : "\\/"}
          </span>
        ) : null}
      </SortLink>
    </TH>
  );
}

function BuiltAt({ rom, now }: { rom: Rom; now: Date }) {
  const days = daysSince(rom.builtAt, now);

  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="tabular-nums">{rom.builtAt ?? ABSENT}</span>
      {days !== null ? (
        <span className="text-muted tabular-nums">{formatAge(days)}</span>
      ) : null}
      {isOutdated(rom.builtAt, now) ? (
        <Badge variant="muted">outdated</Badge>
      ) : null}
    </div>
  );
}

export async function generateMetadata({
  searchParams,
}: PageProps<"/">): Promise<Metadata> {
  const query = parseCatalogQuery(await searchParams);

  if (query.q) {
    return pageMetadata({
      title: siteTitle("search"),
      description: SITE.description,
      robots: { index: false, follow: true },
    });
  }

  if (query.device !== ALL) {
    return pageMetadata({
      title: siteTitle(query.device),
      description: `android rom builds for ${query.device}.`,
      canonical: catalogCanonical(query),
    });
  }

  return pageMetadata({
    title: SITE.name,
    description: SITE.description,
    canonical: catalogCanonical(query),
  });
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const query = parseCatalogQuery(await searchParams);
  const now = new Date();

  const roms = await loadRoms();
  const catalog = queryRoms(roms, query, now);
  const devices = listDevices(roms);
  const stats = summarize(roms, now);
  const empty = roms.length === 0;

  const jsonLd = catalogJsonLd({
    rows: catalog.rows,
    website: !query.q && query.device === ALL,
  });

  const totals: Array<[number, string]> = [
    [stats.brands, "roms"],
    [stats.devices, "devices"],
    [stats.outdated, "outdated"],
  ];

  return (
    <>
      <div className="border-b border-line px-2 py-2 sm:px-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h1 className="text-xs font-bold uppercase tracking-wider">catalog</h1>
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
            <span className="text-foreground tabular-nums">
              {stats.entries} entries
            </span>
            {totals.map(([count, label]) => (
              <span key={label} className="flex items-center gap-1">
                <span aria-hidden>::</span>
                <span className="tabular-nums">{count}</span>
                <span>{label}</span>
              </span>
            ))}
          </p>
        </div>
      </div>

      <div className="border-b border-line bg-surface px-2 py-2 sm:px-3">
        <CatalogFilters query={query} devices={devices} />
      </div>

      {catalog.filtered ? (
        <div className="border-b border-line px-2 py-1.5 sm:px-3">
          <p className="text-xs text-muted">
            <span aria-hidden>:: </span>
            <span className="tabular-nums text-foreground">{catalog.total}</span>
            <span className="tabular-nums"> / {roms.length}</span>
            <span> shown</span>
          </p>
        </div>
      ) : null}

      <div className="px-2 py-3 sm:px-3">
        <Table>
          <THead>
            <TR>
              <SortHeader label="ROM" sortKey="name" query={query} className="w-32" />
              <SortHeader
                label="VERSION"
                sortKey="version"
                query={query}
                className="w-24"
              />
              <SortHeader
                label="DEVICE"
                sortKey="device"
                query={query}
                className="w-44"
              />
              <SortHeader
                label="BUILT"
                sortKey="built"
                query={query}
                className="w-36"
              />
              <TH className="w-56">TAGS</TH>
              <SortHeader
                label="SIZE"
                sortKey="size"
                query={query}
                className="w-20 text-right"
              />
              <TH className="w-40">SHA256</TH>
              <SortHeader
                label="DOWNLOADS"
                sortKey="downloads"
                query={query}
                className="w-20 text-right"
              />
              <TH className="w-32"> </TH>
            </TR>
          </THead>
          <TBody>
            {catalog.rows.length === 0 ? (
              <TR>
                {empty ? (
                  <TD colSpan={9} className="text-muted">
                    NOTHING STORED --{" "}
                    <BracketLink href="/upload" className="-my-1">
                      upload
                    </BracketLink>
                  </TD>
                ) : (
                  <TD colSpan={9} className="text-muted">
                    NO MATCHES
                  </TD>
                )}
              </TR>
            ) : (
              catalog.rows.map((rom) => (
                <TR key={rom.id} hover>
                  <TD className="font-bold" title={rom.file}>
                    {rom.name}
                  </TD>
                  <TD className="tabular-nums">
                    {rom.version ?? ABSENT}
                    {rom.revision ? (
                      <span className="text-muted"> / {rom.revision}</span>
                    ) : null}
                  </TD>
                  <TD className="font-bold">{rom.device ?? ABSENT}</TD>
                  <TD>
                    <BuiltAt rom={rom} now={now} />
                  </TD>
                  <TD>
                    <Flags rom={rom} />
                  </TD>
                  <TDNumeric>{formatBytes(rom.sizeBytes) ?? ABSENT}</TDNumeric>
                  <TD>
                    {rom.sha256 ? (
                      <CopyButton
                        value={rom.sha256}
                        label="Copy SHA256 checksum"
                      >
                        {rom.sha256.slice(0, 16)}
                      </CopyButton>
                    ) : (
                      <span className="text-muted">{ABSENT}</span>
                    )}
                  </TD>
                  <TDNumeric>{formatCount(rom.downloads)}</TDNumeric>
                  <TD>
                    <div className="flex items-center gap-1">
                      <BracketLink
                        href={rom.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        download
                      </BracketLink>
                      <CopyButton value={rom.url} label="Copy download URL">
                        url
                      </CopyButton>
                    </div>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </div>

      <Pagination
        query={query}
        page={catalog.page}
        pageCount={catalog.pageCount}
      />

      {jsonLd ? <JsonLd data={jsonLd} /> : null}
    </>
  );
}
