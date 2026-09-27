const FALLBACK_ORIGIN = "http://localhost:3000";

export const CONFIGURED_ORIGIN: string | null =
  (process.env.SITE_URL ?? "").trim().replace(/\/+$/, "") || null;

function origin(): string {
  if (CONFIGURED_ORIGIN) return CONFIGURED_ORIGIN;

  if (process.env.NODE_ENV === "production") {
    console.warn(
      `SITE_URL is not set -- canonical URLs fall back to ${FALLBACK_ORIGIN}`,
    );
  }

  return FALLBACK_ORIGIN;
}

export const SITE = {
  name: "Eren's bucket",
  description: "Eren's bucket - android rom archive.",
  repo: "https://github.com/MrErenK/gcp-bucket-nextjs",
  url: origin(),
} as const;
