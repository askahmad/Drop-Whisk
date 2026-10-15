import path from "path"

/** Absolute path to the local file storage root. */
export const STORAGE_ROOT = path.join(process.cwd(), "storage", "uploads")

/** Absolute directory used for the in-memory zip stream cache (not persisted). */
export const ROOM_CODE_LENGTH = 6

/** Default room lifetime in milliseconds (24 hours). */
export const DEFAULT_ROOM_TTL_MS = 24 * 60 * 60 * 1000

/** Max upload size per file in bytes (500 MB). */
export const MAX_FILE_SIZE = 500 * 1024 * 1024

/** Mini-service websocket port (must match mini-services/share-service). */
export const SHARE_SERVICE_PORT = 3003
