'use client'

import { useEffect, useState } from 'react'
import { SiteShell } from '@/components/site/SiteShell'
import { SectionPage } from '@/components/site/SectionPage'
import { MeeloCard } from '@/components/site/MeeloUI'
import { api } from '@/lib/api'
import type { Education } from '@/types/portfolio'

const TONES = ['lavender', 'mint', 'pink', 'sky'] as const

export default function EducationPage() {
  const [items, setItems] = useState<Education[]>([])

  useEffect(() => {
    api
      .get<Education[]>('/api/education')
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
  }, [])

  return (
    <SiteShell>
      <SectionPage
        section="education"
        pill="EDUCATION"
        title="Образование"
        description="Учебные заведения, степени и направления."
        stamp="LEARN MODE"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item, index) => (
            <MeeloCard key={item.id} tone={TONES[index % TONES.length]}>
              <h2 className="text-xl font-bold">
                {item.degree} — {item.institution}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.startYear}
                {item.isCurrent ? ' — н.в.' : item.endYear ? ` — ${item.endYear}` : ''}
                {item.field ? ` · ${item.field}` : ''}
              </p>
              {item.description && <p className="mt-3 text-foreground/90">{item.description}</p>}
            </MeeloCard>
          ))}
        </div>
        {items.length === 0 && <p className="text-muted-foreground">Пока нет записей.</p>}
      </SectionPage>
    </SiteShell>
  )
}
