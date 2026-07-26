import { cn } from '@/lib/utils'

export function SectionPill({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border-[2px] border-foreground bg-background px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-foreground',
        className
      )}
    >
      <span aria-hidden>*</span>
      {children}
    </span>
  )
}

export function MeeloCard({
  children,
  className,
  tone = 'lavender',
}: {
  children: React.ReactNode
  className?: string
  tone?: 'lavender' | 'mint' | 'pink' | 'sky' | 'cream' | 'white'
}) {
  return (
    <div
      className={cn(
        'meelo-card rounded-[1.75rem] border-[2.5px] border-foreground p-5 md:p-6',
        tone === 'lavender' && 'bg-[var(--meelo-lavender)]',
        tone === 'mint' && 'bg-[var(--meelo-mint)]',
        tone === 'pink' && 'bg-[var(--meelo-pink)]',
        tone === 'sky' && 'bg-[var(--meelo-sky)]',
        tone === 'cream' && 'bg-[var(--meelo-cream)]',
        tone === 'white' && 'bg-background',
        className
      )}
    >
      {children}
    </div>
  )
}

export function MeeloButton({
  children,
  className,
  href,
  type = 'button',
  onClick,
  disabled,
}: {
  children: React.ReactNode
  className?: string
  href?: string
  type?: 'button' | 'submit'
  onClick?: () => void
  disabled?: boolean
}) {
  const classes = cn(
    'meelo-btn inline-flex items-center justify-center rounded-2xl border-[2.5px] border-foreground bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:pointer-events-none disabled:opacity-50',
    className
  )

  if (href) {
    return (
      <a href={href} className={classes} aria-disabled={disabled}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  )
}

export function SquiggleTitle({
  children,
  accent,
  className,
}: {
  children: React.ReactNode
  accent?: string
  className?: string
}) {
  if (!accent) {
    return <span className={className}>{children}</span>
  }

  const text = String(children)
  const idx = text.toLowerCase().indexOf(accent.toLowerCase())
  if (idx < 0) return <span className={className}>{children}</span>

  const before = text.slice(0, idx)
  const mid = text.slice(idx, idx + accent.length)
  const after = text.slice(idx + accent.length)

  return (
    <span className={className}>
      {before}
      <span className="relative inline-block">
        {mid}
        <svg
          className="pointer-events-none absolute -bottom-1 left-0 w-full text-[var(--meelo-accent)]"
          viewBox="0 0 120 10"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M2 6 C20 2, 40 10, 60 5 C80 1, 100 9, 118 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {after}
    </span>
  )
}
