'use client'

import { useEffect, useState } from 'react'
import { SiteShell } from '@/components/site/SiteShell'
import { SectionPage } from '@/components/site/SectionPage'
import { MeeloCard } from '@/components/site/MeeloUI'
import { api } from '@/lib/api'
import type { Profile } from '@/types/portfolio'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Partial<Profile> | null>(null)

  useEffect(() => {
    api
      .get<Partial<Profile>>('/api/profile')
      .then((data) => setProfile(data.fullName ? data : null))
      .catch(() => setProfile(null))
  }, [])

  return (
    <SiteShell>
      <SectionPage
        section="profile"
        pill="ABOUT"
        title="Больше обо мне"
        description="Личная информация, навыки и контакты из профиля."
        shape="circle"
        stamp="YEARS OF WORK"
      >
        {!profile ? (
          <p className="text-muted-foreground">Профиль пока не заполнен.</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <MeeloCard tone="white" className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{profile.fullName}</h2>
                {profile.title && <p className="mt-1 text-muted-foreground">{profile.title}</p>}
                {profile.location && (
                  <p className="mt-1 text-sm text-muted-foreground">{profile.location}</p>
                )}
              </div>
              {profile.bio && <p className="leading-relaxed text-foreground/90">{profile.bio}</p>}
              {profile.mbtiType && (
                <p className="text-sm text-muted-foreground">MBTI: {profile.mbtiType}</p>
              )}
            </MeeloCard>

            <div className="space-y-4">
              {!!profile.skills?.length && (
                <MeeloCard tone="lavender">
                  <h3 className="text-sm font-bold uppercase tracking-wide">Навыки</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border-2 border-foreground bg-background px-2.5 py-1 text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </MeeloCard>
              )}
              {!!profile.personalTraits?.length && (
                <MeeloCard tone="mint">
                  <h3 className="text-sm font-bold uppercase tracking-wide">Качества</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profile.personalTraits.map((trait) => (
                      <span
                        key={trait}
                        className="rounded-full border-2 border-foreground bg-background px-2.5 py-1 text-xs font-medium"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </MeeloCard>
              )}
            </div>
          </div>
        )}
      </SectionPage>
    </SiteShell>
  )
}
