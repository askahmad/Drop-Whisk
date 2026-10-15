'use client'

import { AnimatePresence } from 'framer-motion'
import { FolderOpen, PackageOpen, Sparkles } from 'lucide-react'
import { useShareStore } from '@/lib/store'
import { FileCard } from '@/components/share/file-card'
import { Button } from '@/components/ui/button'
import { roomZipUrl } from '@/lib/api'
import { formatBytes } from '@/lib/file-utils'

export function FileGrid() {
  const files = useShareStore((s) => s.files)
  const room = useShareStore((s) => s.room)

  const totalSize = files.reduce((acc, f) => acc + f.size, 0)

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-14 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-md" aria-hidden />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-border/60 bg-card">
            <PackageOpen className="h-7 w-7 text-muted-foreground" />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">No files yet</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Drag a file into the drop zone above, or ask another device in the
            room to share something.
          </p>
        </div>
        <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-[11px] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-primary" />
          Real-time sync is live
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{files.length}</span>{' '}
          file{files.length === 1 ? '' : 's'} ·{' '}
          <span className="tabular-nums">{formatBytes(totalSize)}</span>
        </p>
        {room && (
          <a href={roomZipUrl(room.code)} download={`dropwhisk-${room.code}.zip`}>
            <Button variant="outline" size="sm">
              <FolderOpen className="h-4 w-4" />
              Download all (.zip)
            </Button>
          </a>
        )}
      </div>

      <div className="scroll-pretty max-h-[75vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <AnimatePresence mode="popLayout">
            {files.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
