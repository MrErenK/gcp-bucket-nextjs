import { after } from "next/server";
import { formatDuration } from "@/lib/format";
import { pump, queueJob } from "@/lib/jobs";
import { clientAddress, refund, take } from "@/lib/rate-limit";
import { seeOther } from "@/lib/see-other";
import { RATE_LIMIT, RATE_WINDOW_MS } from "@/lib/upload-config";

export const maxDuration = 900;

export async function POST(request: Request) {
  const form = await request.formData();
  const url = String(form.get("url") ?? "")
    .trim()
    .slice(0, 2048);

  if (!url) return seeOther(request, "/upload", { error: "a link is required" });

  const address = clientAddress(request.headers);
  const limit = take(address, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.ok) {
    return seeOther(
      request,
      "/upload",
      {
        error: `too many uploads from this address -- try again in ${formatDuration(
          limit.retryAfterMs,
        )}`,
      },
      { "retry-after": String(Math.ceil(limit.retryAfterMs / 1000)) },
    );
  }

  const queued = await queueJob({ url, address });
  if (!queued.ok) {
    refund(address);
    return seeOther(request, "/upload", { error: queued.error });
  }

  after(pump);

  return seeOther(request, "/upload", { job: queued.id });
}
