'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  DeviceInfo,
  FileMeta,
  RoomInfo,
  TextSnippet,
} from '@/lib/types'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

interface UploadTask {
  id: string
  name: string
  size: number
  progress: number // 0..100
  status: 'uploading' | 'done' | 'error'
  error?: string
}

interface ShareState {
  // The active room (null when on the landing screen)
  room: RoomInfo | null
  // Self device id assigned by the socket server on join
  selfDeviceId: string | null
  // Friendly device name, persisted across sessions
  deviceName: string
  // Devices currently connected to the room (including self)
  devices: DeviceInfo[]
  // Files in the room (newest first)
  files: FileMeta[]
  // Text snippets in the room (newest first)
  texts: TextSnippet[]
  // Socket connection status
  connection: ConnectionStatus
  // Per-upload progress tracking
  uploads: UploadTask[]
  // Whether the initial room data is loading
  loading: boolean

  // Actions
  setRoom: (room: RoomInfo | null) => void
  setDeviceName: (name: string) => void
  setSelfDeviceId: (id: string | null) => void
  setDevices: (devices: DeviceInfo[]) => void
  addDevice: (device: DeviceInfo) => void
  removeDevice: (deviceId: string) => void
  setFiles: (files: FileMeta[]) => void
  addFile: (file: FileMeta) => void
  removeFile: (fileId: string) => void
  setTexts: (texts: TextSnippet[]) => void
  addText: (text: TextSnippet) => void
  setConnection: (s: ConnectionStatus) => void
  setLoading: (b: boolean) => void
  startUpload: (task: UploadTask) => void
  updateUpload: (id: string, progress: number) => void
  finishUpload: (id: string) => void
  failUpload: (id: string, error: string) => void
  clearDoneUploads: () => void
  reset: () => void
}

export const useShareStore = create<ShareState>()(
  persist(
    (set) => ({
      room: null,
      selfDeviceId: null,
      deviceName: '',
      devices: [],
      files: [],
      texts: [],
      connection: 'disconnected',
      uploads: [],
      loading: false,

      setRoom: (room) => set({ room }),
      setDeviceName: (name) => set({ deviceName: name }),
      setSelfDeviceId: (id) => set({ selfDeviceId: id }),
      setDevices: (devices) => set({ devices }),
      addDevice: (device) =>
        set((s) => {
          if (s.devices.some((d) => d.id === device.id)) return s
          return { devices: [...s.devices, device] }
        }),
      removeDevice: (deviceId) =>
        set((s) => ({ devices: s.devices.filter((d) => d.id !== deviceId) })),
      setFiles: (files) =>
        set({
          files: [...files].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        }),
      addFile: (file) =>
        set((s) => {
          if (s.files.some((f) => f.id === file.id)) {
            return {
              files: s.files.map((f) => (f.id === file.id ? file : f)),
            }
          }
          return { files: [file, ...s.files] }
        }),
      removeFile: (fileId) =>
        set((s) => ({ files: s.files.filter((f) => f.id !== fileId) })),
      setTexts: (texts) =>
        set({
          texts: [...texts].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        }),
      addText: (text) =>
        set((s) => {
          if (s.texts.some((t) => t.id === text.id)) return s
          return { texts: [text, ...s.texts] }
        }),
      setConnection: (connection) => set({ connection }),
      setLoading: (loading) => set({ loading }),
      startUpload: (task) => set((s) => ({ uploads: [...s.uploads, task] })),
      updateUpload: (id, progress) =>
        set((s) => ({
          uploads: s.uploads.map((u) =>
            u.id === id ? { ...u, progress } : u,
          ),
        })),
      finishUpload: (id) =>
        set((s) => ({
          uploads: s.uploads.map((u) =>
            u.id === id ? { ...u, progress: 100, status: 'done' } : u,
          ),
        })),
      failUpload: (id, error) =>
        set((s) => ({
          uploads: s.uploads.map((u) =>
            u.id === id ? { ...u, status: 'error', error } : u,
          ),
        })),
      clearDoneUploads: () =>
        set((s) => ({ uploads: s.uploads.filter((u) => u.status === 'uploading') })),
      reset: () =>
        set({
          room: null,
          selfDeviceId: null,
          devices: [],
          files: [],
          texts: [],
          connection: 'disconnected',
          uploads: [],
          loading: false,
        }),
    }),
    {
      name: 'swiftdrop-store',
      // Persist only the friendly device name across reloads (everything else is session-scoped)
      partialize: (state) => ({ deviceName: state.deviceName }),
    },
  ),
)
