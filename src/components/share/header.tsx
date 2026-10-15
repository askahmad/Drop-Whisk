'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'
import { ThemeToggle } from '@/components/share/theme-toggle'
import { useShareStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'

export function Header() {
  const connection = useShareStore((s) => s.connection)
  const room = useShareStore((s) => s.room)
  const reset = useShareStore((s) => s.reset)
  const router = useRouter()

  const statusColor =
    connection === 'connected'
      ? 'text-emerald-500'
      : connection === 'connecting'
        ? 'text-amber-500'
        : 'text-zinc-400'

  const statusLabel =
    connection === 'connected'
      ? 'Live'
      : connection === 'connecting'
        ? 'Connecting'
        : 'Offline'

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (room) {
      reset()
    }
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      {/* A faint emerald line at the very top edge for premium feel */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" aria-hidden />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          onClick={handleLogoClick}
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
          aria-label="DropWhisk Home"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-105">
            <div
              className="absolute inset-0 -z-10 rounded-xl bg-primary/50 opacity-60 blur-md transition-opacity group-hover:opacity-80"
              aria-hidden
            />
            <Zap className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight">
              Drop<span className="text-primary">Whisk</span>
            </span>
            <span className="hidden text-[11px] text-muted-foreground sm:block">
              Cross-device file sharing
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {room && (
            <Badge
              variant="secondary"
              className="gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
            >
              <span
                className={`presence-dot h-1.5 w-1.5 rounded-full bg-current ${statusColor}`}
                aria-hidden
              />
              {statusLabel}
            </Badge>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
