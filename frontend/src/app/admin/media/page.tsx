'use client'

import { useEffect, useState } from 'react'
import { api, resolveMediaUrl } from '@/lib/api'
import { MEDIA_SECTIONS, type MediaSectionKey } from '@/lib/media-sections'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type MediaMap = Record<string, string | null>

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaMap>({})
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const data = await api.get<{ media: MediaMap }>('/api/media')
    setMedia(data.media || {})
    const next: Record<string, string> = {}
    for (const section of MEDIA_SECTIONS) {
      next[section.key] = data.media?.[section.key] || ''
    }
    setUrls(next)
  }

  useEffect(() => {
    load().catch((err) => setError(err instanceof Error ? err.message : 'Ошибка загрузки'))
  }, [])

  async function saveUrl(section: MediaSectionKey) {
    setBusy(section)
    setError(null)
    setMessage(null)
    try {
      await api.put(`/api/media/${section}`, {
        imageUrl: urls[section]?.trim() || null,
      })
      await load()
      setMessage(`Сохранено: ${section}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setBusy(null)
    }
  }

  async function uploadFile(section: MediaSectionKey, file: File | null, input?: HTMLInputElement | null) {
    if (!file) return
    setBusy(section)
    setError(null)
    setMessage(null)
    try {
      const item = await api.upload<{ section: string; imageUrl: string | null }>(
        `/api/media/${section}/upload`,
        file
      )
      await load()
      setMessage(`Загружено: ${section}${item.imageUrl ? ` → ${item.imageUrl}` : ''}`)
      if (input) input.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки файла')
    } finally {
      setBusy(null)
    }
  }

  async function clearImage(section: MediaSectionKey) {
    setBusy(section)
    setError(null)
    setMessage(null)
    try {
      await api.delete(`/api/media/${section}`)
      await load()
      setMessage(`Очищено: ${section}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка очистки')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Фото разделов</h1>
        <p className="mt-2 text-stone-600">
          На обзоре показывается начальное фото. В разделе сначала большой логотип, затем фото
          раздела (если загружено). Без фото остаётся логотип.
        </p>
      </div>

      {message && <p className="text-sm text-emerald-700">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        {MEDIA_SECTIONS.map((section) => {
          const preview = resolveMediaUrl(media[section.key])
          return (
            <Card key={section.key}>
              <CardHeader>
                <CardTitle className="text-lg">{section.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex h-40 items-center justify-center overflow-hidden rounded-xl border bg-stone-50">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src="/brand/shastudio-logo.png"
                      alt="logo"
                      className="max-h-24 w-auto object-contain"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`file-${section.key}`}>Загрузить файл</Label>
                  <Input
                    id={`file-${section.key}`}
                    type="file"
                    accept="image/*"
                    disabled={busy === section.key}
                    onChange={(e) =>
                      uploadFile(section.key, e.target.files?.[0] || null, e.target)
                    }
                  />
                  {busy === section.key && (
                    <p className="text-xs text-stone-500">Загрузка...</p>
                  )}                </div>

                <div className="space-y-2">
                  <Label htmlFor={`url-${section.key}`}>Или URL</Label>
                  <Input
                    id={`url-${section.key}`}
                    value={urls[section.key] || ''}
                    onChange={(e) =>
                      setUrls((prev) => ({ ...prev, [section.key]: e.target.value }))
                    }
                    placeholder="/uploads/... или https://..."
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => saveUrl(section.key)}
                    disabled={busy === section.key}
                  >
                    Сохранить URL
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => clearImage(section.key)}
                    disabled={busy === section.key}
                  >
                    Убрать фото
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
