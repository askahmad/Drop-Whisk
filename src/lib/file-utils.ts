import type { FileKind } from "./types"

/** Format a byte count into a human-readable string. */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes < 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
  const value = bytes / Math.pow(k, i)
  const dp = i === 0 ? 0 : decimals
  return `${value.toFixed(dp)} ${sizes[i]}`
}

/** Detect the high-level "kind" of a file from its mime type / extension. */
export function detectFileKind(mimeType: string, fileName?: string): FileKind {
  const mime = (mimeType || "").toLowerCase()
  const ext = (fileName?.split(".").pop() || "").toLowerCase()

  if (mime.startsWith("image/")) return "image"
  if (mime.startsWith("video/")) return "video"
  if (mime.startsWith("audio/")) return "audio"

  if (
    mime === "application/pdf" ||
    mime.includes("word") ||
    mime.includes("excel") ||
    mime.includes("powerpoint") ||
    mime.includes("opendocument") ||
    mime === "text/plain" ||
    mime === "text/markdown" ||
    mime === "application/rtf" ||
    mime.startsWith("text/")
  ) {
    return "document"
  }

  const archiveExts = ["zip", "rar", "7z", "tar", "gz", "bz2", "xz"]
  if (archiveExts.includes(ext) || mime.includes("zip") || mime.includes("compressed") || mime.includes("tar")) {
    return "archive"
  }

  return "other"
}

/** Lucide icon name suggestion for a file kind (used by the UI layer). */
export function iconForKind(kind: FileKind): string {
  switch (kind) {
    case "image":
      return "image"
    case "video":
      return "film"
    case "audio":
      return "music"
    case "document":
      return "file-text"
    case "archive":
      return "file-archive"
    default:
      return "file"
  }
}

/** Build a relative download URL for a file. */
export function fileDownloadUrl(fileId: string): string {
  return `/api/files/${fileId}`
}

/** Build a relative preview URL for a file (inline content-disposition). */
export function filePreviewUrl(fileId: string): string {
  return `/api/files/${fileId}?preview=1`
}

/** Generate a random room code (uppercase alphanumeric, no ambiguous chars). */
export function generateRoomCode(length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let out = ""
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return out
}

/** Pick a friendly device name based on platform, e.g. "Windows PC", "Android Phone", "iPhone". */
export function generateDeviceName(): string {
  if (typeof window !== "undefined" && typeof navigator !== "undefined") {
    const platform = detectPlatform(navigator.userAgent)
    if (platform === "Windows") return "Windows PC"
    if (platform === "macOS") return "Mac"
    if (platform === "iOS") return "iPhone"
    if (platform === "Android") return "Android Phone"
    if (platform === "Linux") return "Linux PC"
  }
  return "My Device"
}

/** Detect the upload device's OS/platform from the user-agent. */
export function detectPlatform(ua?: string | null): string {
  if (!ua) return "Unknown"
  if (/android/i.test(ua)) return "Android"
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS"
  if (/windows/i.test(ua)) return "Windows"
  if (/mac/i.test(ua)) return "macOS"
  if (/linux/i.test(ua)) return "Linux"
  return "Unknown"
}

/** Format a relative time label like "just now", "3m ago", "2h ago". */
export function timeAgo(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 10) return "just now"
  if (sec < 60) return `${sec}s ago`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  return `${day}d ago`
}
