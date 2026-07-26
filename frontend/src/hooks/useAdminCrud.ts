'use client'

import { useCallback, useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Entity = { id?: string }

type Options<T extends Entity> = {
  listPath: string
  itemPath?: (id: string) => string
  blank: () => T
}

export function useAdminCrud<T extends Entity>(options: Options<T>) {
  const [items, setItems] = useState<T[]>([])
  const [editing, setEditing] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await api.get<T[]>(options.listPath)
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
      setItems([])
      setError('Не удалось загрузить данные')
    } finally {
      setLoading(false)
    }
  }, [options.listPath])

  useEffect(() => {
    load()
  }, [load])

  const startCreate = () => setEditing(options.blank())
  const startEdit = (item: T) => setEditing(item)
  const cancel = () => setEditing(null)

  const save = async (payload?: T) => {
    const data = payload ?? editing
    if (!data) return

    try {
      setSaving(true)
      setError('')
      setMessage('')
      const path = data.id
        ? (options.itemPath?.(data.id) ?? `${options.listPath}/${data.id}`)
        : options.listPath
      if (data.id) await api.put(path, data)
      else await api.post(path, data)
      setEditing(null)
      setMessage('Сохранено')
      await load()
    } catch (e) {
      console.error(e)
      setError('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id?: string) => {
    if (!id) return
    try {
      setError('')
      const path = options.itemPath?.(id) ?? `${options.listPath}/${id}`
      await api.delete(path)
      await load()
    } catch (e) {
      console.error(e)
      setError('Ошибка удаления')
    }
  }

  return {
    items,
    editing,
    setEditing,
    loading,
    saving,
    error,
    message,
    load,
    startCreate,
    startEdit,
    cancel,
    save,
    remove,
  }
}
