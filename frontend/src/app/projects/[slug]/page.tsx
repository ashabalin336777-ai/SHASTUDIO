'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { SiteShell } from '@/components/site/SiteShell'
import { MeeloCard, MeeloButton } from '@/components/site/MeeloUI'
import { api } from '@/lib/api'
import type { Project } from '@/types/portfolio'

export default function ProjectDetailPage() {
  const params = useParams<{ slug: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!params.slug) return
    api
      .get<Project>(`/api/projects/${params.slug}`)
      .then(setProject)
      .catch(() => setError(true))
  }, [params.slug])

  if (error) {
    return (
      <SiteShell>
        <p className="text-muted-foreground">
          Проект не найден. <Link href="/projects">Назад</Link>
        </p>
      </SiteShell>
    )
  }

  if (!project) {
    return (
      <SiteShell>
        <p className="text-muted-foreground">Загрузка...</p>
      </SiteShell>
    )
  }

  return (
    <SiteShell>
      <Link href="/projects" className="text-sm font-medium text-muted-foreground hover:text-foreground">
        ← Проекты
      </Link>
      <MeeloCard tone="lavender" className="mt-5">
        <h1 className="text-4xl font-bold tracking-tight">{project.title}</h1>
        {project.description && (
          <p className="mt-4 text-lg text-muted-foreground">{project.description}</p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {project.demo && <MeeloButton href={project.demo}>Demo</MeeloButton>}
          {project.github && <MeeloButton href={project.github}>GitHub</MeeloButton>}
          {project.link && <MeeloButton href={project.link}>Link</MeeloButton>}
        </div>
      </MeeloCard>
      {project.content && (
        <MeeloCard tone="white" className="mt-4 whitespace-pre-wrap text-foreground/90">
          {project.content}
        </MeeloCard>
      )}
      <div className="mt-6 flex flex-wrap gap-2">
        {project.technologies.map((t) => (
          <span
            key={t}
            className="rounded-full border-2 border-foreground bg-background px-2.5 py-1 text-xs font-medium"
          >
            {t}
          </span>
        ))}
      </div>
    </SiteShell>
  )
}
