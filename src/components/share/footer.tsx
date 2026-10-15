'use client'

import { Github, Heart, Zap } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-5 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Zap className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
            <span className="font-semibold text-foreground">Drop Whisk</span>
            <span>— share anything, anywhere.</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Developed by{' '}
            <span className="font-medium text-foreground">Muhammad Ahmad</span>
            , Founder of{' '}
            <a
              href="https://connexode.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Connexode
            </a>
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <span className="hidden items-center gap-1.5 sm:inline-flex text-muted-foreground">
            <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
            No sign-up · Files auto-expire in 24h
          </span>
          <a
            href="https://github.com/askahmad/Drop-Whisk"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Github className="h-4 w-4" />
            <span>GitHub</span>
          </a>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            Built with <Heart className="h-3.5 w-3.5 fill-primary text-primary" />
          </span>
        </div>
      </div>
    </footer>
  )
}
