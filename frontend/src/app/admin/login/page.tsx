'use client'

import { FormEvent, Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api, setToken } from '@/lib/api'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('admin@shastudio.local')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      const data = await api.post<{ token: string }>('/api/auth/login', {
        email,
        password,
      })
      setToken(data.token)
      const next = searchParams.get('next') || '/admin'
      router.replace(next.startsWith('/admin') ? next : '/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Вход в админку</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </Button>
          <p className="text-center text-sm text-stone-500">
            <Link href="/" className="hover:text-stone-800">
              ← На сайт
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
      <Suspense fallback={<p className="text-sm text-stone-500">Загрузка...</p>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
