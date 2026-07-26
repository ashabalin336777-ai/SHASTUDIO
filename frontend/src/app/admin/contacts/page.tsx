'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import type { Profile } from '@/types/portfolio'

type ContactsForm = {
  fullName: string
  phone: string
  email: string
  telegram: string
  max: string
  website: string
}

const empty: ContactsForm = {
  fullName: 'Шабалин Андрей Юрьевич',
  phone: '',
  email: '',
  telegram: '',
  max: '',
  website: 'https://shastudio.ru',
}

export default function AdminContactsPage() {
  const [form, setForm] = useState<ContactsForm>(empty)
  const [profileId, setProfileId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get<Partial<Profile>>('/api/profile')
      .then((data) => {
        setProfileId(data.id)
        setForm({
          fullName: data.fullName || empty.fullName,
          phone: data.phone || '',
          email: data.email || '',
          telegram: data.telegram || '',
          max: data.max || '',
          website: data.website || empty.website,
        })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    try {
      setSaving(true)
      setError('')
      setMessage('')

      const existing = await api.get<Partial<Profile>>('/api/profile')
      const payload = {
        ...existing,
        fullName: form.fullName || existing.fullName || empty.fullName,
        phone: form.phone || null,
        email: form.email || null,
        telegram: form.telegram || null,
        max: form.max || null,
        website: form.website || null,
        personalTraits: existing.personalTraits || [],
        skills: existing.skills || [],
      }

      const saved = await api.put<Profile>('/api/profile', payload)
      setProfileId(saved.id)
      setForm({
        fullName: saved.fullName || empty.fullName,
        phone: saved.phone || '',
        email: saved.email || '',
        telegram: saved.telegram || '',
        max: saved.max || '',
        website: saved.website || empty.website,
      })
      setMessage('Контакты сохранены')
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-muted-foreground">Загрузка...</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Контакты</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Эти данные отображаются в разделе «Контакты» на сайте.
          {profileId ? '' : ' Профиль будет создан при первом сохранении.'}
        </p>

        <div className="space-y-2">
          <Label>ФИО (для профиля)</Label>
          <Input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Сотовый</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+7 900 000-00-00"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="mail@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Telegram</Label>
            <Input
              value={form.telegram}
              onChange={(e) => setForm({ ...form, telegram: e.target.value })}
              placeholder="@username или https://t.me/username"
            />
          </div>
          <div className="space-y-2">
            <Label>Max</Label>
            <Input
              value={form.max}
              onChange={(e) => setForm({ ...form, max: e.target.value })}
              placeholder="@username или ссылка"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Сайт</Label>
            <Input
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://shastudio.ru"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
          {message && <span className="text-sm text-muted-foreground">{message}</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
