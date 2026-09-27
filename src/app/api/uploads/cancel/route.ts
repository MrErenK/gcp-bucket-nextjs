import { cancelJob } from "@/lib/jobs";
import { clientAddress } from "@/lib/rate-limit";
import { seeOther } from "@/lib/see-other";

export async function POST(request: Request) {
  const form = await request.formData();
  const id = String(form.get("id") ?? "").trim();

  const canceled = cancelJob(id, clientAddress(request.headers));
  if (!canceled.ok) {
    return seeOther(request, "/upload", { error: canceled.error });
  }

  return seeOther(request, "/upload", { job: id });
}
