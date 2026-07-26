'use client'

import { useEffect, useState } from 'react'
import { SiteShell } from '@/components/site/SiteShell'
import { SectionPage } from '@/components/site/SectionPage'
import { MeeloCard } from '@/components/site/MeeloUI'
import { api } from '@/lib/api'
import type { BlogPost } from '@/types/portfolio'

export default function BlogPage() {
  const [items, setItems] = useState<BlogPost[]>([])

  useEffect(() => {
    api
      .get<BlogPost[]>('/api/blog')
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
  }, [])

  return (
    <SiteShell>
      <SectionPage
        section="blog"
        pill="BLOG"
        title="Блог"
        description="Заметки, статьи и публикации."
        stamp="THOUGHTS"
      >
        <div className="space-y-4">
          {items.map((post) => (
            <MeeloCard key={post.id} tone="white">
              <h2 className="text-xl font-bold">{post.title}</h2>
              {post.excerpt && <p className="mt-2 text-muted-foreground">{post.excerpt}</p>}
              {!!post.tags?.length && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border-2 border-foreground bg-[var(--meelo-cream)] px-2 py-0.5 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </MeeloCard>
          ))}
        </div>
        {items.length === 0 && <p className="text-muted-foreground">Пока нет публикаций.</p>}
      </SectionPage>
    </SiteShell>
  )
}
