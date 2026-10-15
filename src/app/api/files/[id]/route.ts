// GET    /api/files/[id]            — stream the file for download (?preview=1 -> inline)
// DELETE /api/files/[id]            — delete file row + remove from disk
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { STORAGE_ROOT } from "@/lib/config";
import { promises as fs } from "fs";
import { createReadStream } from "fs";
import path from "path";
import { Readable } from "stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeForHeader(name: string): string {
  return (name || "")
    .replace(/[\r\n\t]/g, " ")
    .replace(/"/g, "'")
    .replace(/[\\]/g, "_")
    .slice(0, 200);
}

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const file = await db.file.findUnique({ where: { id } });
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const filePath = path.join(STORAGE_ROOT, file.name);
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: "File missing on disk" },
        { status: 404 },
      );
    }

    const preview = request.nextUrl.searchParams.get("preview") === "1";
    const disposition = preview ? "inline" : "attachment";
    const filename = sanitizeForHeader(file.originalName);
    const stat = await fs.stat(filePath);

    const nodeStream = createReadStream(filePath);
    const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream;

    const headers = new Headers();
    headers.set("Content-Type", file.mimeType || "application/octet-stream");
    headers.set("Content-Length", String(stat.size));
    headers.set(
      "Content-Disposition",
      `${disposition}; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(file.originalName)}`,
    );
    headers.set("Cache-Control", "no-store");
    headers.set("X-Content-Type-Options", "nosniff");

    // 206 partial-content support would require range parsing — out of scope for v1.
    return new Response(webStream, { status: 200, headers });
  } catch (err: unknown) {
    console.error("[api/files/[id] GET]", err);
    return NextResponse.json(
      { error: "Failed to stream file" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const file = await db.file.findUnique({ where: { id } });
    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Best-effort disk delete; ignore errors if the file is already gone.
    const filePath = path.join(STORAGE_ROOT, file.name);
    try {
      await fs.unlink(filePath);
    } catch (err: unknown) {
      // swallow — still delete the DB row
      const msg = err instanceof Error ? err.message : String(err);
      if (!/ENOENT/i.test(msg)) {
        console.warn("[api/files/[id] DELETE] disk unlink warning:", msg);
      }
    }

    await db.file.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("[api/files/[id] DELETE]", err);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}
