// POST /api/rooms — create a new room.
// GET  /api/rooms — 405 (not supported; rooms are looked up by code).
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { generateRoomCode } from "@/lib/file-utils";
import { DEFAULT_ROOM_TTL_MS } from "@/lib/config";
import type { RoomInfo } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    let name: string | null = null;
    try {
      const body = await request.json();
      if (body && typeof body.name === "string" && body.name.trim()) {
        name = body.name.trim().slice(0, 100);
      }
    } catch {
      // body is optional; ignore parse errors
    }

    // Retry a couple of times in case of code collision (very unlikely).
    let room: Awaited<ReturnType<typeof db.room.create>> | null = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateRoomCode();
      try {
        room = await db.room.create({
          data: {
            code,
            name,
            expiresAt: new Date(Date.now() + DEFAULT_ROOM_TTL_MS),
          },
        });
        break;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (!/unique/i.test(msg)) throw err;
      }
    }

    if (!room) {
      return NextResponse.json(
        { error: "Failed to allocate a unique room code" },
        { status: 500 },
      );
    }

    const info: RoomInfo = {
      id: room.id,
      code: room.code,
      name: room.name,
      createdAt: room.createdAt.toISOString(),
      expiresAt: room.expiresAt.toISOString(),
      fileCount: 0,
      totalSize: 0,
    };

    return NextResponse.json(info, { status: 201 });
  } catch (err: unknown) {
    console.error("[api/rooms POST]", err);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
