import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

if (!ADMIN_API_KEY) {
  throw new Error("ADMIN_API_KEY environment variable is not set");
}

async function checkAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const token = authHeader.split(" ")[1];
  if (token !== ADMIN_API_KEY) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  return null;
}

export async function GET(request: NextRequest) {
  const authResponse = await checkAuth(request);
  if (authResponse) return authResponse;

  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "API key is required" }, { status: 400 });
  }

  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: { key: key },
      select: { id: true },
    });

    if (apiKey) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json({ valid: false });
    }
  } catch (error) {
    console.error("Error verifying API key:", error);
    return NextResponse.json(
      { error: "Failed to verify API key" },
      { status: 500 },
    );
  }
}
