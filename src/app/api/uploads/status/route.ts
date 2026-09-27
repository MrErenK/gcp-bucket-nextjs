import { NextResponse } from "next/server";
import { jobFeed } from "@/lib/jobs";
import { clientAddress } from "@/lib/rate-limit";

export async function GET(request: Request) {
  return NextResponse.json(await jobFeed(clientAddress(request.headers)), {
    headers: { "cache-control": "no-store" },
  });
}
