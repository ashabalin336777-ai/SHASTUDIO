'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { StringListEditor } from '@/components/admin/StringListEditor'
import { api } from '@/lib/api'

type Course = {
  id?: string
  title: string
  provider: string
  platform?: string
  startDate?: string
  endDate?: string
  certificate?: string
  certificateUrl?: string
  description?: string
  skills: string[]
  isActive: boolean
  order: number
}

const blank = (): Course => ({
  title: '',
  provider: '',
  skills: [],
  isActive: true,
  order: 0,
})

export default function AdminCoursesPage() {
  const [items, setItems] = useState<Course[]>([])
  const [editing, setEditing] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setLoading(true)
      const data = await api.get<Course[]>('/api/courses')
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
      startDate: editing.startDate || null,
      endDate: editing.endDate || null,
    }
    if (editing.id) await api.put(`/api/courses/${editing.id}`, payload)
    else await api.post('/api/courses', payload)
    setEditing(null)
    load()
  }

  const remove = async (id?: string) => {
    if (!id) return
    await api.delete(`/api/courses/${id}`)
    load()
  }

  if (editing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{editing.id ? 'Редактировать' : 'Добавить'} курс</CardTitle>
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
              <Label>Провайдер</Label>
              <Input
                value={editing.provider}
                onChange={(e) => setEditing({ ...editing, provider: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Платформа</Label>
              <Input
                value={editing.platform || ''}
                onChange={(e) => setEditing({ ...editing, platform: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>URL сертификата</Label>
              <Input
                value={editing.certificateUrl || ''}
                onChange={(e) => setEditing({ ...editing, certificateUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Дата начала</Label>
              <Input
                type="date"
                value={editing.startDate?.slice(0, 10) || ''}
                onChange={(e) => setEditing({ ...editing, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Дата окончания</Label>
              <Input
                type="date"
                value={editing.endDate?.slice(0, 10) || ''}
                onChange={(e) => setEditing({ ...editing, endDate: e.target.value })}
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
          <StringListEditor
            label="Навыки"
            values={editing.skills}
            onChange={(skills) => setEditing({ ...editing, skills })}
          />
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
        <h1 className="text-3xl font-bold">Курсы</h1>
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
                    {item.title} — {item.provider}
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
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
