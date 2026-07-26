'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SiteShell } from '@/components/site/SiteShell'
import { SectionVisual } from '@/components/site/SectionVisual'
import { MeeloButton, MeeloCard, SectionPill, SquiggleTitle } from '@/components/site/MeeloUI'
import { api } from '@/lib/api'
import { SITE_NAV } from '@/lib/site-nav'
import type { BlogPost, Certificate, Course, Education, Experience, Profile, Project } from '@/types/portfolio'

const TONES = ['lavender', 'mint', 'pink', 'sky', 'cream', 'white'] as const

export default function Home() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [profile, setProfile] = useState<Partial<Profile> | null>(null)

  useEffect(() => {
    api
      .get<Partial<Profile>>('/api/profile')
      .then((data) => setProfile(data.fullName ? data : null))
      .catch(() => setProfile(null))

    Promise.all([
      api.get<Experience[]>('/api/experience').catch(() => []),
      api.get<Education[]>('/api/education').catch(() => []),
      api.get<Course[]>('/api/courses').catch(() => []),
      api.get<Project[]>('/api/projects').catch(() => []),
      api.get<BlogPost[]>('/api/blog').catch(() => []),
      api.get<Certificate[]>('/api/certificates').catch(() => []),
    ]).then(([experience, education, courses, projects, blog, certificates]) => {
      setCounts({
        '/experience': Array.isArray(experience) ? experience.length : 0,
        '/education': Array.isArray(education) ? education.length : 0,
        '/courses': Array.isArray(courses) ? courses.length : 0,
        '/projects': Array.isArray(projects) ? projects.length : 0,
        '/blog': Array.isArray(blog) ? blog.length : 0,
        '/certificates': Array.isArray(certificates) ? certificates.length : 0,
      })
    })
  }, [])

  const sections = SITE_NAV.filter((item) => item.href !== '/')
  const name = profile?.fullName || 'Шабалин Андрей Юрьевич'
  const title = profile?.title || 'продуктовый разработчик'

  return (
    <SiteShell>
      <section className="grid items-center gap-10 pb-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <SectionPill>HELLO!</SectionPill>
          <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight text-foreground md:text-5xl lg:text-[3.35rem]">
            <SquiggleTitle accent="продуктовый">
              {`Я ${name}, ${title}.`}
            </SquiggleTitle>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {profile?.bio ||
              'Обзор разделов портфолио ShaStudio — профиль, опыт, проекты и контакты в одном месте.'}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <MeeloButton href="/projects">Смотреть проекты</MeeloButton>
            <MeeloButton href="/contacts" className="bg-[var(--meelo-mint)]">
              Контакты
            </MeeloButton>
          </div>
        </div>

        <SectionVisual
          section="hero"
          mode="hero"
          shape="arch"
          stamp="I AM AVAILABLE"
          className="lg:justify-self-end"
        />
      </section>

      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <SectionPill>РАЗДЕЛЫ</SectionPill>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Что внутри</h2>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section, index) => (
            <Link key={section.href} href={section.href} className="block">
              <MeeloCard tone={TONES[index % TONES.length]} className="h-full transition hover:-translate-y-0.5">
                <h3 className="text-lg font-bold text-foreground">
                  {'emoji' in section && section.emoji ? (
                    <span className="mr-1.5" aria-hidden>
                      {section.emoji}
                    </span>
                  ) : null}
                  {section.label}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {section.href === '/profile'
                    ? 'Личная информация и навыки'
                    : section.href === '/contacts'
                      ? 'Телефон, email, Telegram, Max, сайт'
                      : section.href === '/assistant'
                        ? 'Чат с AI-помощником 🧠'
                        : counts[section.href] !== undefined
                          ? `${counts[section.href]} записей`
                          : 'Открыть раздел'}
                </p>
              </MeeloCard>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  )
}
