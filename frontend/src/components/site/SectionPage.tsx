import { SectionPill } from '@/components/site/MeeloUI'
import { SectionVisual } from '@/components/site/SectionVisual'
import type { MediaSectionKey } from '@/lib/media-sections'
import { cn } from '@/lib/utils'

type Props = {
  section: MediaSectionKey
  pill: string
  title: string
  description?: string
  children: React.ReactNode
  shape?: 'arch' | 'circle'
  stamp?: string
  reverse?: boolean
  className?: string
}

export function SectionPage({
  section,
  pill,
  title,
  description,
  children,
  shape = 'circle',
  stamp,
  reverse,
  className,
}: Props) {
  return (
    <div className={cn('space-y-10', className)}>
      <div
        className={cn(
          'grid items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]',
          reverse && 'lg:[&>*:first-child]:order-2'
        )}
      >
        <SectionVisual section={section} mode="section" shape={shape} stamp={stamp} />
        <div>
          <SectionPill>{pill}</SectionPill>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {description}
            </p>
          )}
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}
