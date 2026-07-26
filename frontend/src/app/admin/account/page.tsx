'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { api, clearToken } from '@/lib/api'
import { useRouter } from 'next/navigation'

type Me = {
  id: string
  email: string
  name: string | null
  role: string
}

export default function AdminAccountPage() {
  const router = useRouter()
  const [me, setMe] = useState<Me | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api
      .get<Me>('/api/auth/me')
      .then(setMe)
      .catch(() => setMe(null))
  }, [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (newPassword.length < 8) {
      setError('Новый пароль должен быть не короче 8 символов')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    try {
      setLoading(true)
      await api.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
      })
      setMessage('Пароль обновлён. Войдите снова.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      clearToken()
      setTimeout(() => router.replace('/admin/login'), 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сменить пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Аккаунт</h1>
        <p className="mt-2 text-stone-600">Смена пароля администратора</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Текущий пользователь</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-stone-600">
          <p>
            <span className="text-stone-400">Email:</span> {me?.email || '—'}
          </p>
          <p>
            <span className="text-stone-400">Имя:</span> {me?.name || '—'}
          </p>
          <p>
            <span className="text-stone-400">Роль:</span> {me?.role || '—'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Сменить пароль</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="current">Текущий пароль</Label>
              <Input
                id="current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next">Новый пароль</Label>
              <Input
                id="next"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Повтор нового пароля</Label>
              <Input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-emerald-700">{message}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? 'Сохранение...' : 'Обновить пароль'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-xs text-stone-500">
        Для сброса из `.env`: задайте новый `ADMIN_PASSWORD`, поставьте{' '}
        <code>ADMIN_PASSWORD_FORCE=true</code> и перезапустите backend. После сброса уберите
        флаг.
      </p>
    </div>
  )
}
