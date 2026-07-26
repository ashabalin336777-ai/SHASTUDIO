'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'

type Certificate = {
  id?: string
  title: string
  issuer: string
  issuerLogo?: string
  issueDate: string
  expiryDate?: string
  credentialId?: string
  credentialUrl?: string
  image?: string
  description?: string
  isActive: boolean
  order: number
}

const blank = (): Certificate => ({
  title: '',
  issuer: '',
  issueDate: new Date().toISOString().slice(0, 10),
  isActive: true,
  order: 0,
})

export default function AdminCertificatesPage() {
  const [items, setItems] = useState<Certificate[]>([])
  const [editing, setEditing] = useState<Certificate | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const data = await api.get<Certificate[]>('/api/certificates')
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const save = async () => {
    if (!editing) return
    const payload = {
      ...editing,
      issueDate: editing.issueDate,
      expiryDate: editing.expiryDate || null,
    }
    if (editing.id) await api.put(`/api/certificates/${editing.id}`, payload)
    else await api.post('/api/certificates', payload)
    setEditing(null)
    load()
  }

  const remove = async (id?: string) => {
    if (!id) return
    await api.delete(`/api/certificates/${id}`)
    load()
  }

  if (editing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{editing.id ? 'Редактировать' : 'Добавить'} сертификат</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Издатель</Label>
              <Input
                value={editing.issuer}
                onChange={(e) => setEditing({ ...editing, issuer: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Дата выдачи</Label>
              <Input
                type="date"
                value={editing.issueDate?.slice(0, 10) || ''}
                onChange={(e) => setEditing({ ...editing, issueDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Срок действия</Label>
              <Input
                type="date"
                value={editing.expiryDate?.slice(0, 10) || ''}
                onChange={(e) => setEditing({ ...editing, expiryDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Credential ID</Label>
              <Input
                value={editing.credentialId || ''}
                onChange={(e) => setEditing({ ...editing, credentialId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Credential URL</Label>
              <Input
                value={editing.credentialUrl || ''}
                onChange={(e) => setEditing({ ...editing, credentialUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Image URL</Label>
              <Input
                value={editing.image || ''}
                onChange={(e) => setEditing({ ...editing, image: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea
              rows={3}
              value={editing.description || ''}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={save}>Сохранить</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Сертификаты</h1>
        <Button onClick={() => setEditing({ ...blank(), order: items.length })}>
          Добавить
        </Button>
      </div>
      {loading ? (
        <p className="text-muted-foreground">Загрузка...</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">Записей пока нет.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    {item.title} — {item.issuer}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setEditing(item)}>
                      Редактировать
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(item.id)}>
                      Удалить
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {item.issueDate?.slice(0, 10)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
