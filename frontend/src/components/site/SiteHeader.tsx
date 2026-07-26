'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SITE_NAV } from '@/lib/site-nav'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { BrandLogo } from '@/components/site/BrandLogo'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 pt-4 md:px-6">
        <div className="meelo-card flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border-[2.5px] border-foreground bg-background/95 px-3 py-2.5 backdrop-blur-md md:px-4">
          <BrandLogo priority />

          <nav className="order-3 flex w-full gap-0.5 overflow-x-auto pb-1 md:order-none md:w-auto md:pb-0">
            {SITE_NAV.map((item) => {
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center gap-1 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-sm font-medium transition',
                    active
                      ? 'text-[var(--meelo-nav-active)]'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {'emoji' in item && item.emoji ? (
                    <span aria-hidden className="text-base leading-none">
                      {item.emoji}
                    </span>
                  ) : null}
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="meelo-icon-btn rounded-xl border-[2px] border-foreground bg-background p-0.5">
              <ThemeToggle />
            </div>
            <Link
              href="/admin"
              className="meelo-icon-btn rounded-xl border-[2px] border-foreground bg-background px-3 py-1.5 text-sm font-semibold text-foreground"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
