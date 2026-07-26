'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'

export default function AdminGeneratePage() {
  const [section, setSection] = useState('about')
  const [prompt, setPrompt] = useState(
    'Напиши короткое введение о владельце сайта для hero-секции на основе профиля и опыта.'
  )
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await api.post<{ content: string }>('/api/context/generate', {
        section,
        prompt,
      })
      setResult(data.content)
    } catch (e) {
      console.error(e)
      setError('Не удалось сгенерировать. Проверьте VSELLM_API_KEY и backend.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI генерация разделов</h1>
        <p className="mt-2 text-stone-600">
          Черновик сохраняется в SiteContext и попадает в контекст AI-чата.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Генератор</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Раздел</Label>
            <Input value={section} onChange={(e) => setSection(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Промпт</Label>
            <Textarea rows={5} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          </div>
          <Button onClick={generate} disabled={loading || !section.trim() || !prompt.trim()}>
            {loading ? 'Генерация...' : 'Сгенерировать'}
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {result && (
            <div className="rounded-md border bg-muted p-4 whitespace-pre-wrap text-sm">
              {result}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
