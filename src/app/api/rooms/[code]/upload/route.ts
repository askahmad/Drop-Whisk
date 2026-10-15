// POST /api/rooms/[code]/upload — multipart/form-data field "file" (+ optional deviceName, socketId).
// Writes the file to STORAGE_ROOT, inserts a File row, returns { file: FileMeta }.
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { STORAGE_ROOT, MAX_FILE_SIZE } from "@/lib/config";
import { detectFileKind } from "@/lib/file-utils";
import type { FileMeta } from "@/lib/types";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Strip control chars / quotes / path separators for use in Content-Disposition.
function sanitizeForHeader(name: string): string {
  return (name || "")
    .replace(/[\r\n\t]/g, " ")
    .replace(/"/g, "'")
    .replace(/[\\]/g, "_")
    .slice(0, 200);
}

// Keep only safe-ish filename chars for the on-disk stored filename.
function sanitizeForDisk(name: string): string {
  const base = (name || "").replace(/[\\/:*?"<>|\x00-\x1f]/g, "_").trim();
  return base.length ? base.slice(0, 200) : "file";
}

function extOf(name: string): string {
  const idx = name.lastIndexOf(".");
  if (idx < 0) return "";
  return name.slice(idx);
}

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

export async function POST(request: NextRequest, ctx: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await ctx.params;
    const room = await db.room.findUnique({
      where: { code: code.toUpperCase() },
      select: { id: true, expiresAt: true },
    });
    if (!room || room.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const fileField = formData.get("file");
    if (!fileField || !(fileField instanceof File)) {
      return NextResponse.json({ error: "Missing 'file' field" }, { status: 400 });
    }

    if (fileField.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large", max: MAX_FILE_SIZE },
        { status: 413 },
      );
    }

    const originalName = fileField.name || "file";
    const safeBase = sanitizeForDisk(originalName);
    const ext = extOf(originalName);
    const storedName = `${randomUUID()}${ext}`;
    const filePath = path.join(STORAGE_ROOT, storedName);

    await fs.mkdir(STORAGE_ROOT, { recursive: true });
    const buffer = Buffer.from(await fileField.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const mimeType = fileField.type && fileField.type.length > 0
      ? fileField.type
      : "application/octet-stream";
    const kind = detectFileKind(mimeType, originalName);

    const deviceNameRaw = formData.get("deviceName");
    const deviceName =
      deviceNameRaw && typeof deviceNameRaw === "string"
        ? deviceNameRaw.slice(0, 80)
        : null;

    const row = await db.file.create({
      data: {
        roomId: room.id,
        name: storedName,
        originalName: safeBase,
        size: Number(fileField.size),
        mimeType,
        kind,
        deviceName,
      },
    });

    return NextResponse.json({ file: toFileMeta(row) }, { status: 201 });
  } catch (err: unknown) {
    console.error("[api/rooms/[code]/upload POST]", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 },
    );
  }
}

// Export the sanitizer so other routes can reuse it if needed.
export const _internal = { sanitizeForHeader };
