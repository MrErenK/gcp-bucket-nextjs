import type { JobView } from "@/lib/job-view";

export const TYPE_SCALE: ReadonlyArray<{
  cls: string;
  px: string;
  use: string;
  sample: string;
}> = [
  {
    cls: "text-xs",
    px: "12px",
    use: "table cells, metadata, labels",
    sample: "the quick brown fox jumps over the lazy dog",
  },
  {
    cls: "text-sm",
    px: "14px",
    use: "body default",
    sample: "the quick brown fox jumps over the lazy dog",
  },
  {
    cls: "text-base",
    px: "16px",
    use: "panel titles, strong copy",
    sample: "The quick brown fox",
  },
  {
    cls: "text-lg",
    px: "18px",
    use: "masthead, section titles",
    sample: "THE QUICK BROWN FOX",
  },
];

export const PALETTE: ReadonlyArray<{
  token: string;
  cls: string;
  light: string;
  dark: string;
  role: string;
}> = [
  { token: "--bg", cls: "bg-background", light: "#ffffff", dark: "#000000", role: "page ground" },
  { token: "--bg-subtle", cls: "bg-surface", light: "#fafafa", dark: "#0a0a0a", role: "panel inset, zebra" },
  { token: "--fg", cls: "bg-foreground", light: "#000000", dark: "#ffffff", role: "primary text" },
  { token: "--fg-muted", cls: "bg-muted", light: "#737373", dark: "#a3a3a3", role: "metadata, units" },
  { token: "--fg-muted-strong", cls: "bg-muted-strong", light: "#525252", dark: "#d4d4d4", role: "secondary copy" },
  { token: "--line", cls: "bg-line", light: "#000000", dark: "#ffffff", role: "structural border" },
  { token: "--line-subtle", cls: "bg-line-subtle", light: "#e5e5e5", dark: "#262626", role: "internal divider" },
  { token: "--invert-bg", cls: "bg-invert", light: "#000000", dark: "#ffffff", role: "inverted hover, solid fill" },
  { token: "--invert-fg", cls: "bg-invert-foreground", light: "#ffffff", dark: "#000000", role: "text on inverted" },
];

export const ARTIFACTS: ReadonlyArray<{
  id: string;
  name: string;
  size: string;
  checksum: string;
  state: "on" | "off" | "partial";
  label: string;
}> = [
  { id: "0001", name: "core.bin", size: "4.2 MB", checksum: "a1b2c3d4", state: "on", label: "verified" },
  { id: "0002", name: "assets.pak", size: "18.7 MB", checksum: "e5f6a7b8", state: "on", label: "verified" },
  { id: "0003", name: "audio.rom", size: "1.1 MB", checksum: "c9d0e1f2", state: "partial", label: "staged" },
  { id: "0004", name: "manual.pdf", size: "880 KB", checksum: "3a4b5c6d", state: "off", label: "missing" },
];

export const ACCENTS: ReadonlyArray<{ glyph: string; use: string }> = [
  { glyph: "->", use: "navigation, forward action" },
  { glyph: "::", use: "label / value separator" },
  { glyph: "[x]", use: "enabled, verified, done" },
  { glyph: "[ ]", use: "disabled, pending" },
  { glyph: "[~]", use: "partial, in progress" },
  { glyph: "[!]", use: "failed, refused, broken" },
  { glyph: "[-]", use: "canceled, withdrawn" },
  { glyph: "[view]", use: "bracketed action link" },
  { glyph: "---", use: "horizontal rule" },
  { glyph: "|", use: "column separator" },
  { glyph: "#", use: "index, count, comment" },
];

function jobState(over: Partial<JobView>): JobView {
  return {
    id: "00000000",
    host: "mirror.invalid",
    file: null,
    state: "queued",
    received: 0,
    total: null,
    bytes: null,
    sha256: null,
    error: null,
    queuedAt: 0,
    startedAt: null,
    endedAt: null,
    position: null,
    mine: true,
    ...over,
  };
}

export const JOB_STATES: ReadonlyArray<JobView> = [
  jobState({
    id: "1a2b3c4d",
    host: "dl.mirror.invalid",
    file: "lineage-22.0-20260927-nightly.zip",
    position: 2,
  }),
  jobState({
    id: "5e6f7a8b",
    host: "mirror.invalid",
    file: "lineage-22.0-20260927-nightly.zip",
    state: "fetching",
    received: 412_549_120,
    total: 1_073_741_824,
  }),
  jobState({
    id: "9c0d1e2f",
    host: "dl.mirror.invalid",
    file: "lineage-22.0-20260927-nightly.zip",
    state: "done",
    received: 1_073_741_824,
    total: 1_073_741_824,
    bytes: 1_073_741_824,
    sha256:
      "9f2c41d7a8b35e60c1f4a2b7d90e3c58a1b6d24f8e07c39a5d1b6e840c2f7a91",
    endedAt: 0,
  }),
  jobState({
    id: "3b4c5d6e",
    host: "files.invalid",
    state: "failed",
    error: "the link did not return a zip archive",
    endedAt: 0,
  }),
  jobState({
    id: "7f8a9b0c",
    host: "dl.mirror.invalid",
    file: "lineage-22.0-20260927-nightly.zip",
    state: "canceled",
    received: 268_435_456,
    total: 1_073_741_824,
    endedAt: 0,
  }),
];

export const COMPLIANCE: ReadonlyArray<{
  state: "on" | "off" | "partial";
  rule: string;
}> = [
  { state: "on", rule: "zero border-radius - radius tokens pinned to 0px" },
  { state: "on", rule: "monospace everywhere - font-sans also resolves to mono" },
  { state: "on", rule: "no box-shadow, blur, or gradient - enforced in base layer" },
  { state: "on", rule: "duotone palette - colour enters only as inversion" },
  { state: "on", rule: "border-collapse + per-cell dividers on all tables" },
  { state: "on", rule: "theme applied before first paint - no flash on load" },
  { state: "on", rule: "tables scroll horizontally rather than squashing" },
  { state: "off", rule: "any non-monochrome accent colour" },
];
