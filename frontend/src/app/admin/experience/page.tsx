'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { StringListEditor } from '@/components/admin/StringListEditor'
import { AdminCrudShell } from '@/components/admin/AdminCrudShell'
import { useAdminCrud } from '@/hooks/useAdminCrud'
import type { Experience } from '@/types/portfolio'

const blank = (): Experience => ({
  company: '',
  position: '',
  startYear: new Date().getFullYear(),
  startMonth: 1,
  isCurrent: false,
  remote: false,
  responsibilities: [],
  achievements: [],
  technologies: [],
  isActive: true,
  order: 0,
})

export default function AdminExperiencePage() {
  const crud = useAdminCrud<Experience>({
    listPath: '/api/experience',
    blank,
  })

  const form = crud.editing ? (
    <Card>
      <CardHeader>
        <CardTitle>{crud.editing.id ? 'Редактировать' : 'Добавить'} опыт работы</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {crud.error && <p className="text-sm text-red-600">{crud.error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Компания</Label>
            <Input
              value={crud.editing.company}
              onChange={(e) => crud.setEditing({ ...crud.editing!, company: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Должность</Label>
            <Input
              value={crud.editing.position}
              onChange={(e) => crud.setEditing({ ...crud.editing!, position: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
            <Label>Месяц начала</Label>
            <Input
              type="number"
              min={1}
              max={12}
              value={crud.editing.startMonth}
              onChange={(e) =>
                crud.setEditing({
                  ...crud.editing!,
                  startMonth: parseInt(e.target.value) || 1,
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
          <div className="space-y-2">
            <Label>Месяц окончания</Label>
            <Input
              type="number"
              min={1}
              max={12}
              disabled={crud.editing.isCurrent}
              value={crud.editing.endMonth || ''}
              onChange={(e) =>
                crud.setEditing({
                  ...crud.editing!,
                  endMonth: parseInt(e.target.value) || undefined,
                })
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={crud.editing.isCurrent}
            onCheckedChange={(checked) =>
              crud.setEditing({
                ...crud.editing!,
                isCurrent: checked,
                endYear: undefined,
                endMonth: undefined,
              })
            }
          />
          <Label>Текущее место работы</Label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Город</Label>
            <Input
              value={crud.editing.city || ''}
              onChange={(e) => crud.setEditing({ ...crud.editing!, city: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Страна</Label>
            <Input
              value={crud.editing.country || ''}
              onChange={(e) => crud.setEditing({ ...crud.editing!, country: e.target.value })}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={crud.editing.remote}
            onCheckedChange={(checked) =>
              crud.setEditing({ ...crud.editing!, remote: checked })
            }
          />
          <Label>Удаленная работа</Label>
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

        <StringListEditor
          label="Обязанности"
          values={crud.editing.responsibilities}
          onChange={(responsibilities) =>
            crud.setEditing({ ...crud.editing!, responsibilities })
          }
        />
        <StringListEditor
          label="Достижения"
          values={crud.editing.achievements}
          onChange={(achievements) => crud.setEditing({ ...crud.editing!, achievements })}
        />
        <StringListEditor
          label="Технологии"
          values={crud.editing.technologies}
          onChange={(technologies) => crud.setEditing({ ...crud.editing!, technologies })}
        />

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
      title="Управление опытом работы"
      loading={crud.loading}
      error={crud.error}
      message={crud.message}
      onCreate={() => crud.setEditing({ ...blank(), order: crud.items.length })}
      editing={!!crud.editing}
      form={form}
      items={crud.items.map((exp) => ({
        id: exp.id,
        title: `${exp.position} @ ${exp.company}`,
        subtitle: `${exp.startMonth}/${exp.startYear} — ${
          exp.isCurrent ? 'н.в.' : `${exp.endMonth}/${exp.endYear}`
        }${exp.city ? `, ${exp.city}` : ''}${exp.remote ? ' · remote' : ''}`,
        onEdit: () => crud.startEdit(exp),
        onDelete: () => crud.remove(exp.id),
      }))}
    />
  )
}
