import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Props = {
  /** Pass `false` to render without a link */
  href?: string | false
  className?: string
  imageClassName?: string
  priority?: boolean
}

export function BrandLogo({
  href = '/',
  className,
  imageClassName,
  priority,
}: Props) {
  const image = (
    <span
      className={cn(
        'inline-flex items-center rounded-xl border-2 border-foreground bg-white p-1',
        className
      )}
    >
      <Image
        src="/brand/shastudio-logo.png"
        alt="ShaStudio"
        width={320}
        height={240}
        priority={priority}
        className={cn('h-9 w-auto object-contain md:h-10', imageClassName)}
      />
    </span>
  )

  if (href === false) return image

  return (
    <Link href={href} className="inline-flex shrink-0" aria-label="ShaStudio — на главную">
      {image}
    </Link>
  )
}
