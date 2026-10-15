# Task ID 2 — full-stack-developer (backend) work record

## What I did
Built the entire SwiftDrop backend: the Socket.io real-time mini-service (port 3003)
and all 9 Next.js API routes (App Router, `runtime = "nodejs"`).

## Files created (full paths)
### Mini-service (own project)
- `/home/z/my-project/mini-services/share-service/package.json`
- `/home/z/my-project/mini-services/share-service/index.ts`

### Next.js API routes
- `/home/z/my-project/src/app/api/health/route.ts`
- `/home/z/my-project/src/app/api/rooms/route.ts`
- `/home/z/my-project/src/app/api/rooms/[code]/route.ts`
- `/home/z/my-project/src/app/api/rooms/[code]/devices/route.ts`
- `/home/z/my-project/src/app/api/rooms/[code]/upload/route.ts`
- `/home/z/my-project/src/app/api/rooms/[code]/files/route.ts`
- `/home/z/my-project/src/app/api/rooms/[code]/zip/route.ts`
- `/home/z/my-project/src/app/api/rooms/[code]/texts/route.ts`
- `/home/z/my-project/src/app/api/files/[id]/route.ts`

## Notes / deviations
- `archiver` v8 is pure ESM with **named exports only** (no default export).
  Used `import { ZipArchive } from "archiver"` instead of `import archiver from "archiver"`.
- Mini-service port `3003` is hard-coded in `index.ts` (matches `SHARE_SERVICE_PORT` in
  `src/lib/config.ts`) — the mini-service does NOT import from `@/lib/*` so it stays a
  self-contained bun project (per the contract).
- The mini-service is started as a proper daemon via `start-stop-daemon` (reparented to
  init / tini, PID reparented to 1) — it survives across bash sessions.
  - PID file: `/tmp/share-service.pid`
  - Log file: `/tmp/share-service.log`
  - Launch wrapper: `/tmp/share-service-launch.sh`
- The mini-service listens on `0.0.0.0:3003` (all interfaces) with full
  `uncaughtException` / `unhandledRejection` handlers so it can't crash silently.
- `send_text` and `send_file_signal` echo back to the sender too (so all clients,
  including the originator, can take the same code path); all other events are
  broadcast-only as specified.
- File upload uses `await file.arrayBuffer()` + `fs.promises.writeFile` (Buffer).
  For 500 MB files this loads the whole file into memory — acceptable for v1 but
  future work should stream.
- Zip route uses `PassThrough` between the `archiver` and `Readable.toWeb`, which
  Next.js 16 / Node Web Streams accepts as the `Response` body.
- No authorization is implemented (rooms are open per the contract).

## Verification performed
- `bun run lint` — passes (no errors in my files).
- HTTP smoke test of every REST route with curl — all returned expected status
  codes (200 / 201) and JSON shapes. Created a room, registered a device, posted
  a text, uploaded 2 files, listed files, streamed a file (download + preview),
  streamed a zip (validated with `unzip -l`), deleted a file, hit /api/health.
- End-to-end socket.io protocol test (polling transport, two clients):
  confirmed `join_ok`, `device_joined`, `text_received`, `file_uploaded`,
  `file_deleted`, and `device_left` all fire correctly with the right payloads.

## Status
- Mini-service running on port 3003 as a daemon (PID reparented to init).
- All 9 API routes live in the Next.js dev server.
- Backend ready for the frontend (Task 3) to wire up.
