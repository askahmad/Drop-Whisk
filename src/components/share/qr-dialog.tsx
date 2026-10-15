'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Copy, Check, QrCode, ExternalLink, X, Share2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface QrDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roomCode: string
}

export function QrDialog({ open, onOpenChange, roomCode }: QrDialogProps) {
  const [dataUrl, setDataUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)

  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?room=${roomCode}`
      : ''

  useEffect(() => {
    if (!open || !joinUrl) return
    QRCode.toDataURL(joinUrl, {
      width: 480,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#0a0a0a', light: '#ffffff' },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(''))
  }, [open, joinUrl])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl)
      setCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-border/60 bg-card p-0 shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Room QR code</DialogTitle>
          <DialogDescription>
            Scan with a phone camera to join this room.
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex flex-col items-center gap-4 p-6">
          {/* Soft emerald halo behind the QR */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-glow-strong opacity-70"
            aria-hidden
          />

          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <QrCode className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold">Scan to join</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* QR card */}
          <div className="relative rounded-2xl border border-border bg-white p-3 shadow-lg">
            {dataUrl ? (
              <img
                src={dataUrl}
                alt={`QR code to join room ${roomCode}`}
                className="h-56 w-56"
              />
            ) : (
              <div className="h-56 w-56 animate-pulse rounded-lg bg-muted" />
            )}
          </div>

          {/* Room code chip under QR */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1">
            <Share2 className="h-3 w-3 text-primary" />
            <span className="font-mono text-sm font-bold tracking-[0.2em] text-foreground">
              {roomCode}
            </span>
          </div>

          <div className="w-full text-center">
            <p className="text-xs text-muted-foreground">
              Open your phone camera and point it at the code
            </p>
          </div>

          <div className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
            <code className="min-w-0 flex-1 truncate text-xs">{joinUrl}</code>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={copyLink}
              aria-label="Copy link"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(joinUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            Open in new tab
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
