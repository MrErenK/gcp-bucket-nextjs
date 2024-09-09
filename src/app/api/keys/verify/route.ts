import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const prisma = await getPrisma();

  const { searchParams } = new URL(request.url);
  const userKey = searchParams.get("user_key");

  if (!userKey) {
    return NextResponse.json(
      { error: "User API key is required" },
      { status: 400 },
    );
  }

  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: { key: userKey },
      select: { id: true, description: true },
    });

    if (apiKey) {
      return NextResponse.json({
        valid: true,
        description: apiKey.description,
      });
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
