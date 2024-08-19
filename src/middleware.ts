import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const maintenanceMode = process.env.MAINTENANCE_MODE === "true";
  const reasonForMaintenance = process.env.REASON_FOR_MAINTENANCE || "";

  if (maintenanceMode && request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.json(
      {
        error: `Service is currently undergoing maintenance. Reason for maintenance: ${reasonForMaintenance}`,
      },
      { status: 503 },
    );
  }

  return NextResponse.next();
}
