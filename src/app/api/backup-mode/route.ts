import { NextResponse } from "next/server";
import { headers } from "next/headers";

let isBackupMode = process.env.BACKUP_MODE === "true";

const API_SECRET = process.env.API_SECRET;

export async function GET() {
  return NextResponse.json({ isBackupMode });
}

export async function POST(request: Request) {
  const headersList = headers();
  const apiKey = headersList.get("x-api-key");

  if (apiKey !== API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  isBackupMode = body.isBackupMode;

  return NextResponse.json({ success: true, isBackupMode });
}
