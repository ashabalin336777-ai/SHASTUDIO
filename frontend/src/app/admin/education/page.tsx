'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { AdminCrudShell } from '@/components/admin/AdminCrudShell'
import { useAdminCrud } from '@/hooks/useAdminCrud'
import type { Education } from '@/types/portfolio'

const blank = (): Education => ({
  institution: '',
  degree: '',
  startYear: new Date().getFullYear(),
  isCurrent: false,
  isActive: true,
  order: 0,
})

export default function AdminEducationPage() {
  const crud = useAdminCrud<Education>({ listPath: '/api/education', blank })

  const form = crud.editing ? (
    <Card>
      <CardHeader>
        <CardTitle>{crud.editing.id ? 'Редактировать' : 'Добавить'} образование</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {crud.error && <p className="text-sm text-red-600">{crud.error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Учебное заведение</Label>
            <Input
              value={crud.editing.institution}
              onChange={(e) =>
                crud.setEditing({ ...crud.editing!, institution: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Степень</Label>
            <Input
              value={crud.editing.degree}
              onChange={(e) => crud.setEditing({ ...crud.editing!, degree: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Специальность</Label>
            <Input
              value={crud.editing.field || ''}
              onChange={(e) => crud.setEditing({ ...crud.editing!, field: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Год начала</Label>
            <Input
              type="number"
              value={crud.editing.startYear}
              onChange={(e) =>
                crud.setEditing({
                  ...crud.editing!,
                  startYear: parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Год окончания</Label>
            <Input
              type="number"
              disabled={crud.editing.isCurrent}
              value={crud.editing.endYear || ''}
              onChange={(e) =>
                crud.setEditing({
                  ...crud.editing!,
                  endYear: parseInt(e.target.value) || undefined,
                })
              }
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={crud.editing.isCurrent}
            onCheckedChange={(checked) =>
              crud.setEditing({ ...crud.editing!, isCurrent: checked, endYear: undefined })
            }
          />
          <Label>Учусь сейчас</Label>
        </div>
        <div className="space-y-2">
          <Label>Описание</Label>
          <Textarea
            rows={3}
            value={crud.editing.description || ''}
            onChange={(e) =>
              crud.setEditing({ ...crud.editing!, description: e.target.value })
            }
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => crud.save()} disabled={crud.saving}>
            {crud.saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
          <Button variant="outline" onClick={crud.cancel}>
            Отмена
          </Button>
        </div>
      </CardContent>
    </Card>
  ) : null

  return (
    <AdminCrudShell
      title="Образование"
      loading={crud.loading}
      error={crud.error}
      message={crud.message}
      onCreate={() => crud.setEditing({ ...blank(), order: crud.items.length })}
      editing={!!crud.editing}
      form={form}
      items={crud.items.map((item) => ({
        id: item.id,
        title: `${item.degree} — ${item.institution}`,
        subtitle: `${item.startYear}${
          item.isCurrent ? ' — н.в.' : item.endYear ? ` — ${item.endYear}` : ''
        }${item.field ? ` · ${item.field}` : ''}`,
        onEdit: () => crud.startEdit(item),
        onDelete: () => crud.remove(item.id),
      }))}
    />
  )
}
