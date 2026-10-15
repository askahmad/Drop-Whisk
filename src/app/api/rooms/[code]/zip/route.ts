// GET /api/rooms/[code]/zip — stream a zip of all files in the room.
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { STORAGE_ROOT } from "@/lib/config";
import { ZipArchive } from "archiver";
import { createReadStream } from "fs";
import { promises as fs } from "fs";
import path from "path";
import { PassThrough, Readable } from "stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await ctx.params;
    const room = await db.room.findUnique({
      where: { code: code.toUpperCase() },
      select: { id: true, expiresAt: true, code: true },
    });

    if (!room || room.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const files = await db.file.findMany({
      where: { roomId: room.id },
      orderBy: { createdAt: "desc" },
    });

    const archive = new ZipArchive({ zlib: { level: 5 } });
    const passThrough = new PassThrough();
    passThrough.setMaxListeners(0);

    archive.on("error", (err) => {
      console.error("[api/rooms/[code]/zip] archive error", err);
      passThrough.destroy(err);
    });
    archive.on("warning", (err) => {
      console.warn("[api/rooms/[code]/zip] archive warning", err);
    });

    archive.pipe(passThrough);

    // Convert the Node stream -> Web ReadableStream so we can pass it to `new Response`.
    const webStream = Readable.toWeb(passThrough) as unknown as ReadableStream<Uint8Array>;

    const headers = new Headers();
    headers.set("Content-Type", "application/zip");
    headers.set(
      "Content-Disposition",
      `attachment; filename="swiftdrop-${room.code}.zip"`,
    );
    headers.set("Cache-Control", "no-store");

    // Append each file. Handle name collisions by appending " (n)".
    const usedNames = new Map<string, number>();
    for (const file of files) {
      const filePath = path.join(STORAGE_ROOT, file.name);
      let exists = false;
      try {
        await fs.access(filePath);
        exists = true;
      } catch {
        exists = false;
      }
      if (!exists) continue;

      let outName = file.originalName || file.name;
      const seen = usedNames.get(outName) ?? 0;
      if (seen > 0) {
        const dot = outName.lastIndexOf(".");
        if (dot > 0) {
          outName = `${outName.slice(0, dot)} (${seen})${outName.slice(dot)}`;
        } else {
          outName = `${outName} (${seen})`;
        }
      }
      usedNames.set(file.originalName || file.name, seen + 1);

      try {
        archive.append(createReadStream(filePath), { name: outName });
      } catch (err) {
        console.error(
          "[api/rooms/[code]/zip] append failed for",
          file.name,
          err,
        );
      }
    }

    // Finalize asynchronously — the archive will write data + end into passThrough,
    // which flows through the web stream into the Response.
    archive.finalize().catch((err: unknown) => {
      console.error("[api/rooms/[code]/zip] finalize failed", err);
      passThrough.destroy(err instanceof Error ? err : new Error(String(err)));
    });

    return new Response(webStream, { status: 200, headers });
  } catch (err: unknown) {
    console.error("[api/rooms/[code]/zip GET]", err);
    return NextResponse.json(
      { error: "Failed to stream zip" },
      { status: 500 },
    );
  }
}
