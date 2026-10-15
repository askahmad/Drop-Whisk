'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Copy,
  Check,
  QrCode,
  LogOut,
  Files,
  MessageSquare,
  Users,
  Share2,
  RefreshCw,
} from 'lucide-react'
import { useShareStore } from '@/lib/store'
import { useShareRoom } from '@/lib/use-share-room'
import { getFilesApi, getTextsApi } from '@/lib/api'
import { generateDeviceName } from '@/lib/file-utils'
import { UploadZone } from '@/components/share/upload-zone'
import { FileGrid } from '@/components/share/file-grid'
import { TextShare } from '@/components/share/text-share'
import { DeviceList } from '@/components/share/device-list'
import { QrDialog } from '@/components/share/qr-dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'

export function RoomView() {
  // Establish the socket connection + wire realtime events into the store.
  useShareRoom()

  const room = useShareStore((s) => s.room)
  const deviceName = useShareStore((s) => s.deviceName)
  const setDeviceName = useShareStore((s) => s.setDeviceName)
  const setFiles = useShareStore((s) => s.setFiles)
  const setTexts = useShareStore((s) => s.setTexts)
  const devices = useShareStore((s) => s.devices)
  const selfDeviceId = useShareStore((s) => s.selfDeviceId)
  const files = useShareStore((s) => s.files)
  const texts = useShareStore((s) => s.texts)
  const reset = useShareStore((s) => s.reset)

  const otherDevicesCount = devices.filter((d) => d.id !== selfDeviceId).length

  const [qrOpen, setQrOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tab, setTab] = useState('files')
  const [refreshing, setRefreshing] = useState(false)

  // Ensure we have a friendly device name (auto-upgrade any legacy animal names).
  useEffect(() => {
    const isLegacy = /^(Swift|Quick|Bright|Bold|Calm|Eager|Fast|Golden|Happy|Lucky)(Falcon|Tiger|Comet|Rocket|Panda|Wolf|Dolphin|Eagle|Fox|Hawk)$/.test(deviceName)
    if (!deviceName || isLegacy) setDeviceName(generateDeviceName())
  }, [deviceName, setDeviceName])

  // Load initial room data (files + texts).
  useEffect(() => {
    if (!room?.code) return
    let cancelled = false
    const load = async () => {
      try {
        const [files, texts] = await Promise.all([
          getFilesApi(room.code),
          getTextsApi(room.code),
        ])
        if (!cancelled) {
          setFiles(files)
          setTexts(texts)
        }
      } catch {
        /* ignored — socket will catch up live */
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [room?.code, setFiles, setTexts])

  const refresh = async () => {
    if (!room?.code) return
    setRefreshing(true)
    try {
      const [f, t] = await Promise.all([
        getFilesApi(room.code),
        getTextsApi(room.code),
      ])
      setFiles(f)
      setTexts(t)
      toast.success('Refreshed')
    } catch {
      toast.error('Refresh failed')
    } finally {
      setRefreshing(false)
    }
  }

  const copyCode = async () => {
    if (!room) return
    try {
      await navigator.clipboard.writeText(room.code)
      setCopied(true)
      toast.success('Code copied', { description: room.code })
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error('Copy failed')
    }
  }

  const handleLeave = () => {
    reset()
    toast.success('Left the room')
  }

  if (!room) return null

  // Split the code into characters for a more "code-entry" visual treatment.
  const codeChars = room.code.split('')

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6"
    >
      {/* Room header card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        {/* Soft emerald halo behind the code */}
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary/10 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-grid-fade opacity-30" aria-hidden />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
                <Share2 className="h-3 w-3" /> Room
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="presence-dot h-1.5 w-1.5 rounded-full bg-emerald-500 text-emerald-500" />
                {otherDevicesCount === 0
                  ? 'Waiting for devices'
                  : `${devices.length} online`} · expires in 24h
              </span>
            </div>

            {/* The 6-char code as the visual hero */}
            <div className="flex items-center gap-3">
              <h2 className="flex items-center gap-0.5 font-mono text-4xl font-bold tracking-[0.18em] code-glow sm:text-5xl">
                {codeChars.map((c, i) => (
                  <motion.span
                    key={`${c}-${i}`}
                    initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                    className="inline-block"
                  >
                    {c}
                  </motion.span>
                ))}
              </h2>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-xl"
                onClick={copyCode}
                aria-label="Copy room code"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this code or scan the QR with any device to join the room.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={refresh}
              disabled={refreshing}
              className="h-11"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              onClick={() => setQrOpen(true)}
              className="h-11 shadow-lg shadow-primary/20"
            >
              <QrCode className="h-4 w-4" />
              Show QR
            </Button>
            <Button
              variant="ghost"
              onClick={handleLeave}
              className="h-11 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Leave
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={tab}
        onValueChange={setTab}
        className="mt-6"
      >
        <TabsList className="grid h-11 w-full grid-cols-3 p-1 sm:flex sm:w-auto">
          <TabsTrigger
            value="files"
            className="group gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:border-transparent"
          >
            <Files className="h-4 w-4" />
            Files
            {files.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground">
                {files.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="text"
            className="group gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:border-transparent"
          >
            <MessageSquare className="h-4 w-4" />
            Text
            {texts.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground">
                {texts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="devices"
            className="group gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:border-transparent"
          >
            <Users className="h-4 w-4" />
            Devices
            {otherDevicesCount > 0 && (
              <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary group-data-[state=active]:bg-primary-foreground/20 group-data-[state=active]:text-primary-foreground">
                {otherDevicesCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <UploadZone />
            <FileGrid />
          </motion.div>
        </TabsContent>

        <TabsContent value="text" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <TextShare />
          </motion.div>
        </TabsContent>

        <TabsContent value="devices" className="mt-4">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <DeviceList />
          </motion.div>
        </TabsContent>
      </Tabs>

      <QrDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        roomCode={room.code}
      />
    </motion.section>
  )
}
