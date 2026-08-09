import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Get maintenance mode from header or env
  const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
  const reasonForMaintenance =
    process.env.NEXT_PUBLIC_REASON_FOR_MAINTENANCE || "";

  // Add maintenance info to headers
  const headers = new Headers();
  headers.set("x-maintenance-mode", String(maintenanceMode));
  headers.set("x-maintenance-reason", reasonForMaintenance);

  if (maintenanceMode && request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json(
      {
        error: `Service is currently undergoing maintenance. Reason: ${reasonForMaintenance}`,
      },
      {
        status: 503,
        headers: headers,
      },
    );
  }

  // Add headers to the response
  const response = NextResponse.next();
  response.headers.set("x-maintenance-mode", String(maintenanceMode));
  response.headers.set("x-maintenance-reason", reasonForMaintenance);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
