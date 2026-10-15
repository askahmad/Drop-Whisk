'use client'

import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useShareStore } from '@/lib/store'
import { uploadFileApi } from '@/lib/api'
import { formatBytes } from '@/lib/file-utils'
import { emitFileUploaded } from '@/lib/use-share-room'
import { toast } from 'sonner'
import type { FileMeta } from '@/lib/types'
import { Button } from '@/components/ui/button'

export function UploadZone() {
  const room = useShareStore((s) => s.room)
  const deviceName = useShareStore((s) => s.deviceName)
  const uploads = useShareStore((s) => s.uploads)
  const startUpload = useShareStore((s) => s.startUpload)
  const updateUpload = useShareStore((s) => s.updateUpload)
  const finishUpload = useShareStore((s) => s.finishUpload)
  const failUpload = useShareStore((s) => s.failUpload)
  const clearDoneUploads = useShareStore((s) => s.clearDoneUploads)
  const addFile = useShareStore((s) => s.addFile)

  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      if (!room) return
      const files = Array.from(fileList)
      if (files.length === 0) return

      for (const file of files) {
        const id = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        startUpload({
          id,
          name: file.name,
          size: file.size,
          progress: 0,
          status: 'uploading',
        })

        try {
          const created = await uploadFileApi(
            room.code,
            file,
            deviceName,
            (pct) => updateUpload(id, pct),
          )
          addFile(created)
          finishUpload(id)
          // Notify other devices via the socket (the upload REST route does NOT
          // broadcast; the client emits `send_file_signal` after success).
          emitFileUploaded(room.code, created satisfies FileMeta)
        } catch (e) {
          failUpload(id, e instanceof Error ? e.message : 'Upload failed')
          toast.error('Upload failed', {
            description: file.name,
          })
        }
      }
    },
    [room, deviceName, startUpload, updateUpload, finishUpload, failUpload, addFile],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const onPick = () => inputRef.current?.click()

  const activeUploads = uploads.filter((u) => u.status === 'uploading')
  const doneUploads = uploads.filter((u) => u.status !== 'uploading')

  return (
    <div className="space-y-3">
      <motion.div
        role="button"
        tabIndex={0}
        onClick={onPick}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onPick()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        animate={
          dragActive
            ? { scale: 1.01, borderColor: 'rgb(16 185 129 / 0.6)' }
            : { scale: 1, borderColor: 'rgb(0 0 0 / 0)' }
        }
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className={`relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragActive
            ? 'border-primary bg-accent/60'
            : 'border-border bg-card/40 hover:border-primary/50 hover:bg-accent/30'
        }`}
      >
        {/* Glow that intensifies when dragging */}
        <div
          className={`pointer-events-none absolute inset-0 -z-10 bg-glow transition-opacity duration-300 ${
            dragActive ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden
        />
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <motion.div
          animate={
            dragActive
              ? { scale: 1.12, rotate: -6 }
              : { scale: 1, rotate: 0 }
          }
          transition={{ type: 'spring', stiffness: 350, damping: 16 }}
          className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30"
        >
          <motion.div
            animate={dragActive ? { y: [0, -3, 0] } : { y: 0 }}
            transition={{
              duration: 0.9,
              repeat: dragActive ? Infinity : 0,
              ease: 'easeInOut',
            }}
          >
            <UploadCloud className="h-7 w-7" strokeWidth={2.2} />
          </motion.div>
        </motion.div>
        <p className="text-base font-semibold">
          {dragActive ? 'Drop to upload' : 'Drag & drop files here'}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          or <span className="font-medium text-primary">browse</span> — images, video, audio, anything up to 500MB
        </p>
      </motion.div>

      <AnimatePresence>
        {uploads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {activeUploads.map((u) => (
              <motion.div
                key={u.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
              >
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-medium">
                      {u.name}
                    </span>
                    <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                      {formatBytes(u.size)}
                    </span>
                  </div>
                  {/* Smooth animated progress bar */}
                  <div className="relative mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${u.progress}%` }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    />
                  </div>
                </div>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-primary">
                  {u.progress}%
                </span>
              </motion.div>
            ))}

            {doneUploads.map((u) => (
              <motion.div
                key={u.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                  u.status === 'error'
                    ? 'border-destructive/30 bg-destructive/5'
                    : 'border-border bg-card'
                }`}
              >
                {u.status === 'done' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
                )}
                <div className="min-w-0 flex-1">
                  <span className="truncate text-xs font-medium">
                    {u.name}
                  </span>
                  {u.status === 'error' && u.error && (
                    <p className="text-[11px] text-destructive">{u.error}</p>
                  )}
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {u.status === 'done' ? 'Uploaded' : 'Failed'}
                </span>
              </motion.div>
            ))}

            {doneUploads.length > 0 && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={clearDoneUploads}
                >
                  <X className="h-3 w-3" /> Clear
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
