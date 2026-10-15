// Drop Whisk real-time mini-service (Socket.io) — runs on port 3003.
//
// Mirrors the example at examples/websocket/server.ts:
//   - path: '/'  (Caddy uses this to route via XTransformPort=3003)
//   - CORS: origin "*"  (any Next.js host)
//   - pingTimeout: 60000, pingInterval: 25000
//
// Protocol (see /home/z/my-project/worklog.md "Contract" section):
//   Client -> Server:
//     - join_room         { roomCode, deviceName }
//     - send_text         { roomCode, content, deviceName }
//     - send_file_signal  { roomCode, file: FileMeta }
//     - send_delete_signal { roomCode, fileId }
//   Server -> Client:
//     - join_ok          { roomCode, device, devices: DeviceInfo[] }  (to socket)
//     - device_joined    { device }                                    (to room, except sender)
//     - device_left      { deviceId }                                  (to room)
//     - text_received    { text }                                       (to room)
//     - file_uploaded    { file }                                       (to room — relayed from send_file_signal)
//     - file_deleted     { fileId }                                    (to room — relayed from send_delete_signal)
//
// Note on file broadcasting:
//   The frontend uploader POSTs the file to the Next.js /api/rooms/[code]/upload route
//   (REST), and on success the frontend then emits `send_file_signal` with the returned
//   FileMeta. This service simply relays that to the room as `file_uploaded`. This keeps
//   the upload pipeline canonical (REST persists to disk + DB) and the realtime sync
//   decoupled from the upload itself.

import { createServer } from "http";
import { Server, type Socket } from "socket.io";
import { randomUUID } from "crypto";

// Keep the mini-service self-contained — do NOT import from the parent project's
// `@/lib/*` (it's a separate bun project). The port MUST match
// SHARE_SERVICE_PORT in src/lib/config.ts.
const SHARE_SERVICE_PORT = 3003;

// --- In-memory device tracking (per room) ---
// We map socketId -> { deviceId, deviceName, roomCode } so that on disconnect we can
// broadcast `device_left` to the correct room.
interface SocketMeta {
  deviceId: string;
  deviceName: string;
  roomCode: string | null;
}

const socketMeta = new Map<string, SocketMeta>();

// Collect DeviceInfo for all sockets currently in a Socket.io room.
function devicesInRoom(io: Server, roomCode: string) {
  const room = io.sockets.adapter.rooms.get(roomCode);
  const devices: Array<{ id: string; name: string; joinedAt: string }> = [];
  if (!room) return devices;
  for (const socketId of room) {
    const meta = socketMeta.get(socketId);
    if (!meta) continue;
    devices.push({
      id: meta.deviceId,
      name: meta.deviceName,
      joinedAt: new Date().toISOString(), // best-effort timestamp
    });
  }
  return devices;
}

const httpServer = createServer();

const io = new Server(httpServer, {
  // DO NOT change the path — Caddy uses it to forward the request to the right port.
  path: "/",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

io.on("connection", (socket: Socket) => {
  console.log(`[share-service] socket connected: ${socket.id}`);

  // ---------- join_room ----------
  socket.on("join_room", (payload: { roomCode?: string; deviceName?: string }) => {
    try {
      const roomCode = payload?.roomCode;
      const deviceName = payload?.deviceName || "Anonymous";

      if (!roomCode || typeof roomCode !== "string") {
        socket.emit("error", { message: "join_room requires roomCode + deviceName" });
        return;
      }

      const deviceId = randomUUID();
      socketMeta.set(socket.id, { deviceId, deviceName, roomCode });

      socket.join(roomCode);
      socket.data = { roomCode, deviceName, deviceId };

      const device = {
        id: deviceId,
        name: deviceName,
        isSelf: true,
        joinedAt: new Date().toISOString(),
      };

      // Reply to the joiner with the current device list.
      const devices = devicesInRoom(io, roomCode).map((d) => ({
        ...d,
        isSelf: d.id === deviceId,
      }));

      socket.emit("join_ok", { roomCode, device, devices });

      // Tell everyone else in the room a new device joined.
      socket.to(roomCode).emit("device_joined", {
        device: { id: deviceId, name: deviceName, joinedAt: device.joinedAt },
      });

      console.log(
        `[share-service] join_room socket=${socket.id} room=${roomCode} device=${deviceName} online=${devices.length}`,
      );
    } catch (err) {
      console.error("[share-service] join_room error", err);
    }
  });

  // ---------- send_text ----------
  socket.on("send_text", (payload: { roomCode?: string; content?: string; deviceName?: string }) => {
    try {
      const roomCode = payload?.roomCode;
      const content = payload?.content;
      const deviceName = payload?.deviceName;

      if (!roomCode || typeof content !== "string") {
        socket.emit("error", { message: "send_text requires roomCode + content" });
        return;
      }

      const text = {
        id: randomUUID(),
        // roomId is "" on the socket — the frontend will refetch REST for the canonical list.
        roomId: "",
        content,
        deviceName: deviceName ?? null,
        createdAt: new Date().toISOString(),
      };

      // Broadcast to OTHER clients only. The sender already added the canonical
      // copy from the REST POST response (which has the DB id), so echoing back
      // here would create a duplicate with a different (socket-generated) id.
      socket.to(roomCode).emit("text_received", { text });

      console.log(
        `[share-service] send_text room=${roomCode} bytes=${content.length} from=${deviceName ?? "?"}`,
      );
    } catch (err) {
      console.error("[share-service] send_text error", err);
    }
  });

  // ---------- send_file_signal ----------
  // The frontend uploads via REST and then emits this with the resulting FileMeta.
  socket.on("send_file_signal", (payload: { roomCode?: string; file?: unknown }) => {
    try {
      const roomCode = payload?.roomCode;
      const file = payload?.file;

      if (!roomCode || !file) {
        socket.emit("error", { message: "send_file_signal requires roomCode + file" });
        return;
      }

      // Relay to OTHER clients only. The uploader already appended the file
      // locally from the REST upload response (canonical DB copy), so echoing
      // back to the sender is redundant.
      socket.to(roomCode).emit("file_uploaded", { file });

      console.log(`[share-service] send_file_signal room=${roomCode}`);
    } catch (err) {
      console.error("[share-service] send_file_signal error", err);
    }
  });

  // ---------- send_delete_signal ----------
  socket.on("send_delete_signal", (payload: { roomCode?: string; fileId?: string }) => {
    try {
      const roomCode = payload?.roomCode;
      const fileId = payload?.fileId;

      if (!roomCode || !fileId) {
        socket.emit("error", { message: "send_delete_signal requires roomCode + fileId" });
        return;
      }

      // Broadcast to OTHER clients only — the deleter already removed it locally.
      socket.to(roomCode).emit("file_deleted", { fileId });

      console.log(`[share-service] send_delete_signal room=${roomCode} file=${fileId}`);
    } catch (err) {
      console.error("[share-service] send_delete_signal error", err);
    }
  });

  // ---------- disconnect ----------
  socket.on("disconnect", () => {
    const meta = socketMeta.get(socket.id);
    socketMeta.delete(socket.id);
    if (meta && meta.roomCode && meta.deviceId) {
      socket.to(meta.roomCode).emit("device_left", { deviceId: meta.deviceId });
      console.log(
        `[share-service] disconnect socket=${socket.id} room=${meta.roomCode} device=${meta.deviceName}`,
      );
    } else {
      console.log(`[share-service] disconnect socket=${socket.id} (no room)`);
    }
  });

  socket.on("error", (err: unknown) => {
    console.error(`[share-service] socket error (${socket.id}):`, err);
  });
});

httpServer.listen(SHARE_SERVICE_PORT, "0.0.0.0", () => {
  console.log(`Share service listening on ${SHARE_SERVICE_PORT}`);
});

// Catch any errors that would otherwise crash the process silently.
process.on("uncaughtException", (err) => {
  console.error("[share-service] uncaughtException:", err);
});
process.on("unhandledRejection", (err) => {
  console.error("[share-service] unhandledRejection:", err);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`[share-service] ${signal} received, shutting down...`);
  httpServer.close(() => {
    console.log("[share-service] http server closed");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
