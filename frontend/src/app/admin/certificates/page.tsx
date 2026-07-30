'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { api, resolveMediaUrl } from '@/lib/api'

type Certificate = {
  id?: string
  title: string
  issuer: string
  issuerLogo?: string
  issueDate?: string
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
  issueDate: '',
  isActive: true,
  order: 0,
})

function isPdf(url?: string | null) {
  return !!url && /\.pdf($|\?)/i.test(url)
}

export default function AdminCertificatesPage() {
  const [items, setItems] = useState<Certificate[]>([])
  const [editing, setEditing] = useState<Certificate | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    setError(null)
    try {
      const payload = {
        ...editing,
        issuer: editing.issuer?.trim() || '',
        issueDate: editing.issueDate?.trim() || null,
        expiryDate: editing.expiryDate?.trim() || null,
        credentialId: editing.credentialId?.trim() || null,
        credentialUrl: editing.credentialUrl?.trim() || null,
        description: editing.description?.trim() || null,
        image: editing.image?.trim() || null,
      }
      if (editing.id) await api.put(`/api/certificates/${editing.id}`, payload)
      else await api.post('/api/certificates', payload)
      setEditing(null)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    }
  }

  const remove = async (id?: string) => {
    if (!id) return
    await api.delete(`/api/certificates/${id}`)
    load()
  }

  const uploadFile = async (file: File | null) => {
    if (!file || !editing) return
    setUploading(true)
    setError(null)
    try {
      const result = await api.upload<{ url: string }>('/api/uploads', file)
      setEditing({ ...editing, image: result.url })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки файла')
    } finally {
      setUploading(false)
    }
  }

  if (editing) {
    const preview = resolveMediaUrl(editing.image)
    return (
      <Card>
        <CardHeader>
          <CardTitle>{editing.id ? 'Редактировать' : 'Добавить'} сертификат</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
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
          </div>

          <div className="space-y-3 rounded-xl border border-stone-200 p-4">
            <Label>Файл сертификата (картинка или PDF)</Label>
            <Input
              type="file"
              accept="image/*,application/pdf,.pdf"
              disabled={uploading}
              onChange={(e) => {
                void uploadFile(e.target.files?.[0] || null)
                e.target.value = ''
              }}
            />
            {uploading && <p className="text-xs text-stone-500">Загрузка...</p>}

            <div className="space-y-2">
              <Label>Или URL файла</Label>
              <Input
                value={editing.image || ''}
                onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                placeholder="/uploads/... или https://..."
              />
            </div>

            {preview && (
              <div className="mt-2 space-y-2">
                {isPdf(editing.image) ? (
                  <>
                    <div className="relative aspect-[3/4] max-h-72 w-full max-w-xs overflow-hidden rounded-lg border bg-stone-100">
                      <iframe
                        src={`${preview}#toolbar=0&navpanes=0&view=FitH`}
                        title="Превью PDF"
                        className="absolute inset-0 h-full w-full border-0"
                      />
                    </div>
                    <a
                      href={preview}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium underline-offset-4 hover:underline"
                    >
                      Открыть PDF
                    </a>
                  </>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt="Превью сертификата"
                    className="max-h-48 rounded-lg border object-contain"
                  />
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea
              rows={8}
              value={editing.description || ''}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              placeholder="Что даёт сертификат, программа, навыки — по строкам"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={uploading}>
              Сохранить
            </Button>
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
                  {[
                    item.issueDate?.slice(0, 10),
                    item.image ? `файл: ${isPdf(item.image) ? 'PDF' : 'изображение'}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'Без даты и файла'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
