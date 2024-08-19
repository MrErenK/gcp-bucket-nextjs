import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

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
  const prisma = await getPrisma();
  const authResponse = await checkAuth(request);
  if (authResponse) return authResponse;

  try {
    const keys = await prisma.apiKey.findMany({
      select: { id: true, description: true, key: true },
    });
    return NextResponse.json({ keys });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const prisma = await getPrisma();
  const authResponse = await checkAuth(request);
  if (authResponse) return authResponse;

  try {
    const { description } = await request.json();

    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 },
      );
    }

    const newKey = await prisma.apiKey.create({
      data: {
        description,
        key: `key_${uuidv4()}`, // Prefix with 'key_' to ensure it's a string
      },
    });

    return NextResponse.json(
      {
        key: {
          id: newKey.id,
          description: newKey.description,
          key: newKey.key,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const prisma = await getPrisma();
  const authResponse = await checkAuth(request);
  if (authResponse) return authResponse;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "API key ID is required" },
      { status: 400 },
    );
  }

  try {
    await prisma.apiKey.delete({
      where: { id },
    });
    return NextResponse.json({ message: "API key deleted successfully" });
  } catch (error) {
    console.error("Error deleting API key:", error);
    if ((error as any).code === "P2025") {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 },
    );
  }
}
