'use client'

import { useEffect, useState } from 'react'
import { SiteShell } from '@/components/site/SiteShell'
import { SectionPage } from '@/components/site/SectionPage'
import { MeeloCard } from '@/components/site/MeeloUI'
import { api } from '@/lib/api'
import type { Certificate } from '@/types/portfolio'

const TONES = ['sky', 'lavender', 'mint', 'pink'] as const

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
          {items.map((item, index) => (
            <MeeloCard key={item.id} tone={TONES[index % TONES.length]}>
              <h2 className="text-lg font-bold">{item.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.issuer}
                {item.issueDate ? ` · ${item.issueDate.slice(0, 10)}` : ''}
              </p>
              {item.description && (
                <p className="mt-3 text-sm text-foreground/80">{item.description}</p>
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
          ))}
        </div>
        {items.length === 0 && <p className="text-muted-foreground">Пока нет записей.</p>}
      </SectionPage>
    </SiteShell>
  )
}
