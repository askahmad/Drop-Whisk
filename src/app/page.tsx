'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/share/header'
import { Footer } from '@/components/share/footer'
import { Landing } from '@/components/share/landing'
import { RoomView } from '@/components/share/room-view'
import { useShareStore } from '@/lib/store'
import { getRoomApi, registerDeviceApi } from '@/lib/api'
import { generateDeviceName } from '@/lib/file-utils'
import { toast } from 'sonner'

function HomeContent() {
  const searchParams = useSearchParams()
  const room = useShareStore((s) => s.room)
  // Use a ref (not state) for the "already tried" guard — no re-render needed.
  const triedRef = useRef(false)

  // Auto-join from a `?room=CODE` link (e.g. scanned from a QR code).
  const roomParam = searchParams.get('room')?.toUpperCase().slice(0, 6)

  useEffect(() => {
    if (triedRef.current || room || !roomParam) return
    triedRef.current = true

    let cancelled = false
    const tryAutoJoin = async () => {
      const { setRoom, setDeviceName, setSelfDeviceId } =
        useShareStore.getState()
      try {
        const found = await getRoomApi(roomParam)
        if (!found) {
          toast.error('Room not found', {
            description: `No room matches code ${roomParam}`,
          })
          return
        }
        const name =
          useShareStore.getState().deviceName || generateDeviceName()
        if (!useShareStore.getState().deviceName) setDeviceName(name)
        setRoom(found)
        try {
          const dev = await registerDeviceApi(found.code, name)
          if (dev) setSelfDeviceId(dev.id)
        } catch {
          /* non-fatal */
        }
        if (!cancelled) toast.success(`Joined room ${found.code}`)
      } catch {
        if (!cancelled) toast.error('Could not join room')
      }
    }

    tryAutoJoin()
    return () => {
      cancelled = true
    }
  }, [roomParam, room])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {room ? <RoomView /> : <Landing />}
      </main>
      <Footer />
    </div>
  )
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </main>
          <Footer />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  )
}
