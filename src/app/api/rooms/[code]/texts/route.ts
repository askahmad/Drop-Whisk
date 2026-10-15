// GET  /api/rooms/[code]/texts — list text snippets for a room, newest first.
// POST /api/rooms/[code]/texts — body { content, deviceName } -> persist a snippet.
//
// Note on realtime:
//   The frontend POSTs to this route to persist the canonical copy, AND emits
//   `send_text` via socket.io to broadcast the snippet in realtime. Both paths are
//   required because the socket broadcast is ephemeral (no DB write) and the REST
//   write is the source of truth (so refreshing the page shows the snippet).
//   The TextSnippet.id returned here is the canonical id; the socket broadcast uses
//   a separate randomUUID on the mini-service — the frontend dedupes by content+createdAt
//   or just refetches the REST list after handling text_received.
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import type { TextSnippet } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toText(row: {
  id: string;
  roomId: string;
  content: string;
  deviceName: string | null;
  createdAt: Date;
}): TextSnippet {
  return {
    id: row.id,
    roomId: row.roomId,
    content: row.content,
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

    const rows = await db.textSnippet.findMany({
      where: { roomId: room.id },
      orderBy: { createdAt: "desc" },
      take: 500, // safety cap
    });

    return NextResponse.json({ texts: rows.map(toText) });
  } catch (err: unknown) {
    console.error("[api/rooms/[code]/texts GET]", err);
    return NextResponse.json(
      { error: "Failed to list texts" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
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

    let content: string | undefined;
    let deviceName: string | null = null;
    try {
      const body = await request.json();
      if (body && typeof body.content === "string") {
        content = body.content;
      }
      if (body && typeof body.deviceName === "string") {
        deviceName = body.deviceName.trim().slice(0, 80) || null;
      }
    } catch {
      // fall through
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    // Cap content length to keep the SQLite column small.
    const trimmed = content.length > 50_000 ? content.slice(0, 50_000) : content;

    const row = await db.textSnippet.create({
      data: {
        roomId: room.id,
        content: trimmed,
        deviceName,
      },
    });

    return NextResponse.json({ text: toText(row) }, { status: 201 });
  } catch (err: unknown) {
    console.error("[api/rooms/[code]/texts POST]", err);
    return NextResponse.json(
      { error: "Failed to save text" },
      { status: 500 },
    );
  }
}
