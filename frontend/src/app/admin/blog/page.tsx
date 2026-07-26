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
import type { BlogPost } from '@/types/portfolio'

const blank = (): BlogPost => ({
  title: '',
  slug: '',
  content: '',
  tags: [],
  isPublished: false,
  publishedAt: null,
})

export default function AdminBlogPage() {
  const crud = useAdminCrud<BlogPost>({ listPath: '/api/blog/all', blank })

  const form = crud.editing ? (
    <Card>
      <CardHeader>
        <CardTitle>{crud.editing.id ? 'Редактировать' : 'Добавить'} пост</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {crud.error && <p className="text-sm text-red-600">{crud.error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Заголовок</Label>
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
        </div>
        <div className="space-y-2">
          <Label>Excerpt</Label>
          <Textarea
            rows={2}
            value={crud.editing.excerpt || ''}
            onChange={(e) => crud.setEditing({ ...crud.editing!, excerpt: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Контент</Label>
          <Textarea
            rows={10}
            value={crud.editing.content}
            onChange={(e) => crud.setEditing({ ...crud.editing!, content: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={crud.editing.isPublished}
            onCheckedChange={(checked) =>
              crud.setEditing({ ...crud.editing!, isPublished: checked })
            }
          />
          <Label>Опубликован</Label>
        </div>
        <StringListEditor
          label="Теги"
          values={crud.editing.tags}
          onChange={(tags) => crud.setEditing({ ...crud.editing!, tags })}
        />
        <div className="flex gap-2">
          <Button
            onClick={() =>
              crud.save({
                ...crud.editing!,
                slug: crud.editing!.slug || slugify(crud.editing!.title),
                publishedAt:
                  crud.editing!.isPublished && !crud.editing!.publishedAt
                    ? new Date().toISOString()
                    : crud.editing!.publishedAt,
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
      title="Блог"
      loading={crud.loading}
      error={crud.error}
      message={crud.message}
      onCreate={crud.startCreate}
      editing={!!crud.editing}
      form={form}
      items={crud.items.map((item) => ({
        id: item.id,
        title: `${item.title}${item.isPublished ? '' : ' (черновик)'}`,
        subtitle: item.excerpt,
        onEdit: () => crud.startEdit(item),
        onDelete: () => crud.remove(item.id),
      }))}
    />
  )
}
