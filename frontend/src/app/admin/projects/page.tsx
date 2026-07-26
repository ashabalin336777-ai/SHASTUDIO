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
import { slugify } from '@/lib/slugify'
import type { Project } from '@/types/portfolio'

const blank = (): Project => ({
  title: '',
  slug: '',
  images: [],
  tags: [],
  technologies: [],
  isActive: true,
  featured: false,
  order: 0,
})

export default function AdminProjectsPage() {
  const crud = useAdminCrud<Project>({ listPath: '/api/projects', blank })

  const form = crud.editing ? (
    <Card>
      <CardHeader>
        <CardTitle>{crud.editing.id ? 'Редактировать' : 'Добавить'} проект</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {crud.error && <p className="text-sm text-red-600">{crud.error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Название</Label>
            <Input
              value={crud.editing.title}
              onChange={(e) => {
                const title = e.target.value
                crud.setEditing({
                  ...crud.editing!,
                  title,
                  slug: crud.editing!.id ? crud.editing!.slug : slugify(title),
                })
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              value={crud.editing.slug}
              onChange={(e) => crud.setEditing({ ...crud.editing!, slug: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Категория</Label>
            <Input
              value={crud.editing.category || ''}
              onChange={(e) => crud.setEditing({ ...crud.editing!, category: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Demo</Label>
            <Input
              value={crud.editing.demo || ''}
              onChange={(e) => crud.setEditing({ ...crud.editing!, demo: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>GitHub</Label>
            <Input
              value={crud.editing.github || ''}
              onChange={(e) => crud.setEditing({ ...crud.editing!, github: e.target.value })}
            />
          </div>
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
        <div className="space-y-2">
          <Label>Контент</Label>
          <Textarea
            rows={6}
            value={crud.editing.content || ''}
            onChange={(e) => crud.setEditing({ ...crud.editing!, content: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={crud.editing.featured}
            onCheckedChange={(checked) =>
              crud.setEditing({ ...crud.editing!, featured: checked })
            }
          />
          <Label>Featured</Label>
        </div>
        <StringListEditor
          label="Теги"
          values={crud.editing.tags}
          onChange={(tags) => crud.setEditing({ ...crud.editing!, tags })}
        />
        <StringListEditor
          label="Технологии"
          values={crud.editing.technologies}
          onChange={(technologies) => crud.setEditing({ ...crud.editing!, technologies })}
        />
        <div className="flex gap-2">
          <Button
            onClick={() =>
              crud.save({
                ...crud.editing!,
                slug: crud.editing!.slug || slugify(crud.editing!.title),
              })
            }
            disabled={crud.saving}
          >
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
      title="Проекты"
      loading={crud.loading}
      error={crud.error}
      message={crud.message}
      onCreate={() => crud.setEditing({ ...blank(), order: crud.items.length })}
      editing={!!crud.editing}
      form={form}
      items={crud.items.map((item) => ({
        id: item.id,
        title: `${item.title}${item.featured ? ' ★' : ''}`,
        subtitle: item.description,
        onEdit: () => crud.startEdit(item),
        onDelete: () => crud.remove(item.id),
      }))}
    />
  )
}
