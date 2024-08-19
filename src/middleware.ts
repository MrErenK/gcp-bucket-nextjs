import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const maintenanceMode = process.env.MAINTENANCE_MODE === "true";

  if (maintenanceMode) {
    if (request.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "Service is currently undergoing maintenance" },
        { status: 503 },
      );
    }

    if (!request.nextUrl.pathname.startsWith("/maintenance")) {
      return NextResponse.rewrite(new URL("/maintenance", request.url));
    }
  } else {
    // Prevent access to /maintenance when maintenance mode is off
    if (request.nextUrl.pathname.startsWith("/maintenance")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
