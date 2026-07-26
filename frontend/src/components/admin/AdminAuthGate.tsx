'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { api, clearToken, getToken } from '@/lib/api'

type Props = {
  children: React.ReactNode
}

export function AdminAuthGate({ children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (pathname === '/admin/login') {
      setReady(true)
      return
    }

    const token = getToken()
    if (!token) {
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`)
      return
    }

    api
      .get('/api/auth/me')
      .then(() => setReady(true))
      .catch(() => {
        clearToken()
        router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`)
      })
  }, [pathname, router])

  if (pathname === '/admin/login') return <>{children}</>
  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-stone-500">
        Проверка авторизации...
      </div>
    )
  }

  return <>{children}</>
}
