'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { StringListEditor } from '@/components/admin/StringListEditor'
import { api } from '@/lib/api'

type Profile = {
  id?: string
  fullName: string
  title?: string
  bio?: string
  avatar?: string
  location?: string
  email?: string
  phone?: string
  website?: string
  telegram?: string
  max?: string
  github?: string
  linkedin?: string
  mbtiType?: string
  personalTraits: string[]
  skills: string[]
}

const empty: Profile = {
  fullName: '',
  title: '',
  bio: '',
  avatar: '',
  location: '',
  email: '',
  phone: '',
  website: '',
  telegram: '',
  max: '',
  github: '',
  linkedin: '',
  mbtiType: '',
  personalTraits: [],
  skills: [],
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Profile>(empty)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    api
      .get<Partial<Profile>>('/api/profile')
      .then((data) => {
        setProfile({
          ...empty,
          ...data,
          personalTraits: data.personalTraits || [],
          skills: data.skills || [],
        })
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    try {
      setSaving(true)
      setMessage('')
      const saved = await api.put<Profile>('/api/profile', profile)
      setProfile({
        ...empty,
        ...saved,
        personalTraits: saved.personalTraits || [],
        skills: saved.skills || [],
      })
      setMessage('Профиль сохранён')
    } catch (error) {
      console.error(error)
      setMessage('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-muted-foreground">Загрузка...</p>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Профиль</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>ФИО</Label>
            <Input
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Должность / title</Label>
            <Input
              value={profile.title || ''}
              onChange={(e) => setProfile({ ...profile, title: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Bio</Label>
          <Textarea
            rows={4}
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Локация</Label>
            <Input
              value={profile.location || ''}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>MBTI</Label>
            <Input
              value={profile.mbtiType || ''}
              onChange={(e) => setProfile({ ...profile, mbtiType: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={profile.email || ''}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Телефон</Label>
            <Input
              value={profile.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input
              value={profile.website || ''}
              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Telegram</Label>
            <Input
              value={profile.telegram || ''}
              onChange={(e) => setProfile({ ...profile, telegram: e.target.value })}
              placeholder="@username"
            />
          </div>
          <div className="space-y-2">
            <Label>Max</Label>
            <Input
              value={profile.max || ''}
              onChange={(e) => setProfile({ ...profile, max: e.target.value })}
              placeholder="@username"
            />
          </div>
          <div className="space-y-2">
            <Label>Avatar URL</Label>
            <Input
              value={profile.avatar || ''}
              onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>GitHub</Label>
            <Input
              value={profile.github || ''}
              onChange={(e) => setProfile({ ...profile, github: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>LinkedIn</Label>
            <Input
              value={profile.linkedin || ''}
              onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
            />
          </div>
        </div>

        <StringListEditor
          label="Личные качества"
          values={profile.personalTraits}
          placeholder="Например: системное мышление"
          onChange={(personalTraits) => setProfile({ ...profile, personalTraits })}
        />
        <StringListEditor
          label="Навыки"
          values={profile.skills}
          placeholder="Например: TypeScript"
          onChange={(skills) => setProfile({ ...profile, skills })}
        />

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving || !profile.fullName.trim()}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
          {message && <span className="text-sm text-muted-foreground">{message}</span>}
        </div>
      </CardContent>
    </Card>
  )
}
