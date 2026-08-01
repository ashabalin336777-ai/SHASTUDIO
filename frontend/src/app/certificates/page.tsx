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

function CertificateMedia({
  title,
  fileUrl,
  pdf,
}: {
  title: string
  fileUrl: string | null
  pdf: boolean
}) {
  if (!fileUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        Нет превью
      </div>
    )
  }

  if (!pdf) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={fileUrl} alt={title} className="h-full w-full object-contain p-2" />
    )
  }

  return (
    <>
      {/* Visible if the browser PDF plugin fails to paint */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-stone-100 px-4 text-center dark:bg-stone-900">
        <span className="rounded-md border border-foreground/20 bg-background px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
          PDF
        </span>
        <span className="line-clamp-3 text-sm font-semibold text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">Нажмите, чтобы открыть</span>
      </div>
      <iframe
        src={`${fileUrl}#toolbar=0&navpanes=0&view=FitH`}
        title={title}
        className="absolute inset-0 z-[1] h-full w-full border-0 bg-transparent"
      />
      <a
        href={fileUrl}
        target="_blank"
        rel="noreferrer"
        className="absolute inset-0 z-10"
        aria-label={`Открыть PDF: ${title}`}
      />
    </>
  )
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
        <div className="flex flex-col gap-5">
          {items.map((item) => {
            const fileUrl = resolveMediaUrl(item.image)
            const pdf = isPdf(item.image)
            const issueDate = formatDate(item.issueDate)
            const meta = [item.issuer?.trim(), issueDate].filter(Boolean)
            const description = item.description?.trim()

            return (
              <article
                key={item.id}
                className="grid grid-cols-1 items-stretch gap-4 rounded-2xl border-2 border-foreground/20 bg-background p-3 transition-shadow hover:shadow-lg md:grid-cols-[200px_minmax(0,1fr)] md:gap-6 md:p-4"
              >
                <div className="relative mx-auto aspect-[3/4] w-full max-w-[200px] overflow-hidden rounded-xl border border-foreground/10 bg-stone-100 dark:bg-stone-900 md:mx-0 md:max-w-none">
                  <CertificateMedia title={item.title} fileUrl={fileUrl} pdf={pdf} />
                </div>

                <div className="flex min-w-0 flex-col justify-center py-1">
                  <h2 className="text-lg font-bold leading-snug text-foreground sm:text-xl">
                    {item.title}
                  </h2>
                  {meta.length > 0 && (
                    <p className="mt-1 text-sm text-muted-foreground">{meta.join(' · ')}</p>
                  )}
                  {description ? (
                    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/90 sm:text-base">
                      {description}
                    </p>
                  ) : null}
                  {item.credentialUrl?.trim() ? (
                    <a
                      href={item.credentialUrl.trim()}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 w-fit text-sm font-medium underline-offset-4 hover:underline"
                    >
                      Проверить credential
                    </a>
                  ) : null}
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
