import { NextRequest, NextResponse } from "next/server";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

export async function POST(request: NextRequest) {
  const { apiKey } = await request.json();

  if (apiKey === ADMIN_API_KEY) {
    return NextResponse.json({ message: "Authentication successful" });
  } else {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 },
    );
  }
}
