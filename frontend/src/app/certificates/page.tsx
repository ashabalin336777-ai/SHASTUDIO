'use client'

import { useEffect, useState } from 'react'
import { SiteShell } from '@/components/site/SiteShell'
import { SectionPage } from '@/components/site/SectionPage'
import { api, resolveMediaUrl } from '@/lib/api'
import type { Certificate } from '@/types/portfolio'

function isPdf(url?: string | null) {
  return !!url && /\.pdf($|\?)/i.test(url)
}

function formatDate(value?: string | null) {
  if (!value) return null
  const day = value.slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null
}

export default function CertificatesPage() {
  const [items, setItems] = useState<Certificate[]>([])

  useEffect(() => {
    api
      .get<Certificate[]>('/api/certificates')
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
  }, [])

  return (
    <SiteShell>
      <SectionPage
        section="certificates"
        pill="CERTIFICATES"
        title="Сертификаты"
        description="Профессиональные сертификаты и подтверждения."
        stamp="VERIFIED"
      >
        <div className="space-y-5">
          {items.map((item) => {
            const fileUrl = resolveMediaUrl(item.image)
            const pdf = isPdf(item.image)
            const issueDate = formatDate(item.issueDate)
            const meta = [item.issuer?.trim(), issueDate].filter(Boolean)
            const description = item.description?.trim()

            return (
              <article
                key={item.id}
                className="grid gap-4 overflow-hidden rounded-2xl border-2 border-foreground/20 bg-background p-3 transition-shadow hover:shadow-lg sm:grid-cols-[minmax(9rem,14rem)_1fr] sm:gap-5 sm:p-4"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-900">
                  {fileUrl ? (
                    pdf ? (
                      <>
                        <iframe
                          src={`${fileUrl}#toolbar=0&navpanes=0&view=FitH`}
                          title={item.title}
                          className="absolute inset-0 h-full w-full border-0 bg-stone-100"
                        />
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute inset-0 z-10"
                          aria-label={`Открыть PDF: ${item.title}`}
                        />
                        <div className="pointer-events-none absolute right-2 top-2 z-20 rounded-md border border-foreground/20 bg-background/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                          PDF
                        </div>
                      </>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={fileUrl}
                        alt={item.title}
                        className="h-full w-full object-contain p-2"
                      />
                    )
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                      Нет превью
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-col justify-center py-1">
                  <h2 className="text-lg font-bold leading-snug text-foreground sm:text-xl">
                    {item.title}
                  </h2>
                  {meta.length > 0 && (
                    <p className="mt-1 text-sm text-muted-foreground">{meta.join(' · ')}</p>
                  )}
                  {description && (
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/85 sm:text-[0.95rem]">
                      {description}
                    </p>
                  )}
                  {item.credentialUrl?.trim() && (
                    <a
                      href={item.credentialUrl.trim()}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 w-fit text-sm font-medium underline-offset-4 hover:underline"
                    >
                      Проверить credential
                    </a>
                  )}
                </div>
              </article>
            )
          })}
        </div>
        {items.length === 0 && <p className="text-muted-foreground">Пока нет записей.</p>}
      </SectionPage>
    </SiteShell>
  )
}
