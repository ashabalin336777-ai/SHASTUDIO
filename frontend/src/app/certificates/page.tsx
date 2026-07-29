'use client'

import { useEffect, useState } from 'react'
import { SiteShell } from '@/components/site/SiteShell'
import { SectionPage } from '@/components/site/SectionPage'
import { api, resolveMediaUrl } from '@/lib/api'
import type { Certificate } from '@/types/portfolio'

function isPdf(url?: string | null) {
  return !!url && /\.pdf($|\?)/i.test(url)
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
          {items.map((item) => {
            const fileUrl = resolveMediaUrl(item.image)
            const pdf = isPdf(item.image)
            return (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl border-2 border-foreground/20 bg-background transition-shadow hover:shadow-lg"
              >
                {fileUrl ? (
                  pdf ? (
                    <iframe
                      src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                      title={item.title}
                      className="aspect-[3/4] w-full bg-stone-50 dark:bg-stone-900"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fileUrl}
                      alt={item.title}
                      className="aspect-[3/4] w-full object-contain bg-stone-50 p-2 dark:bg-stone-900"
                    />
                  )
                ) : (
                  <div className="flex aspect-[3/4] w-full items-center justify-center bg-stone-100 text-sm text-muted-foreground dark:bg-stone-800">
                    Нет превью
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-3 pb-3 pt-8">
                  <h2 className="text-sm font-bold leading-tight text-white drop-shadow-sm">
                    {item.title}
                  </h2>
                  <p className="mt-0.5 text-xs text-white/70">
                    {item.issuer}
                    {item.issueDate ? ` · ${item.issueDate.slice(0, 10)}` : ''}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        {items.length === 0 && <p className="text-muted-foreground">Пока нет записей.</p>}
      </SectionPage>
    </SiteShell>
  )
}
