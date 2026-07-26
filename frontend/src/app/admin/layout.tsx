'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ADMIN_LINKS } from '@/lib/admin-nav'
import { AdminAuthGate } from '@/components/admin/AdminAuthGate'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { clearToken } from '@/lib/api'
import { BrandLogo } from '@/components/site/BrandLogo'
import { Button } from '@/components/ui/button'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLogin = pathname === '/admin/login'

  const logout = () => {
    clearToken()
    router.replace('/admin/login')
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {!isLogin && (
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
            <div className="flex items-center gap-3">
              <BrandLogo href="/admin" />
              <div>
                <p className="text-sm font-medium tracking-tight">Admin</p>
                <p className="text-sm text-stone-500">Управление контентом портфолио</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link href="/" className="text-sm text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-white">
                ← На сайт
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                Выйти
              </Button>
            </div>
          </div>
          <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3">
            {ADMIN_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </header>
      )}
      <main className={`mx-auto max-w-6xl px-4 py-8 ${isLogin ? '' : ''}`}>
        <AdminAuthGate>{children}</AdminAuthGate>
      </main>
    </div>
  )
}
