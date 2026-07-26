'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  title: string
  loading: boolean
  error?: string
  message?: string
  emptyText?: string
  onCreate?: () => void
  createLabel?: string
  editing: boolean
  form?: React.ReactNode
  items: Array<{
    id?: string
    title: string
    subtitle?: string
    onEdit: () => void
    onDelete?: () => void
  }>
}

export function AdminCrudShell({
  title,
  loading,
  error,
  message,
  emptyText = 'Записей пока нет.',
  onCreate,
  createLabel = 'Добавить',
  editing,
  form,
  items,
}: Props) {
  if (editing && form) return <>{form}</>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {(error || message) && (
            <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-stone-500'}`}>
              {error || message}
            </p>
          )}
        </div>
        {onCreate && <Button onClick={onCreate}>{createLabel}</Button>}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Загрузка...</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id || item.title}>
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                  <span>{item.title}</span>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={item.onEdit}>
                      Редактировать
                    </Button>
                    {item.onDelete && (
                      <Button size="sm" variant="destructive" onClick={item.onDelete}>
                        Удалить
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              {item.subtitle && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
