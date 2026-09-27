import type { Metadata } from "next";
import type { Rom } from "@/lib/roms";
import { SITE } from "@/lib/site";

export const SITE_ORIGIN = SITE.url;

export function siteTitle(page: string): string {
  return `${page} -- ${SITE.name}`;
}

type PageSeo = {
  title: string;
  description: string;
  canonical?: string | null;
  robots?: Metadata["robots"];
};

export function pageMetadata(seo: PageSeo): Metadata {
  const openGraph: NonNullable<Metadata["openGraph"]> = {
    type: "website",
    siteName: SITE.name,
    locale: "en",
    title: seo.title,
    description: seo.description,
  };

  const metadata: Metadata = {
    title: seo.title,
    description: seo.description,
    openGraph,
    twitter: {
      card: "summary",
      title: seo.title,
      description: seo.description,
    },
  };

  if (seo.canonical) {
    metadata.alternates = { canonical: seo.canonical };
    openGraph.url = seo.canonical;
  }

  if (seo.robots) metadata.robots = seo.robots;

  return metadata;
}

function romNode(rom: Rom): Record<string, unknown> {
  const download = `${SITE_ORIGIN}${rom.url}`;
  const distribution: Record<string, unknown> = {
    "@type": "DataDownload",
    contentUrl: download,
    encodingFormat: "application/zip",
  };

  if (rom.sizeBytes !== null) distribution.fileSize = rom.sizeBytes;
  if (rom.sha256) distribution.sha256 = rom.sha256;

  const node: Record<string, unknown> = {
    "@type": "SoftwareApplication",
    name: [rom.name, rom.version, rom.device].filter(Boolean).join(" "),
    applicationCategory: "MobileApplication",
    operatingSystem: "Android",
    downloadUrl: download,
    distribution,
  };

  if (rom.version) node.softwareVersion = rom.version;
  if (rom.builtAt) node.datePublished = rom.builtAt;

  return node;
}

function websiteNode(): Record<string, unknown> {
  return {
    "@type": "WebSite",
    "@id": `${SITE_ORIGIN}/#website`,
    url: `${SITE_ORIGIN}/`,
    name: SITE.name,
    description: SITE.description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_ORIGIN}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function catalogJsonLd(input: {
  rows: readonly Rom[];
  website: boolean;
}): Record<string, unknown> | null {
  const graph: Record<string, unknown>[] = [];

  if (input.website) graph.push(websiteNode());

  if (input.rows.length > 0) {
    graph.push({
      "@type": "ItemList",
      numberOfItems: input.rows.length,
      itemListElement: input.rows.map((rom, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: romNode(rom),
      })),
    });
  }

  if (graph.length === 0) return null;

  return { "@context": "https://schema.org", "@graph": graph };
}
