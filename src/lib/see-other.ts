import { NextResponse } from "next/server";
import { CONFIGURED_ORIGIN } from "@/lib/site";

export function seeOther(
  request: Request,
  path: string,
  params: Record<string, string>,
  headers?: Record<string, string>,
): NextResponse {
  const url = new URL(path, CONFIGURED_ORIGIN ?? request.url);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = NextResponse.redirect(url, 303);
  for (const [key, value] of Object.entries(headers ?? {})) {
    response.headers.set(key, value);
  }

  return response;
}
