// GET  /api/rooms/[code]/devices — list devices registered for the room.
// POST /api/rooms/[code]/devices — body { name } -> register/upsert a device.
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import type { DeviceInfo } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toDeviceInfo(d: {
  id: string;
  name: string;
  lastSeen: Date;
}): DeviceInfo {
  return { id: d.id, name: d.name, joinedAt: d.lastSeen.toISOString() };
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

    const devices = await db.device.findMany({
      where: { roomId: room.id },
      orderBy: { lastSeen: "desc" },
    });

    return NextResponse.json({ devices: devices.map(toDeviceInfo) });
  } catch (err: unknown) {
    console.error("[api/rooms/[code]/devices GET]", err);
    return NextResponse.json(
      { error: "Failed to list devices" },
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

    let name: string | undefined;
    try {
      const body = await request.json();
      if (body && typeof body.name === "string") {
        name = body.name.trim();
      }
    } catch {
      // fall through to 400
    }

    if (!name) {
      return NextResponse.json(
        { error: "Device name is required" },
        { status: 400 },
      );
    }
    if (name.length > 80) name = name.slice(0, 80);

    // Upsert: if a device with the same name already exists in this room, refresh its lastSeen.
    const existing = await db.device.findFirst({
      where: { roomId: room.id, name },
      select: { id: true },
    });

    let device;
    if (existing) {
      device = await db.device.update({
        where: { id: existing.id },
        data: { lastSeen: new Date() },
      });
    } else {
      device = await db.device.create({
        data: { roomId: room.id, name, lastSeen: new Date() },
      });
    }

    return NextResponse.json(
      { device: toDeviceInfo(device) },
      { status: 201 },
    );
  } catch (err: unknown) {
    console.error("[api/rooms/[code]/devices POST]", err);
    return NextResponse.json(
      { error: "Failed to register device" },
      { status: 500 },
    );
  }
}
