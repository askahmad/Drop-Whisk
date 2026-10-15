'use client'

import { useEffect } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useShareStore } from '@/lib/store'
import type {
  DeviceJoinedPayload,
  DeviceLeftPayload,
  FileDeletedPayload,
  FileUploadedPayload,
  JoinOkPayload,
  TextReceivedPayload,
} from '@/lib/types'

// Module-level singleton so any component can emit events to the room.
let socket: Socket | null = null

export function getSocket(): Socket | null {
  return socket
}

function getSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL
  }
  if (typeof window !== 'undefined') {
    // If running behind Caddy gateway on port 81 (query transform proxy)
    if (window.location.port === '81') {
      return '/?XTransformPort=3003'
    }
    // Direct local / LAN dev access (e.g. phone on same WiFi)
    return `${window.location.protocol}//${window.location.hostname}:3003`
  }
  return 'http://localhost:3003'
}

function ensureSocket(roomCode: string): Socket {
  if (socket) return socket
  socket = io(getSocketUrl(), {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 1200,
    timeout: 15000,
  })
  return socket
}

function teardownSocket() {
  if (!socket) return
  socket.removeAllListeners()
  socket.disconnect()
  socket = null
}

/**
 * Connects to the Drop Whisk mini-service (Socket.io on port 3003) whenever a room is active,
 * and wires all incoming events into the zustand store.
 *
 * Should be mounted exactly once, high in the tree (page level).
 */
export function useShareRoom() {
  const room = useShareStore((s) => s.room)

  useEffect(() => {
    const code = room?.code
    if (!code) return

    const setConnection = useShareStore.getState().setConnection
    const setSelfDeviceId = useShareStore.getState().setSelfDeviceId
    const setDevices = useShareStore.getState().setDevices
    const addDevice = useShareStore.getState().addDevice
    const removeDevice = useShareStore.getState().removeDevice
    const addFile = useShareStore.getState().addFile
    const removeFile = useShareStore.getState().removeFile
    const addText = useShareStore.getState().addText

    setConnection('connecting')
    const s = ensureSocket(code)

    const handleConnect = () => {
      setConnection('connected')
      const name = useShareStore.getState().deviceName || 'Guest'
      s.emit('join_room', { roomCode: code, deviceName: name })
    }
    const handleDisconnect = () => setConnection('disconnected')
    const handleReconnecting = () => setConnection('connecting')

    const handleJoinOk = (payload: JoinOkPayload) => {
      if (!payload) return
      setSelfDeviceId(payload.device?.id ?? null)
      setDevices(
        (payload.devices ?? []).map((d) => ({
          ...d,
          isSelf: d.id === payload.device?.id,
        })),
      )
    }
    const handleDeviceJoined = (payload: DeviceJoinedPayload) => {
      if (!payload?.device) return
      addDevice({
        ...payload.device,
        isSelf: payload.device.id === useShareStore.getState().selfDeviceId,
      })
    }
    const handleDeviceLeft = (payload: DeviceLeftPayload) => {
      if (payload?.deviceId) removeDevice(payload.deviceId)
    }
    const handleFileUploaded = (payload: FileUploadedPayload) => {
      if (payload?.file) addFile(payload.file)
    }
    const handleFileDeleted = (payload: FileDeletedPayload) => {
      if (payload?.fileId) removeFile(payload.fileId)
    }
    const handleTextReceived = (payload: TextReceivedPayload) => {
      if (payload?.text) addText(payload.text)
    }

    s.on('connect', handleConnect)
    s.on('disconnect', handleDisconnect)
    s.on('reconnect_attempt', handleReconnecting)
    s.on('connect_error', handleReconnecting)
    s.on('join_ok', handleJoinOk)
    s.on('device_joined', handleDeviceJoined)
    s.on('device_left', handleDeviceLeft)
    s.on('file_uploaded', handleFileUploaded)
    s.on('file_deleted', handleFileDeleted)
    s.on('text_received', handleTextReceived)

    if (s.connected) {
      // Already connected (e.g. HMR) — fire join immediately.
      handleConnect()
    }

    return () => {
      s.off('connect', handleConnect)
      s.off('disconnect', handleDisconnect)
      s.off('reconnect_attempt', handleReconnecting)
      s.off('connect_error', handleReconnecting)
      s.off('join_ok', handleJoinOk)
      s.off('device_joined', handleDeviceJoined)
      s.off('device_left', handleDeviceLeft)
      s.off('file_uploaded', handleFileUploaded)
      s.off('file_deleted', handleFileDeleted)
      s.off('text_received', handleTextReceived)
      teardownSocket()
      setConnection('disconnected')
    }
     
  }, [room?.code])
}

/* ---- Helpers for emitting events from anywhere ---- */

export function emitFileUploaded(roomCode: string, file: unknown) {
  getSocket()?.emit('send_file_signal', { roomCode, file })
}

export function emitFileDeleted(roomCode: string, fileId: string) {
  getSocket()?.emit('send_delete_signal', { roomCode, fileId })
}

export function emitText(roomCode: string, content: string, deviceName: string) {
  getSocket()?.emit('send_text', { roomCode, content, deviceName })
}
