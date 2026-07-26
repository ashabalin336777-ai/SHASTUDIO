'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { SiteShell } from '@/components/site/SiteShell'
import { SectionPage } from '@/components/site/SectionPage'
import { MeeloCard } from '@/components/site/MeeloUI'
import { api } from '@/lib/api'
import type { Profile } from '@/types/portfolio'
import { Mail, Phone, Send, Globe, MessageCircle } from 'lucide-react'

type ContactItem = {
  label: string
  value?: string | null
  href?: string
  icon: ReactNode
}

function normalizeUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value
  return `https://${value}`
}

function telegramHref(value: string) {
  const handle = value.replace(/^@/, '').replace(/^https?:\/\/(t\.me|telegram\.me)\//i, '')
  return `https://t.me/${handle}`
}

const TONES = ['lavender', 'mint', 'pink', 'sky', 'cream'] as const

export default function ContactsPage() {
  const [profile, setProfile] = useState<Partial<Profile> | null>(null)

  useEffect(() => {
    api
      .get<Partial<Profile>>('/api/profile')
      .then(setProfile)
      .catch(() => setProfile(null))
  }, [])

  const items: ContactItem[] = [
    {
      label: 'Сотовый',
      value: profile?.phone,
      href: profile?.phone ? `tel:${profile.phone.replace(/\s+/g, '')}` : undefined,
      icon: <Phone className="size-5" />,
    },
    {
      label: 'Email',
      value: profile?.email,
      href: profile?.email ? `mailto:${profile.email}` : undefined,
      icon: <Mail className="size-5" />,
    },
    {
      label: 'Telegram',
      value: profile?.telegram,
      href: profile?.telegram ? telegramHref(profile.telegram) : undefined,
      icon: <Send className="size-5" />,
    },
    {
      label: 'Max',
      value: profile?.max,
      href: profile?.max
        ? profile.max.startsWith('http')
          ? profile.max
          : `https://max.ru/${profile.max.replace(/^@/, '')}`
        : undefined,
      icon: <MessageCircle className="size-5" />,
    },
    {
      label: 'Сайт',
      value: profile?.website || 'shastudio.ru',
      href: normalizeUrl(profile?.website || 'https://shastudio.ru'),
      icon: <Globe className="size-5" />,
    },
  ]

  const visible = items.filter((item) => item.value)

  return (
    <SiteShell>
      <SectionPage
        section="contacts"
        pill="CONTACTS"
        title="Контакты"
        description="Связаться со мной удобным способом."
        stamp="LET'S TALK"
        shape="arch"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              target={item.href?.startsWith('http') ? '_blank' : undefined}
              rel={item.href?.startsWith('http') ? 'noreferrer' : undefined}
              className="block"
            >
              <MeeloCard tone={TONES[index % TONES.length]} className="h-full transition hover:-translate-y-0.5">
                <div className="flex items-start gap-4">
                  <span className="flex size-11 items-center justify-center rounded-full border-2 border-foreground bg-background">
                    {item.icon}
                  </span>
                  <span>
                    <span className="block text-sm text-muted-foreground">{item.label}</span>
                    <span className="mt-1 block text-lg font-bold">{item.value}</span>
                  </span>
                </div>
              </MeeloCard>
            </a>
          ))}
        </div>

        {visible.length === 0 && (
          <p className="text-muted-foreground">Контакты пока не заполнены.</p>
        )}
      </SectionPage>
    </SiteShell>
  )
}
