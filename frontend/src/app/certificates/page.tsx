'use client'

import { useEffect, useState } from 'react'
import { SiteShell } from '@/components/site/SiteShell'
import { SectionPage } from '@/components/site/SectionPage'
import { MeeloCard } from '@/components/site/MeeloUI'
import { api, resolveMediaUrl } from '@/lib/api'
import type { Certificate } from '@/types/portfolio'

const TONES = ['sky', 'lavender', 'mint', 'pink'] as const

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
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item, index) => {
            const fileUrl = resolveMediaUrl(item.image)
            return (
              <MeeloCard key={item.id} tone={TONES[index % TONES.length]}>
                <h2 className="text-lg font-bold">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.issuer}
                  {item.issueDate ? ` · ${item.issueDate.slice(0, 10)}` : ''}
                </p>
                {item.description && (
                  <p className="mt-3 text-sm text-foreground/80">{item.description}</p>
                )}
                {fileUrl && (
                  <div className="mt-4">
                    {isPdf(item.image) ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block text-sm font-semibold underline-offset-4 hover:underline"
                      >
                        Открыть PDF
                      </a>
                    ) : (
                      <a href={fileUrl} target="_blank" rel="noreferrer" className="block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={fileUrl}
                          alt={item.title}
                          className="max-h-48 w-full rounded-xl border-2 border-foreground object-contain bg-background"
                        />
                      </a>
                    )}
                  </div>
                )}
                {item.credentialUrl && (
                  <a
                    href={item.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm font-semibold underline-offset-4 hover:underline"
                  >
                    Credential
                  </a>
                )}
              </MeeloCard>
            )
          })}
        </div>
        {items.length === 0 && <p className="text-muted-foreground">Пока нет записей.</p>}
      </SectionPage>
    </SiteShell>
  )
}
