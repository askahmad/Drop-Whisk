// GET /api/rooms/[code]/files — list files for a room, newest first.
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import type { FileMeta } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toFileMeta(row: {
  id: string;
  roomId: string;
  name: string;
  originalName: string;
  size: number;
  mimeType: string;
  kind: string;
  deviceName: string | null;
  createdAt: Date;
}): FileMeta {
  return {
    id: row.id,
    roomId: row.roomId,
    name: row.name,
    originalName: row.originalName,
    size: row.size,
    mimeType: row.mimeType,
    kind: row.kind as FileMeta["kind"],
    deviceName: row.deviceName,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await ctx.params;
    const room = await db.room.findUnique({
      where: { code: code.toUpperCase() },
      select: { id: true, expiresAt: true },
    });

    if (!room || room.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const rows = await db.file.findMany({
      where: { roomId: room.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ files: rows.map(toFileMeta) });
  } catch (err: unknown) {
    console.error("[api/rooms/[code]/files GET]", err);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 },
    );
  }
}
