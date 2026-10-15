// Shared types for the Drop Whisk file-sharing app.
// These types are the single source of truth for the API contract
// and the real-time socket protocol between Next.js and the mini-service.

export type FileKind =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "archive"
  | "other"

export interface FileMeta {
  id: string
  roomId: string
  /** Stored filename on disk (cuid-based, unique). */
  name: string
  /** Original filename from the uploader. */
  originalName: string
  size: number
  mimeType: string
  kind: FileKind
  deviceName?: string | null
  createdAt: string
}

export interface TextSnippet {
  id: string
  roomId: string
  content: string
  deviceName?: string | null
  createdAt: string
}

export interface DeviceInfo {
  id: string
  name: string
  isSelf?: boolean
  joinedAt?: string
}

export interface RoomInfo {
  id: string
  code: string
  name: string | null
  createdAt: string
  expiresAt: string
  fileCount: number
  totalSize: number
}

// ---- Socket event payloads (client -> server) ----
export interface JoinRoomPayload {
  roomCode: string
  deviceName: string
}

export interface SendTextPayload {
  roomCode: string
  content: string
  deviceName: string
}

// ---- Socket event payloads (server -> client) ----
export interface JoinOkPayload {
  roomCode: string
  device: DeviceInfo
  devices: DeviceInfo[]
}

export interface FileUploadedPayload {
  file: FileMeta
}

export interface TextReceivedPayload {
  text: TextSnippet
}

export interface DeviceJoinedPayload {
  device: DeviceInfo
}

export interface DeviceLeftPayload {
  deviceId: string
}

export interface FileDeletedPayload {
  fileId: string
}
