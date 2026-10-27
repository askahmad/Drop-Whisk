'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  KeyRound,
  Plus,
  Smartphone,
  Monitor,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Zap,
  ShieldCheck,
  Wifi,
  QrCode,
  UploadCloud,
  Download,
  HelpCircle,
  Check,
  X,
  Sparkles,
  Clock,
  Globe,
  Shield,
  Archive,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useShareStore } from '@/lib/store'
import { createRoomApi, getRoomApi, registerDeviceApi } from '@/lib/api'
import { generateDeviceName } from '@/lib/file-utils'
import { toast } from 'sonner'

export function Landing() {
  const setRoom = useShareStore((s) => s.setRoom)
  const setDeviceName = useShareStore((s) => s.setDeviceName)
  const setSelfDeviceId = useShareStore((s) => s.setSelfDeviceId)
  const setLoading = useShareStore((s) => s.setLoading)

  const [joinCode, setJoinCode] = useState('')
  const [busy, setBusy] = useState<'create' | 'join' | null>(null)

  const handleCreate = async () => {
    setBusy('create')
    try {
      const stored = useShareStore.getState().deviceName
      const isLegacy = /^(Swift|Quick|Bright|Bold|Calm|Eager|Fast|Golden|Happy|Lucky)(Falcon|Tiger|Comet|Rocket|Panda|Wolf|Dolphin|Eagle|Fox|Hawk)$/.test(stored)
      const name = !stored || isLegacy ? generateDeviceName() : stored
      setDeviceName(name)
      setLoading(true)
      const room = await createRoomApi()
      setRoom(room)
      try {
        const dev = await registerDeviceApi(room.code, name)
        if (dev) setSelfDeviceId(dev.id)
      } catch {
        /* non-fatal */
      }
      toast.success('Room created', {
        description: `Share code ${room.code} with anyone`,
      })
    } catch (e) {
      toast.error('Could not create room', {
        description: e instanceof Error ? e.message : undefined,
      })
    } finally {
      setBusy(null)
    }
  }

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase()
    if (!code) {
      toast.error('Enter a room code')
      return
    }
    setBusy('join')
    try {
      const name = useShareStore.getState().deviceName || generateDeviceName()
      setDeviceName(name)
      setLoading(true)
      const room = await getRoomApi(code)
      if (!room) {
        toast.error('Room not found', {
          description: 'Check the code and try again',
        })
        setLoading(false)
        return
      }
      setRoom(room)
      try {
        const dev = await registerDeviceApi(room.code, name)
        if (dev) setSelfDeviceId(dev.id)
      } catch {
        /* non-fatal */
      }
      toast.success(`Joined room ${room.code}`)
    } catch (e) {
      toast.error('Could not join room', {
        description: e instanceof Error ? e.message : undefined,
      })
      setLoading(false)
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="relative isolate overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 -z-10 bg-glow-strong" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-grid opacity-60" aria-hidden />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-5 inline-flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="presence-dot h-2 w-2 rounded-full bg-primary text-primary" />
              No sign-up · Works on any device · 500MB per file
            </div>
            <a
              href="https://connexode.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur transition-colors hover:border-primary/50 hover:text-foreground"
            >
              <span>By</span>
              <span className="font-semibold text-foreground">Muhammad Ahmad</span>
              <span className="text-primary font-medium">· Founder of Connexode</span>
            </a>
          </div>

          <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-6xl">
            Share <span className="text-gradient-animated">anything</span>,
            anywhere,
            <br className="hidden sm:block" /> in seconds.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            Drop Whisk sends images, videos, audio and any file between your
            phone, laptop, Android and iPhone. No accounts, no cables — just a
            room code or a QR scan.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 text-xs text-muted-foreground">
            {[
              { icon: ImageIcon, label: 'Images' },
              { icon: Video, label: 'Videos' },
              { icon: Music, label: 'Audio' },
              { icon: FileText, label: 'Documents' },
              { icon: Zap, label: 'Any file' },
            ].map(({ icon: Icon, label }) => (
              <motion.span
                key={label}
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1 backdrop-blur"
              >
                <Icon className="h-3.5 w-3.5 text-primary" />
                {label}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Action cards */}
        <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-2">
          {/* Create card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -3 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/40 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/40"
          >
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/10 blur-2xl transition-transform duration-500 group-hover:translate-x-4 group-hover:scale-125" />
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Plus className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <h2 className="text-lg font-semibold">Create a room</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Start a new share session and get a code plus a QR for instant
                pairing with your phone.
              </p>
              <Button
                className="mt-5 h-12 w-full text-base"
                size="lg"
                onClick={handleCreate}
                disabled={busy !== null}
              >
                {busy === 'create' ? 'Creating…' : 'Create room'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </motion.div>

          {/* Join card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            whileHover={{ y: -3 }}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/40 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/40"
          >
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-primary/10 blur-2xl transition-transform duration-500 group-hover:translate-x-4 group-hover:scale-125" />
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground shadow-lg">
                <KeyRound className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <h2 className="text-lg font-semibold">Join a room</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Have a code? Enter it to join an existing session and start
                receiving files right away.
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:gap-3">
                <Input
                  value={joinCode}
                  onChange={(e) =>
                    setJoinCode(e.target.value.toUpperCase().slice(0, 6))
                  }
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  placeholder="ABC123"
                  className="h-12 flex-1 bg-muted/30 text-center font-mono text-2xl font-bold tracking-[0.4em] placeholder:tracking-[0.4em] placeholder:text-muted-foreground focus-visible:bg-background"
                  inputMode="text"
                  autoCapitalize="characters"
                  autoComplete="off"
                  aria-label="Room code"
                />
                <Button
                  size="lg"
                  className="h-12 px-6 text-base"
                  onClick={handleJoin}
                  disabled={busy !== null || joinCode.length < 4}
                >
                  {busy === 'join' ? 'Joining…' : 'Join'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Feature highlights */}
        <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3">
          {[
            {
              icon: Smartphone,
              title: 'Mobile ↔ PC',
              desc: 'Scan a QR from your phone to drop files straight to your laptop.',
            },
            {
              icon: Wifi,
              title: 'Real-time sync',
              desc: 'New files show up on every connected device instantly.',
            },
            {
              icon: ShieldCheck,
              title: 'Auto-expiring',
              desc: 'Rooms and uploads clear themselves after 24 hours.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              whileHover={{ y: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="rounded-xl border border-border/60 bg-card/50 p-4 backdrop-blur transition-colors hover:border-primary/40"
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Monitor className="h-4 w-4" /> Desktop
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Smartphone className="h-4 w-4" /> Mobile
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="rounded-md border border-border/60 bg-muted px-1.5 py-0.5 font-semibold">iOS</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="rounded-md border border-border/60 bg-muted px-1.5 py-0.5 font-semibold">Android</span>
          </span>
        </div>

        {/* How It Works Section (SEO & Semantic Structure) */}
        <section aria-labelledby="how-it-works-heading" className="mx-auto mt-20 max-w-4xl text-center">
          <h2 id="how-it-works-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
            How Drop Whisk Works
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            No installation, no Bluetooth configuration, no account creation. Instant file transfer in 3 simple steps.
          </p>

          <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur transition-colors hover:border-primary/40">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                1
              </div>
              <h3 className="font-semibold text-foreground">Create or Enter Room</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Start a session on any device to generate a secure 6-character room code and QR link.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur transition-colors hover:border-primary/40">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                2
              </div>
              <h3 className="font-semibold text-foreground">Connect Instantly</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Scan the QR code from your smartphone camera or type the code on another PC or tablet.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur transition-colors hover:border-primary/40">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                3
              </div>
              <h3 className="font-semibold text-foreground">Drop & Download</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Drag-and-drop photos, large videos up to 500MB, or paste text. Download individually or as a single ZIP.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Comparison Matrix (GEO & Competitor Displacement) */}
        <section aria-labelledby="comparison-heading" className="mx-auto mt-24 max-w-5xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Unmatched Freedom</span>
            </div>
            <h2 id="comparison-heading" className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Why Drop Whisk Beats Traditional File Sharing
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              See how Drop Whisk compares to Apple AirDrop, Google Quick Share, WeTransfer, and Snapdrop.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-border/70 bg-card/60 backdrop-blur shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/40">
                    <th scope="col" className="p-3.5 sm:p-4 font-semibold text-foreground">Feature</th>
                    <th scope="col" className="p-3.5 sm:p-4 font-bold text-primary bg-primary/10">
                      ⚡ Drop Whisk
                    </th>
                    <th scope="col" className="p-3.5 sm:p-4 font-medium text-muted-foreground">Apple AirDrop</th>
                    <th scope="col" className="p-3.5 sm:p-4 font-medium text-muted-foreground">Quick Share</th>
                    <th scope="col" className="p-3.5 sm:p-4 font-medium text-muted-foreground">WeTransfer</th>
                    <th scope="col" className="p-3.5 sm:p-4 font-medium text-muted-foreground">Snapdrop</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 sm:p-4 font-medium text-foreground">Cross-Platform (All OS)</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-emerald-500 bg-primary/5">
                      <span className="inline-flex items-center gap-1">
                        <Check className="h-4 w-4" /> All (iOS, Android, PC, Mac, Linux)
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">
                      <span className="inline-flex items-center gap-1 text-rose-400">
                        <X className="h-4 w-4" /> Apple Only
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">
                      <span className="inline-flex items-center gap-1 text-amber-500">
                        Android / Win only
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">
                      <span className="inline-flex items-center gap-1 text-emerald-500">
                        <Check className="h-4 w-4" /> Yes
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">
                      <span className="inline-flex items-center gap-1 text-emerald-500">
                        <Check className="h-4 w-4" /> Yes
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 sm:p-4 font-medium text-foreground">No Software / App Needed</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-emerald-500 bg-primary/5">
                      <span className="inline-flex items-center gap-1">
                        <Check className="h-4 w-4" /> 100% Web Browser
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">OS Built-in</td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">Requires Windows app</td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">Web Browser</td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">Web Browser</td>
                  </tr>

                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 sm:p-4 font-medium text-foreground">No Account / Zero Sign-up</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-emerald-500 bg-primary/5">
                      <span className="inline-flex items-center gap-1">
                        <Check className="h-4 w-4" /> Zero registration
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">Apple ID required</td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">Google Account</td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground text-amber-500">Email verification</td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">Zero registration</td>
                  </tr>

                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 sm:p-4 font-medium text-foreground">Instant Pairing Method</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-foreground bg-primary/5">
                      QR Camera & 6-Char Code
                    </td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">Bluetooth Discovery</td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">Nearby Bluetooth/Wi-Fi</td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">Email link / Slow copy</td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground text-amber-500">Same Wi-Fi WebRTC (often drops)</td>
                  </tr>

                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 sm:p-4 font-medium text-foreground">Max File Size</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-foreground bg-primary/5">
                      500 MB per file
                    </td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">Unlimited (Local)</td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">Unlimited (Local)</td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">2 GB (Free tier)</td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground text-amber-500">Varies / WebRTC buffer limits</td>
                  </tr>

                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 sm:p-4 font-medium text-foreground">Multi-Device Live Sync</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-emerald-500 bg-primary/5">
                      <span className="inline-flex items-center gap-1">
                        <Check className="h-4 w-4" /> Live Room (N devices)
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">1-to-1 only</td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">1-to-1 only</td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">Asynchronous email</td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">1-to-1 only</td>
                  </tr>

                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 sm:p-4 font-medium text-foreground">Batch ZIP Archive Download</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-emerald-500 bg-primary/5">
                      <span className="inline-flex items-center gap-1">
                        <Check className="h-4 w-4" /> Single-click ZIP
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">
                      <X className="h-4 w-4 text-rose-400" />
                    </td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">
                      <X className="h-4 w-4 text-rose-400" />
                    </td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">
                      <Check className="h-4 w-4 text-emerald-500" />
                    </td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">
                      <X className="h-4 w-4 text-rose-400" />
                    </td>
                  </tr>

                  <tr className="hover:bg-muted/20 transition-colors">
                    <td className="p-3.5 sm:p-4 font-medium text-foreground">Privacy & Ephemeral Storage</td>
                    <td className="p-3.5 sm:p-4 font-semibold text-emerald-500 bg-primary/5">
                      <span className="inline-flex items-center gap-1">
                        <Check className="h-4 w-4" /> 24h Auto-Purge
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">Local peer</td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">Local peer</td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">7 days on servers</td>
                    <td className="p-3.5 sm:p-4 text-muted-foreground">In-memory peer</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Technical Specifications Grid (AEO & Factual Grounding) */}
        <section aria-labelledby="specs-heading" className="mx-auto mt-24 max-w-5xl">
          <div className="text-center">
            <h2 id="specs-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
              Drop Whisk Technical Specifications
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              Built for speed, zero friction, and maximum privacy.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-left">
            <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur transition-all hover:border-primary/40">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">500 MB Per File</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Transfer high-resolution raw photos, 4K videos, audio albums, or software archives without compression.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur transition-all hover:border-primary/40">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">24h Auto-Purge Lifetime</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Rooms and uploaded files are automatically hard-deleted after 24 hours to ensure your storage stays pristine and secure.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur transition-all hover:border-primary/40">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">Zero Account / Anonymous</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                No email, phone number, password, or cookies required. 100% anonymous file sharing directly in your browser.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur transition-all hover:border-primary/40">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">Universal Cross-OS</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Flawless interoperability across iOS, Android, Windows 10/11, macOS, Linux, and ChromeOS with no app downloads.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur transition-all hover:border-primary/40">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <QrCode className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">Sub-2s QR Pairing</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Point your smartphone camera at the pairing QR code to instantly join the room without typing IP addresses or codes.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur transition-all hover:border-primary/40">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Archive className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">On-the-Fly ZIP Streaming</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Download dozens of shared files together in a single compressed .zip file with zero server-side latency.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section (Rich Search Result Snippets & AEO) */}
        <section aria-labelledby="faq-heading" className="mx-auto mt-24 max-w-3xl">
          <div className="text-center">
            <h2 id="faq-heading" className="text-2xl font-bold tracking-tight sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything you need to know about sharing files across devices with Drop Whisk.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-border/70 bg-card/60 p-6 backdrop-blur">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger className="text-left font-medium">
                  How do I transfer files between phone and PC with Drop Whisk?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Open Drop Whisk on your PC or phone, click &apos;Create room&apos;, and scan the generated QR code or enter the 6-digit code on your other device. Then drag and drop files or copy-paste text to transfer instantly without cables.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2">
                <AccordionTrigger className="text-left font-medium">
                  Is Drop Whisk free to use and do I need to register?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Drop Whisk is 100% free with zero sign-up, no email registration, and no software installation required. Simply open the website in your browser and start transferring immediately.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3">
                <AccordionTrigger className="text-left font-medium">
                  What file types and sizes are supported?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Drop Whisk supports all file types including photos (JPEG, PNG, HEIC, RAW), videos (MP4, MOV, MKV up to 4K), audio, PDF documents, archives, and code files up to 500MB per file with high-speed transfer.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-4">
                <AccordionTrigger className="text-left font-medium">
                  How long are uploaded files and rooms kept?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  All rooms, uploaded files, and clipboard snippets are temporary and automatically deleted after 24 hours for your privacy and security. No persistent user data is retained.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-5">
                <AccordionTrigger className="text-left font-medium">
                  Does Drop Whisk work across different operating systems?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Yes, Drop Whisk works seamlessly across iPhone (iOS), Android, Windows, macOS, Linux, and ChromeOS via any modern web browser like Chrome, Safari, Edge, or Firefox.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-6">
                <AccordionTrigger className="text-left font-medium">
                  How is Drop Whisk better than Apple AirDrop or Google Quick Share?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  AirDrop is locked exclusively to Apple hardware, and Quick Share is limited to Android/Windows. Drop Whisk is truly universal: it bridges Apple, Android, Windows, and Linux without installing apps, Bluetooth configuration, or vendor ecosystem lock-in.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-7">
                <AccordionTrigger className="text-left font-medium">
                  Is Drop Whisk secure and private?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Yes. Drop Whisk uses encrypted HTTPS/WSS connections, requires no personal accounts or email addresses, stores files in temporary isolated rooms, and automatically purges all data after 24 hours.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-8">
                <AccordionTrigger className="text-left font-medium">
                  Who developed Drop Whisk?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Drop Whisk was developed by{' '}
                  <strong className="font-semibold text-foreground">
                    Muhammad Ahmad
                  </strong>
                  , Founder of{' '}
                  <a
                    href="https://connexode.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    Connexode
                  </a>
                  . It was built as a modern, high-speed, open-source tool to eliminate cross-device sharing barriers.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>
    </section>
  )
}
