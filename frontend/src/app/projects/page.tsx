'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SiteShell } from '@/components/site/SiteShell'
import { SectionPage } from '@/components/site/SectionPage'
import { MeeloCard } from '@/components/site/MeeloUI'
import { api } from '@/lib/api'
import type { Project } from '@/types/portfolio'

const TONES = ['lavender', 'pink', 'sky', 'mint'] as const

export default function ProjectsPage() {
  const [items, setItems] = useState<Project[]>([])

  useEffect(() => {
    api
      .get<Project[]>('/api/projects')
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
  }, [])

  return (
    <SiteShell>
      <SectionPage
        section="projects"
        pill="PORTFOLIO"
        title="Проекты"
        description="Кейсы и продуктовые решения из портфолио."
        stamp="SELECTED WORK"
        shape="arch"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((project, index) => (
            <Link key={project.id} href={`/projects/${project.slug}`} className="block">
              <MeeloCard
                tone={TONES[index % TONES.length]}
                className="h-full transition hover:-translate-y-0.5"
              >
                <h2 className="text-lg font-bold">
                  {project.title}
                  {project.featured ? ' ★' : ''}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.technologies.slice(0, 5).map((t) => (
                    <span
                      key={t}
                      className="rounded-full border-2 border-foreground bg-background px-2 py-0.5 text-xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </MeeloCard>
            </Link>
          ))}
        </div>
        {items.length === 0 && <p className="text-muted-foreground">Пока нет проектов.</p>}
      </SectionPage>
    </SiteShell>
  )
}
