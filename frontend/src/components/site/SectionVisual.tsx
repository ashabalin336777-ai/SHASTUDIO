'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { api, resolveMediaUrl } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { MediaSectionKey } from '@/lib/media-sections'

type Shape = 'arch' | 'circle'

type Props = {
  section: MediaSectionKey
  /** hero: show photo immediately (or logo). section: logo first, then photo */
  mode?: 'hero' | 'section'
  shape?: Shape
  className?: string
  stamp?: string
}

export function SectionVisual({
  section,
  mode = 'section',
  shape = 'arch',
  className,
  stamp = 'SHA STUDIO',
}: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [phase, setPhase] = useState<'logo' | 'photo'>('logo')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    setReady(false)
    setPhase('logo')
    api
      .get<{ section: string; imageUrl: string | null }>(`/api/media/${section}`)
      .then((data) => {
        if (cancelled) return
        setImageUrl(resolveMediaUrl(data.imageUrl))
        setReady(true)
      })
      .catch(() => {
        if (cancelled) return
        setImageUrl(null)
        setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [section])

  useEffect(() => {
    if (!ready) return
    if (mode === 'hero') {
      setPhase(imageUrl ? 'photo' : 'logo')
      return
    }
    setPhase('logo')
    if (!imageUrl) return
    const timer = window.setTimeout(() => setPhase('photo'), 650)
    return () => window.clearTimeout(timer)
  }, [ready, imageUrl, mode, section])

  const frameClass =
    shape === 'circle'
      ? 'aspect-square rounded-full'
      : 'aspect-[3/4] rounded-[999px_999px_2.5rem_2.5rem]'

  return (
    <div className={cn('relative mx-auto w-full max-w-[280px] md:max-w-[320px]', className)}>
      <DecorStars className="absolute -right-3 top-6 z-20 hidden sm:block" />
      <DecorWaves className="absolute -left-8 top-1/3 z-0 hidden sm:block" />

      <div
        className={cn(
          'meelo-frame relative overflow-hidden border-[2.5px] border-foreground bg-[var(--meelo-frame)]',
          frameClass
        )}
      >
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-white p-6 transition-all duration-700 ease-out dark:bg-zinc-100',
            phase === 'logo' ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          )}
        >
          <Image
            src="/brand/shastudio-logo.png"
            alt="ShaStudio"
            width={320}
            height={240}
            priority
            className="h-auto w-[78%] object-contain"
          />
        </div>

        {imageUrl && (
          <div
            className={cn(
              'absolute inset-0 overflow-hidden transition-opacity duration-700 ease-out',
              phase === 'photo' ? 'opacity-100' : 'opacity-0'
            )}
          >
            {/* Height-fit: top/bottom of source stay visible; sides crop (zoom-out vs width-fit cover) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              className="absolute left-1/2 top-0 h-full w-auto max-w-none -translate-x-1/2"
            />
          </div>
        )}
      </div>

      <div className="meelo-stamp absolute -left-2 -top-3 z-30 flex size-20 items-center justify-center rounded-full border-[2.5px] border-foreground bg-[var(--meelo-stamp)] text-center text-[8px] font-bold uppercase leading-tight tracking-wide text-foreground md:-left-4 md:size-24 md:text-[9px]">
        <span className="absolute inset-[10px] animate-[spin_18s_linear_infinite] rounded-full border border-dashed border-foreground/40" />
        <span className="relative px-2">{stamp}</span>
      </div>
    </div>
  )
}

function DecorStars({ className }: { className?: string }) {
  return (
    <svg className={className} width="48" height="56" viewBox="0 0 48 56" fill="none" aria-hidden>
      <path
        d="M24 4 L26.5 16 L38 18.5 L26.5 21 L24 33 L21.5 21 L10 18.5 L21.5 16 Z"
        className="fill-foreground"
      />
      <path
        d="M38 34 L39.4 40 L45 41.4 L39.4 42.8 L38 49 L36.6 42.8 L31 41.4 L36.6 40 Z"
        className="fill-foreground"
      />
    </svg>
  )
}

function DecorWaves({ className }: { className?: string }) {
  return (
    <svg className={className} width="36" height="48" viewBox="0 0 36 48" fill="none" aria-hidden>
      <path
        d="M4 8 C12 4, 12 12, 20 8 C28 4, 28 12, 34 8"
        className="stroke-foreground"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M4 20 C12 16, 12 24, 20 20 C28 16, 28 24, 34 20"
        className="stroke-foreground"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M4 32 C12 28, 12 36, 20 32 C28 28, 28 36, 34 32"
        className="stroke-foreground"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  )
}
