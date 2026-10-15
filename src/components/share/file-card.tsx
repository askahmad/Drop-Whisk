'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Download,
  Trash2,
  FileText,
  Film,
  Music,
  Image as ImageIcon,
  FileArchive,
  File as FileIcon,
  Eye,
  Smartphone,
  Monitor,
  Apple,
  Bot,
  Clock,
  HardDrive,
} from 'lucide-react'
import type { FileMeta, FileKind } from '@/lib/types'
import { formatBytes, timeAgo } from '@/lib/file-utils'
import {
  fileDownloadUrlApi,
  filePreviewUrlApi,
  deleteFileApi,
} from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { emitFileDeleted } from '@/lib/use-share-room'
import { useShareStore } from '@/lib/store'
import { toast } from 'sonner'

function KindIcon({ kind, className }: { kind: FileKind; className?: string }) {
  switch (kind) {
    case 'image':
      return <ImageIcon className={className} />
    case 'video':
      return <Film className={className} />
    case 'audio':
      return <Music className={className} />
    case 'document':
      return <FileText className={className} />
    case 'archive':
      return <FileArchive className={className} />
    default:
      return <FileIcon className={className} />
  }
}

function PlatformDot({ deviceName }: { deviceName?: string | null }) {
  const n = (deviceName || '').toLowerCase()
  let Icon = Bot
  if (/android|ios|iphone|ipad|galaxy|pixel/.test(n)) Icon = Smartphone
  else if (/windows|mac|linux|pc|laptop|desktop/.test(n)) Icon = Monitor
  else if (/iphone|ipad|ios|apple/.test(n)) Icon = Apple
  return (
    <span className="inline-flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate">{deviceName || 'Unknown'}</span>
    </span>
  )
}

export function FileCard({ file }: { file: FileMeta }) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const room = useShareStore((s) => s.room)
  const removeFile = useShareStore((s) => s.removeFile)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    const ok = await deleteFileApi(file.id)
    if (ok) {
      removeFile(file.id)
      if (room) emitFileDeleted(room.code, file.id)
      toast.success('File deleted')
    } else {
      toast.error('Could not delete file')
    }
    setDeleting(false)
  }

  const canPreview =
    file.kind === 'image' || file.kind === 'video' || file.kind === 'audio'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      whileHover={{ y: -3 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg hover:shadow-primary/5 hover:border-primary/40"
    >
      {/* Preview / icon area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/40">
        {file.kind === 'image' ? (
          <img
            src={filePreviewUrlApi(file.id)}
            alt={file.originalName}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : file.kind === 'video' ? (
          <video
            src={filePreviewUrlApi(file.id)}
            className="h-full w-full object-cover"
            preload="metadata"
            muted
          />
        ) : file.kind === 'audio' ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-accent/40 to-muted p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Music className="h-6 w-6" />
            </div>
            <span className="line-clamp-1 text-xs font-medium text-muted-foreground">
              {file.originalName}
            </span>
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted/60 to-muted/20 p-4">
            <KindIcon kind={file.kind} className="h-10 w-10 text-muted-foreground" />
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {file.kind}
            </span>
          </div>
        )}

        {/* Hover actions overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
          {canPreview && (
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full shadow-lg"
              onClick={() => setPreviewOpen(true)}
              aria-label="Preview"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <a href={fileDownloadUrlApi(file.id)} download={file.originalName}>
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full shadow-lg"
              aria-label="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
          </a>
        </div>

        {/* Kind badge — top-left, refined */}
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border border-border/40 bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground/80 backdrop-blur">
          <KindIcon kind={file.kind} className="h-2.5 w-2.5" />
          {file.kind}
        </span>
      </div>

      {/* Info + metadata bar */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-2 break-all text-sm font-medium leading-tight">
          {file.originalName}
        </p>

        {/* Metadata bar */}
        <div className="mt-auto flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1 tabular-nums">
            <HardDrive className="h-3 w-3" />
            {formatBytes(file.size)}
          </span>
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Clock className="h-3 w-3" />
            {timeAgo(file.createdAt)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2">
          <PlatformDot deviceName={file.deviceName} />
          <div className="flex items-center gap-1">
            <a href={fileDownloadUrlApi(file.id)} download={file.originalName}>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                aria-label={`Download ${file.originalName}`}
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </a>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                  disabled={deleting}
                  aria-label={`Delete ${file.originalName}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this file?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove <strong>{file.originalName}</strong> from
                    the room for everyone. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{file.originalName}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col">
            <div className="scroll-pretty flex max-h-[70vh] items-center justify-center overflow-auto bg-black/90 p-2">
              {file.kind === 'image' && (
                <img
                  src={filePreviewUrlApi(file.id)}
                  alt={file.originalName}
                  className="max-h-[68vh] w-auto rounded"
                />
              )}
              {file.kind === 'video' && (
                <video
                  src={filePreviewUrlApi(file.id)}
                  controls
                  autoPlay
                  className="max-h-[68vh] w-auto rounded"
                />
              )}
              {file.kind === 'audio' && (
                <div className="flex w-full max-w-md flex-col items-center gap-4 p-8">
                  <Music className="h-16 w-16 text-primary" />
                  <audio src={filePreviewUrlApi(file.id)} controls autoPlay className="w-full" />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-border p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{file.originalName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(file.size)} · {file.mimeType}
                </p>
              </div>
              <a href={fileDownloadUrlApi(file.id)} download={file.originalName}>
                <Button size="sm">
                  <Download className="h-4 w-4" /> Download
                </Button>
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
