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
              <article
                key={item.id}
                className="flex flex-col overflow-hidden rounded-2xl border-2 border-foreground/20 bg-background transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-100 dark:bg-stone-900">
                  {fileUrl ? (
                    pdf ? (
                      <>
                        {/* PDF preview — never use <img> for PDFs */}
                        <object
                          data={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                          type="application/pdf"
                          title={item.title}
                          className="pointer-events-none absolute inset-0 h-full w-full"
                        >
                          <iframe
                            src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                            title={item.title}
                            className="pointer-events-none absolute inset-0 h-full w-full border-0"
                          />
                        </object>
                        <div className="pointer-events-none absolute right-2 top-2 rounded-md border border-foreground/20 bg-background/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
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

                <div className="border-t border-foreground/10 px-3 py-2.5">
                  <h2 className="text-sm font-bold leading-tight text-foreground">{item.title}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {[item.issuer, item.issueDate?.slice(0, 10)].filter(Boolean).join(' · ')}
                  </p>
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
