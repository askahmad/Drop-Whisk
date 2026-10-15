'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Smartphone,
  Monitor,
  Tablet,
  Watch,
  Bot,
  Users,
  UserCheck,
} from 'lucide-react'
import { useShareStore } from '@/lib/store'
import { timeAgo } from '@/lib/file-utils'

function deviceIcon(name: string) {
  const n = (name || '').toLowerCase()
  if (/watch/.test(n)) return Watch
  if (/android|ios|iphone|ipad|galaxy|pixel|mobile|phone/.test(n)) return Smartphone
  if (/windows|mac|linux|pc|laptop|desktop/.test(n)) return Monitor
  if (/ipad|tablet/.test(n)) return Tablet
  return Bot
}

export function DeviceList() {
  const devices = useShareStore((s) => s.devices)
  const selfId = useShareStore((s) => s.selfDeviceId)
  const connection = useShareStore((s) => s.connection)

  const connected = connection === 'connected'
  const connecting = connection === 'connecting'

  const statusColor = connected
    ? 'bg-emerald-500 text-emerald-500'
    : connecting
      ? 'bg-amber-500 text-amber-500'
      : 'bg-zinc-400 text-zinc-400'
  const statusLabel = connected
    ? 'Live'
    : connecting
      ? 'Connecting'
      : 'Offline'

  const otherDevices = devices.filter((d) => d.id !== selfId)
  const isAlone = otherDevices.length === 0

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3 py-2.5 text-xs">
        <Users className="h-4 w-4 text-primary" />
        <span className="font-medium text-foreground">
          {isAlone ? '1 device' : `${devices.length} devices`}
        </span>
        <span className="text-muted-foreground">
          {isAlone ? '(Only this device connected)' : 'connected in room'}
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5">
          <span
            className={`presence-dot h-1.5 w-1.5 rounded-full ${statusColor}`}
            aria-hidden
          />
          <span className="text-muted-foreground">{statusLabel}</span>
        </span>
      </div>

      <div className="scroll-pretty max-h-[55vh] overflow-y-auto pr-1">
        <div className="grid gap-2 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {devices.map((d) => {
              const Icon = deviceIcon(d.name)
              const isSelf = d.id === selfId
              return (
                <motion.div
                  key={d.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                  whileHover={{ y: -1 }}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                    isSelf
                      ? 'border-primary/40 bg-accent/50 hover:border-primary/60'
                      : 'border-border bg-card hover:border-primary/40'
                  }`}
                >
                  <div
                    className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      isSelf
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {/* Online presence pulse — bottom-right corner */}
                    <span
                      className="presence-dot absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500 text-emerald-500"
                      aria-label="online"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {isSelf
                          ? (!d.name || /^(Swift|Quick|Bright|Bold|Calm|Eager|Fast|Golden|Happy|Lucky)(Falcon|Tiger|Comet|Rocket|Panda|Wolf|Dolphin|Eagle|Fox|Hawk)$/.test(d.name)
                              ? 'This Device'
                              : d.name)
                          : d.name}
                      </span>
                      {isSelf && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                          <UserCheck className="h-2.5 w-2.5" />
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {isSelf
                        ? 'Current active session'
                        : `joined ${d.joinedAt ? timeAgo(d.joinedAt) : 'recently'}`}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {isAlone && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-8 text-center mt-3">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-md" aria-hidden />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-card">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">No other device connected yet</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Share the room code or QR with your phone, laptop, or tablet — it will appear here as soon as it joins.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
