'use client'

import { useEffect, useState } from 'react'
import { SiteShell } from '@/components/site/SiteShell'
import { SectionPage } from '@/components/site/SectionPage'
import { MeeloCard } from '@/components/site/MeeloUI'
import { api } from '@/lib/api'
import type { Course } from '@/types/portfolio'

const TONES = ['mint', 'sky', 'pink', 'lavender'] as const

export default function CoursesPage() {
  const [items, setItems] = useState<Course[]>([])

  useEffect(() => {
    api
      .get<Course[]>('/api/courses')
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
  }, [])

  return (
    <SiteShell>
      <SectionPage
        section="courses"
        pill="COURSES"
        title="Курсы"
        description="Онлайн-обучение и дополнительные программы."
        stamp="SKILL UP"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item, index) => (
            <MeeloCard key={item.id} tone={TONES[index % TONES.length]}>
              <h2 className="text-lg font-bold">{item.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.provider}
                {item.platform ? ` · ${item.platform}` : ''}
              </p>
              {item.description && (
                <p className="mt-3 text-sm text-foreground/80">{item.description}</p>
              )}
            </MeeloCard>
          ))}
        </div>
        {items.length === 0 && <p className="text-muted-foreground">Пока нет записей.</p>}
      </SectionPage>
    </SiteShell>
  )
}
