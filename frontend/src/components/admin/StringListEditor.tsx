'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
  label: string
  values: string[]
  placeholder?: string
  onChange: (values: string[]) => void
}

export function StringListEditor({ label, values, placeholder, onChange }: Props) {
  const [draft, setDraft] = useState('')

  const add = () => {
    const value = draft.trim()
    if (!value) return
    onChange([...values, value])
    setDraft('')
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder || 'Добавить'}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
        />
        <Button type="button" onClick={add}>
          Добавить
        </Button>
      </div>
      <ul className="space-y-1">
        {values.map((item, idx) => (
          <li key={`${item}-${idx}`} className="flex items-center justify-between rounded bg-muted p-2 text-sm">
            <span>{item}</span>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onChange(values.filter((_, i) => i !== idx))}
            >
              Удалить
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
