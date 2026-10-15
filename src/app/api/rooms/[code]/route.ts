// GET /api/rooms/[code] — lookup room by code (404 if missing or expired).
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import type { RoomInfo } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await ctx.params;
    if (!code) {
      return NextResponse.json({ error: "Missing room code" }, { status: 400 });
    }

    const room = await db.room.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    if (room.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "Room expired" }, { status: 404 });
    }

    const agg = await db.file.aggregate({
      where: { roomId: room.id },
      _sum: { size: true },
      _count: { _all: true },
    });

    const info: RoomInfo = {
      id: room.id,
      code: room.code,
      name: room.name,
      createdAt: room.createdAt.toISOString(),
      expiresAt: room.expiresAt.toISOString(),
      fileCount: agg._count._all ?? 0,
      totalSize: agg._sum.size ?? 0,
    };

    return NextResponse.json(info);
  } catch (err: unknown) {
    console.error("[api/rooms/[code] GET]", err);
    return NextResponse.json(
      { error: "Failed to load room" },
      { status: 500 },
    );
  }
}
