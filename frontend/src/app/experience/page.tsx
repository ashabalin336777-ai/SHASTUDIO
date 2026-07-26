'use client'

import { useEffect, useState } from 'react'
import { SiteShell } from '@/components/site/SiteShell'
import { SectionPage } from '@/components/site/SectionPage'
import { MeeloButton } from '@/components/site/MeeloUI'
import { api } from '@/lib/api'
import type { Experience } from '@/types/portfolio'

export default function ExperiencePage() {
  const [items, setItems] = useState<Experience[]>([])

  useEffect(() => {
    api
      .get<Experience[]>('/api/experience')
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
  }, [])

  return (
    <SiteShell>
      <SectionPage
        section="experience"
        pill="EXPERIENCE"
        title="Мой опыт"
        description="Карьерный путь в формате timeline — роли, компании и технологии."
        shape="arch"
        stamp="CAREER PATH"
        reverse
      >
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-muted-foreground">
              Ключевые места работы и зоны ответственности. Полный профиль — в разделе «Профиль».
            </p>
            <div className="mt-5">
              <MeeloButton href="/profile">Подробнее обо мне</MeeloButton>
            </div>
          </div>

          <div className="relative space-y-8 border-l-[3px] border-foreground pl-6">
            {items.map((exp, index) => (
              <article key={exp.id} className="relative">
                <span
                  className="absolute -left-[1.95rem] top-1.5 size-3.5 rounded-full border-2 border-foreground"
                  style={{
                    background:
                      index % 2 === 0 ? 'var(--meelo-sky)' : 'var(--meelo-pink)',
                  }}
                />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {exp.startMonth}/{exp.startYear} —{' '}
                  {exp.isCurrent ? 'н.в.' : `${exp.endMonth}/${exp.endYear}`}
                </p>
                <h2 className="mt-1 text-xl font-bold">
                  {exp.position} @ {exp.company}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {exp.city ? exp.city : ''}
                  {exp.country ? `${exp.city ? ', ' : ''}${exp.country}` : ''}
                  {exp.remote ? ' · remote' : ''}
                </p>
                {exp.description && <p className="mt-3 text-foreground/90">{exp.description}</p>}
                {exp.responsibilities.length > 0 && (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {exp.responsibilities.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                )}
                {exp.technologies.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {exp.technologies.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border-2 border-foreground bg-background px-2 py-0.5 text-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
            {items.length === 0 && (
              <p className="text-muted-foreground">Пока нет записей.</p>
            )}
          </div>
        </div>
      </SectionPage>
    </SiteShell>
  )
}
