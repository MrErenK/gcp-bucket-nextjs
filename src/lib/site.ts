const FALLBACK_ORIGIN = "http://localhost:3000";

function origin(): string {
  const configured = (process.env.SITE_URL ?? "").trim().replace(/\/+$/, "");
  if (configured) return configured;

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
