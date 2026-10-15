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

        {/* FAQ Section (Rich Search Result Snippets) */}
        <section aria-labelledby="faq-heading" className="mx-auto mt-20 max-w-3xl">
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
                  Open Drop Whisk on your PC or phone, click &apos;Create room&apos;, and scan the generated QR code or enter the 6-digit code on your other device. Then drag and drop files or copy-paste text to transfer instantly.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2">
                <AccordionTrigger className="text-left font-medium">
                  Is Drop Whisk free to use and do I need to register?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Drop Whisk is 100% free with zero sign-up, no email registration, and no software installation required. Simply open the website and start sharing.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3">
                <AccordionTrigger className="text-left font-medium">
                  What file types and sizes are supported?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  You can share photos, videos, audio, PDF documents, archives, and raw files up to 500MB per file with high-speed transfer.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-4">
                <AccordionTrigger className="text-left font-medium">
                  How long are uploaded files and rooms kept?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  All rooms, uploaded files, and clipboard snippets are temporary and automatically deleted after 24 hours for your privacy and security.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-5">
                <AccordionTrigger className="text-left font-medium">
                  Does Drop Whisk work across different operating systems?
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  Yes, it works seamlessly across iPhone (iOS), Android, Windows, macOS, Linux, and ChromeOS via any modern web browser like Chrome, Safari, Edge, or Firefox.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-6">
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
                  . It was built to make peer-to-peer and cross-device file sharing fast, secure, and accessible from any browser without registrations or cables.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>
    </section>
  )
}
