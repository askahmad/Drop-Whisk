'use client'

import type {
  DeviceInfo,
  FileMeta,
  RoomInfo,
  TextSnippet,
} from '@/lib/types'

/** Create a new room. Returns RoomInfo. */
export async function createRoomApi(name?: string): Promise<RoomInfo> {
  const res = await fetch('/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name?.trim() || undefined }),
  })
  if (!res.ok) throw new Error('Failed to create room')
  return res.json()
}

/** Look up a room by code. Returns null if not found / expired. */
export async function getRoomApi(code: string): Promise<RoomInfo | null> {
  const res = await fetch(`/api/rooms/${encodeURIComponent(code.toUpperCase())}`, {
    cache: 'no-store',
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to fetch room')
  return res.json()
}

/** Register a device name for a room (used for display in the device list). */
export async function registerDeviceApi(
  code: string,
  name: string,
): Promise<DeviceInfo | null> {
  const res = await fetch(`/api/rooms/${encodeURIComponent(code)}/devices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.device ?? null
}

/** Fetch the list of files for a room. */
export async function getFilesApi(code: string): Promise<FileMeta[]> {
  const res = await fetch(`/api/rooms/${encodeURIComponent(code)}/files`, {
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.files ?? []
}

/** Fetch the list of text snippets for a room. */
export async function getTextsApi(code: string): Promise<TextSnippet[]> {
  const res = await fetch(`/api/rooms/${encodeURIComponent(code)}/texts`, {
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.texts ?? []
}

/**
 * Upload a single file to a room with progress tracking.
 * Emits `onDone(file)` with the server's FileMeta, or `onError(err)`.
 */
export function uploadFileApi(
  code: string,
  file: File,
  deviceName: string,
  onProgress: (pct: number) => void,
): Promise<FileMeta> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const fd = new FormData()
    fd.append('file', file)
    fd.append('deviceName', deviceName)

    xhr.open('POST', `/api/rooms/${encodeURIComponent(code)}/upload`)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText)
        if (xhr.status >= 200 && xhr.status < 300 && data.file) {
          resolve(data.file as FileMeta)
        } else {
          reject(new Error(data?.error || `Upload failed (${xhr.status})`))
        }
      } catch {
        reject(new Error('Upload failed (invalid response)'))
      }
    }

    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.onabort = () => reject(new Error('Upload aborted'))

    xhr.send(fd)
  })
}

/** Delete a file by id. */
export async function deleteFileApi(fileId: string): Promise<boolean> {
  const res = await fetch(`/api/files/${fileId}`, { method: 'DELETE' })
  return res.ok
}

/** Persist a text snippet to the room. Returns the created snippet. */
export async function sendTextApi(
  code: string,
  content: string,
  deviceName: string,
): Promise<TextSnippet | null> {
  const res = await fetch(`/api/rooms/${encodeURIComponent(code)}/texts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, deviceName }),
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.text ?? null
}

/** Relative URL for downloading a zip of all room files. */
export function roomZipUrl(code: string): string {
  return `/api/rooms/${encodeURIComponent(code)}/zip`
}

/** Relative URL for downloading a single file. */
export function fileDownloadUrlApi(fileId: string): string {
  return `/api/files/${fileId}`
}

/** Relative URL for previewing a file inline. */
export function filePreviewUrlApi(fileId: string): string {
  return `/api/files/${fileId}?preview=1`
}
