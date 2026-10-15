'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Copy, Check, MessageSquare, Inbox } from 'lucide-react'
import { useShareStore } from '@/lib/store'
import { sendTextApi } from '@/lib/api'
import { emitText } from '@/lib/use-share-room'
import { timeAgo } from '@/lib/file-utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export function TextShare() {
  const room = useShareStore((s) => s.room)
  const deviceName = useShareStore((s) => s.deviceName)
  const texts = useShareStore((s) => s.texts)
  const addText = useShareStore((s) => s.addText)
  const [content, setContent] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSend = async () => {
    const text = content.trim()
    if (!text || !room) return
    setBusy(true)
    try {
      const created = await sendTextApi(room.code, text, deviceName)
      if (created) addText(created)
      emitText(room.code, text, deviceName)
      setContent('')
      toast.success('Text shared')
    } catch {
      toast.error('Could not share text')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 pb-2 text-sm font-semibold">
          <MessageSquare className="h-4 w-4 text-primary" />
          Share text or a link
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSend()
          }}
          placeholder="Paste a URL, a note, a code snippet…"
          className="min-h-[96px] resize-y scroll-pretty"
        />
        <div className="mt-2 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            {content.length} chars · ⌘/Ctrl+Enter to send
          </p>
          <Button
            onClick={handleSend}
            disabled={busy || !content.trim()}
            size="sm"
            className="shadow-sm shadow-primary/20"
          >
            <Send className="h-4 w-4" />
            {busy ? 'Sending…' : 'Share'}
          </Button>
        </div>
      </div>

      <div className="scroll-pretty max-h-[55vh] space-y-2 overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {texts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="group flex gap-2.5"
            >
              {/* Avatar dot */}
              <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
              <div className="relative min-w-0 flex-1">
                {/* Sender + time header */}
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-[11px] font-semibold text-foreground">
                    {t.deviceName || 'Unknown'}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                    {timeAgo(t.createdAt)}
                  </span>
                </div>
                {/* Chat bubble */}
                <div className="relative w-full rounded-2xl rounded-tl-md border border-border bg-accent/40 px-3 py-2 transition-colors group-hover:bg-accent/60">
                  <p className="whitespace-pre-wrap break-all pr-6 text-sm leading-relaxed text-foreground">
                    {t.content}
                  </p>
                  <CopyButton text={t.content} />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {texts.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
            <div className="relative flex h-14 w-14 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-md" aria-hidden />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-border/60 bg-card">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">No messages yet</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Drop a link, a note, or a code snippet in the box above — it
                shows up here for everyone in the room.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error('Copy failed')
    }
  }
  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-1 top-1 h-6 w-6 rounded-md opacity-0 transition-opacity hover:bg-background/60 group-hover:opacity-100"
      onClick={copy}
      aria-label="Copy text"
    >
      {copied ? (
        <Check className="h-3 w-3 text-emerald-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  )
}
